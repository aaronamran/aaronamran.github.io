// SELinux engine: file contexts, booleans, port labels, audit log, AVC generation,
// ausearch / audit2allow / sealert, and a small web server model for curl.
// Part of Red Cat RHCSA Terminal Simulator
//
// File labels follow real semantics:
//  - labels are stored on nodes; new files inherit the label of their parent directory
//  - mv keeps the label, cp does not (unless --preserve=context / -a)
//  - restorecon applies the policy (fcontext) rules, chcon only changes the node
//  - semanage fcontext edits the policy, it does not touch any file

class SELinuxEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.selinux = this;
        this.mode = 'enforcing';
        this.serial = 1000;
        this.audit = [];                 // {time, serial, lines:[...], comm, avc:{...}}
        this.allowed = new Set();        // "src|tgt|class|perm" added by local policy modules
        this.permissiveDomains = new Set();
        this.modules = ['abrt', 'accountsd', 'apache', 'chronyd', 'cockpit', 'container', 'cron', 'firewalld', 'logrotate', 'mysql', 'nfs', 'ssh', 'sudo', 'systemd', 'unconfined', 'virt'];
        this.localFc = [];               // {pattern, type, ftype, user}
        this.equiv = [];                 // {src, dst}
        this.localPorts = [];            // {type, proto, ports:[a,b]}
        this.localBools = {};            // name -> persistent value (overrides default)

        this._seBuildTables();
        this._seEnsureFiles();
        this._seMaterialize();
    }

    // ===== policy tables =====

    _seBuildTables() {
        const R = (pattern, type, ftype = 'all files', user = 'system_u') => ({ pattern, type, ftype, user });
        this.defFc = [
            R('/.*', 'default_t'), R('/', 'root_t', 'directory'), R('/bin', 'bin_t', 'symbolic link'), R('/sbin', 'bin_t', 'symbolic link'), R('/lib', 'lib_t', 'symbolic link'), R('/lib64', 'lib_t', 'symbolic link'),
            R('/boot(/.*)?', 'boot_t'), R('/boot/efi(/.*)?', 'dosfs_t'), R('/dev(/.*)?', 'device_t'), R('/dev/null', 'null_device_t', 'character device'),
            R('/etc(/.*)?', 'etc_t'), R('/etc/shadow-?', 'shadow_t'), R('/etc/gshadow-?', 'shadow_t'), R('/etc/sudoers(\\.d(/.*)?)?', 'etc_t'), R('/etc/passwd-?', 'passwd_file_t'), R('/etc/group-?', 'passwd_file_t'),
            R('/etc/httpd(/.*)?', 'httpd_config_t'), R('/etc/nginx(/.*)?', 'httpd_config_t'), R('/etc/ssh/ssh_host_.*_key', 'sshd_key_t', 'regular file'), R('/etc/ssh/sshd_config', 'etc_t', 'regular file'),
            R('/etc/cron\\.d(/.*)?', 'system_cron_spool_t'), R('/etc/crontab', 'system_cron_spool_t', 'regular file'), R('/etc/fstab', 'etc_t', 'regular file'),
            R('/home', 'home_root_t', 'directory'), R('/home/[^/]+', 'user_home_dir_t', 'directory'), R('/home/[^/]+/.+', 'user_home_t'), R('/root', 'admin_home_t', 'directory'), R('/root(/.+)?', 'admin_home_t'),
            R('/media(/.*)?', 'mnt_t'), R('/mnt(/.*)?', 'mnt_t'), R('/opt(/.*)?', 'usr_t'), R('/proc(/.*)?', 'proc_t'), R('/run(/.*)?', 'var_run_t'), R('/run/user(/.*)?', 'user_tmp_t'),
            R('/srv(/.*)?', 'var_t'), R('/srv/([^/]*/)?www(/.*)?', 'httpd_sys_content_t'), R('/srv/([^/]*/)?ftp(/.*)?', 'public_content_t'), R('/sys(/.*)?', 'sysfs_t'),
            R('/tmp(/.*)?', 'tmp_t'), R('/var/tmp(/.*)?', 'tmp_t'),
            R('/usr(/.*)?', 'usr_t'), R('/usr/bin(/.*)?', 'bin_t'), R('/usr/sbin(/.*)?', 'bin_t'), R('/usr/lib(/.*)?', 'lib_t'), R('/usr/lib64(/.*)?', 'lib_t'), R('/usr/share(/.*)?', 'usr_t'),
            R('/usr/sbin/httpd', 'httpd_exec_t', 'regular file'), R('/usr/sbin/sshd', 'sshd_exec_t', 'regular file'), R('/usr/sbin/nginx', 'httpd_exec_t', 'regular file'), R('/usr/sbin/chronyd', 'chronyd_exec_t', 'regular file'),
            R('/var(/.*)?', 'var_t'), R('/var/log(/.*)?', 'var_log_t'), R('/var/log/audit(/.*)?', 'auditd_log_t'), R('/var/log/httpd(/.*)?', 'httpd_log_t'), R('/var/log/nginx(/.*)?', 'httpd_log_t'), R('/var/log/messages(-.*)?', 'var_log_t', 'regular file'), R('/var/log/secure(-.*)?', 'var_log_t', 'regular file'),
            R('/var/lib(/.*)?', 'var_lib_t'), R('/var/lib/mysql(/.*)?', 'mysqld_db_t'), R('/var/lib/containers(/.*)?', 'container_var_lib_t'), R('/var/lib/nfs(/.*)?', 'var_lib_nfs_t'),
            R('/var/spool(/.*)?', 'var_spool_t'), R('/var/spool/cron(/.*)?', 'user_cron_spool_t'), R('/var/spool/at(/.*)?', 'at_spool_t'), R('/var/run(/.*)?', 'var_run_t'), R('/var/cache(/.*)?', 'var_t'),
            R('/var/www(/.*)?', 'httpd_sys_content_t'), R('/var/www/html(/.*)?', 'httpd_sys_content_t'), R('/var/www/cgi-bin(/.*)?', 'httpd_sys_script_exec_t'), R('/var/www/icons(/.*)?', 'httpd_sys_content_t'),
            R('/var/ftp(/.*)?', 'public_content_t'), R('/usr/share/nginx/html(/.*)?', 'httpd_sys_content_t'), R('/home/[^/]+/public_html(/.*)?', 'httpd_user_content_t'), R('/export(/.*)?', 'default_t')
        ].filter(r => r.pattern !== '/export(/.*)?');
        this.allTypes = new Set(['default_t', 'root_t', 'bin_t', 'lib_t', 'boot_t', 'dosfs_t', 'device_t', 'null_device_t', 'etc_t', 'shadow_t', 'passwd_file_t', 'httpd_config_t', 'sshd_key_t', 'system_cron_spool_t', 'home_root_t', 'user_home_dir_t', 'user_home_t', 'admin_home_t', 'mnt_t', 'usr_t', 'proc_t', 'var_run_t', 'user_tmp_t', 'var_t', 'httpd_sys_content_t', 'httpd_sys_rw_content_t', 'httpd_sys_ra_content_t', 'httpd_sys_script_exec_t', 'httpd_user_content_t', 'httpd_log_t', 'httpd_cache_t', 'httpd_exec_t', 'httpd_tmp_t', 'public_content_t', 'public_content_rw_t', 'sysfs_t', 'tmp_t', 'var_log_t', 'auditd_log_t', 'var_lib_t', 'mysqld_db_t', 'container_var_lib_t', 'container_file_t', 'var_lib_nfs_t', 'var_spool_t', 'user_cron_spool_t', 'at_spool_t', 'samba_share_t', 'nfs_t', 'cifs_t', 'ftpd_exec_t', 'sshd_exec_t', 'chronyd_exec_t', 'svirt_image_t', 'ssh_home_t', 'user_tmp_t', 'tmp_t', 'removable_t', 'iso9660_t', 'fusefs_t', 'xserver_tmp_t', 'cert_t', 'unlabeled_t', 'mysqld_etc_t', 'named_zone_t', 'postgresql_db_t', 'rsync_data_t', 'rsync_t', 'tftpdir_t', 'tftpdir_rw_t', 'systemd_unit_file_t', 'locale_t', 'man_t', 'shell_exec_t', 'sudo_exec_t', 'ld_so_t', 'initrc_exec_t', 'krb5_conf_t']);
        // booleans: [name, default, description]
        const B = [
            ['abrt_anon_write', 0, 'Allow ABRT to modify public files used for public file transfer services.'], ['allow_ypbind', 0, 'Allow system to run with NIS'], ['container_connect_any', 0, 'Allow containers to connect to all ports'], ['container_manage_cgroup', 0, 'Allow containers to manage cgroup (systemd)'],
            ['daemons_dump_core', 0, 'Allow all daemons to write corefiles to /'], ['domain_kernel_load_modules', 0, 'Allow all domains to have the kernel load modules'], ['ftp_home_dir', 0, 'Allow ftp to read and write files in the user home directories'], ['ftpd_anon_write', 0, 'Allow ftpd to anonymously write files'],
            ['ftpd_connect_all_unreserved', 0, 'Allow ftpd to connect to all unreserved ports'], ['ftpd_full_access', 0, 'Allow ftpd to full access'], ['ftpd_use_nfs', 0, 'Allow ftpd to use nfs'], ['httpd_anon_write', 0, 'Allow httpd to anon write'],
            ['httpd_builtin_scripting', 1, 'Allow httpd to use built in scripting (usually php)'], ['httpd_can_check_spam', 0, 'Allow http daemon to check spam'], ['httpd_can_network_connect', 0, 'Allow HTTPD scripts and modules to connect to the network using TCP.'], ['httpd_can_network_connect_db', 0, 'Allow HTTPD scripts and modules to connect to databases over the network.'],
            ['httpd_can_network_memcache', 0, 'Allow httpd to can network memcache'], ['httpd_can_sendmail', 0, 'Allow http daemon to send mail'], ['httpd_dbus_avahi', 0, 'Allow httpd to dbus avahi'], ['httpd_enable_cgi', 1, 'Allow httpd cgi support'],
            ['httpd_enable_ftp_server', 0, 'Allow httpd to act as a FTP server by listening on the ftp port.'], ['httpd_enable_homedirs', 0, 'Allow httpd to read home directories'], ['httpd_execmem', 0, 'Allow httpd scripts and modules execmem/execstack'], ['httpd_graceful_shutdown', 0, 'Allow HTTPD to connect to port 80 for graceful shutdown'],
            ['httpd_read_user_content', 0, 'Allow httpd to read user content'], ['httpd_run_stickshift', 0, 'Allow httpd to run stickshift'], ['httpd_setrlimit', 0, 'Allow httpd to set rlimit'], ['httpd_ssi_exec', 0, 'Allow httpd to use mod_ssi exec'],
            ['httpd_tmp_exec', 0, 'Allow Apache to execute tmp content.'], ['httpd_tty_comm', 0, 'Unify HTTPD to communicate with the terminal. Needed for entering the passphrase for certificates at the terminal.'], ['httpd_unified', 0, 'Unify HTTPD handling of all content files.'],
            ['httpd_use_cifs', 0, 'Allow httpd to access cifs file systems'], ['httpd_use_fusefs', 0, 'Allow httpd to access FUSE file systems'], ['httpd_use_nfs', 0, 'Allow httpd to access nfs file systems'], ['httpd_verify_dns', 0, 'Allow httpd to verify DNS'],
            ['mount_anyfile', 1, 'Allow mount to mount any file'], ['mysql_connect_any', 0, 'Allow mysqld to connect to all ports'], ['nfs_export_all_ro', 1, 'Allow nfs to export all read only'], ['nfs_export_all_rw', 1, 'Allow nfs to export all read write'],
            ['postgresql_can_rsync', 0, 'Allow pgsql to rsync'], ['samba_enable_home_dirs', 0, 'Allow samba to share users home directories.'], ['samba_export_all_ro', 0, 'Allow samba to share any file/directory read only.'], ['samba_export_all_rw', 0, 'Allow samba to share any file/directory read/write.'],
            ['secure_mode_policyload', 0, 'Boolean to determine whether the system permits loading policy, setting enforcing mode, and changing boolean values.'], ['selinuxuser_execmem', 1, 'Allow unconfined users to execute code that requires executable memory'], ['selinuxuser_execstack', 1, 'Allow unconfined users to execute code that requires executable stack'], ['selinuxuser_ping', 1, 'Allow confined users to ping'],
            ['ssh_chroot_rw_homedirs', 0, 'Allow ssh with chroot env to read and write files in the user home directories'], ['ssh_sysadm_login', 0, 'Allow ssh logins as sysadm_r:sysadm_t'], ['use_nfs_home_dirs', 0, 'Support NFS home directories'], ['use_samba_home_dirs', 0, 'Support SAMBA home directories'],
            ['virt_use_nfs', 0, 'Allow virt to use nfs'], ['virt_use_samba', 0, 'Allow virt to use samba']
        ];
        this.bools = {};
        for (const [n, d, desc] of B) this.bools[n] = { cur: !!d, def: !!d, desc };
        // port types: type -> {tcp:[...], udp:[...]}  (ranges as "a-b")
        this.defPorts = {
            ssh_port_t: { tcp: ['22'] }, http_port_t: { tcp: ['80', '81', '443', '488', '8008', '8009', '8443', '9000'] }, http_cache_port_t: { tcp: ['8080', '8118', '8123', '10001-10010'], udp: ['3130'] },
            ftp_port_t: { tcp: ['21', '989', '990'] }, ftp_data_port_t: { tcp: ['20'] }, ntp_port_t: { udp: ['123'] }, mysqld_port_t: { tcp: ['1186', '3306', '63132-63164'] },
            postgresql_port_t: { tcp: ['5432', '9898'] }, smtp_port_t: { tcp: ['25', '465', '587'] }, pop_port_t: { tcp: ['106', '110', '995'] }, imap_port_t: { tcp: ['143', '993'] },
            dns_port_t: { tcp: ['53'], udp: ['53'] }, dhcpd_port_t: { udp: ['67', '547', '548'] }, samba_port_t: { tcp: ['137-139', '445'], udp: ['137-139', '445'] }, nfs_port_t: { tcp: ['2049'], udp: ['2049'] },
            rpc_port_t: { tcp: ['111'], udp: ['111'] }, ldap_port_t: { tcp: ['389', '636', '3268'] }, snmp_port_t: { udp: ['161', '162'], tcp: ['161', '162'] }, syslogd_port_t: { udp: ['514', '601'], tcp: ['514', '601', '20514'] },
            telnetd_port_t: { tcp: ['23'] }, tftp_port_t: { udp: ['69'] }, vnc_port_t: { tcp: ['5900-5999'] }, squid_port_t: { tcp: ['3128', '3401', '4827'] }, git_port_t: { tcp: ['9418'] },
            kerberos_port_t: { tcp: ['88', '464'], udp: ['88', '464'] }, pegasus_http_port_t: { tcp: ['5988'] }, pegasus_https_port_t: { tcp: ['5989'] }, ntop_port_t: { tcp: ['3000-3001'], udp: ['3000-3001'] },
            reserved_port_t: { tcp: ['1-511'], udp: ['1-511'] }, hi_reserved_port_t: { tcp: ['512-1023'], udp: ['512-1023'] }, unreserved_port_t: { tcp: ['1024-32767'], udp: ['1024-32767'] }, ephemeral_port_t: { tcp: ['32768-60999'], udp: ['32768-60999'] },
            cockpit_port_t: { tcp: ['9090'] }, jboss_management_port_t: { tcp: ['4447', '7600', '9123', '9990', '9999'] }, memcache_port_t: { tcp: ['11211'], udp: ['11211'] }, redis_port_t: { tcp: ['6379', '16379', '26379'] },
            mongod_port_t: { tcp: ['27017-27019', '28017-28019'] }, zabbix_port_t: { tcp: ['10050-10051'] }, amqp_port_t: { tcp: ['5671-5672'] }, container_port_t: { tcp: ['2375'] }
        };
        // which port types a domain may name_bind / connect to
        this.domainPorts = {
            httpd_t: ['http_port_t', 'http_cache_port_t', 'ntop_port_t', 'pegasus_http_port_t', 'pegasus_https_port_t'], sshd_t: ['ssh_port_t'], mysqld_t: ['mysqld_port_t'], ftpd_t: ['ftp_port_t', 'ftp_data_port_t'],
            chronyd_t: ['ntp_port_t'], postgresql_t: ['postgresql_port_t'], named_t: ['dns_port_t'], smbd_t: ['samba_port_t'], squid_t: ['squid_port_t', 'http_cache_port_t']
        };
        this.domainExec = { httpd_t: '/usr/sbin/httpd', sshd_t: '/usr/sbin/sshd', mysqld_t: '/usr/libexec/mysqld', ftpd_t: '/usr/sbin/vsftpd', chronyd_t: '/usr/sbin/chronyd', postgresql_t: '/usr/bin/postmaster' };
        // file types a domain may read
        this.httpdReadable = new Set(['httpd_sys_content_t', 'httpd_sys_rw_content_t', 'httpd_sys_ra_content_t', 'httpd_sys_script_exec_t', 'httpd_user_content_t', 'httpd_config_t', 'httpd_log_t', 'httpd_cache_t', 'httpd_tmp_t', 'httpd_exec_t', 'public_content_t', 'public_content_rw_t', 'etc_t', 'usr_t', 'lib_t', 'bin_t', 'locale_t', 'var_lib_t']);
    }

    _seEnsureFiles() {
        const ensure = (path, content, perms = '0644', owner = 'root', group = 'root') => {
            const parts = path.split('/').filter(Boolean);
            const name = parts.pop();
            let cur = this.fs.fs['/'];
            for (const p of parts) {
                if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
                cur = cur.children[p];
            }
            if (!cur.children[name]) cur.children[name] = { type: 'file', permissions: perms, owner, group, size: content.length, modified: new Date(), content };
            else if (content !== null) { /* keep existing file */ }
            return cur.children[name];
        };
        const cfg = this.fs.getNode('/etc/selinux/config');
        const cfgText = '\n# This file controls the state of SELinux on the system.\n# SELINUX= can take one of these three values:\n#     enforcing - SELinux security policy is enforced.\n#     permissive - SELinux prints warnings instead of enforcing.\n#     disabled - No SELinux policy is loaded.\n# See also:\n# https://docs.fedoraproject.org/en-US/quick-docs/getting-started-with-selinux/#getting-started-with-selinux-selinux-states-and-modes\n#\n# NOTE: In earlier Fedora kernel builds, SELINUX=disabled would also\n# fully disable SELinux during boot. If you need a system with SELinux\n# fully disabled instead of one with SELinux in permissive mode, use\n# the kernel boot parameter "selinux=0".\nSELINUX=enforcing\n# SELINUXTYPE= can take one of these three values:\n#     targeted - Targeted processes are protected,\n#     minimum - Modification of targeted policy. Only selected processes are protected.\n#     mls - Multi Level Security protection.\nSELINUXTYPE=targeted\n\n\n';
        if (cfg) { cfg.content = cfgText; cfg.size = cfgText.length; } else ensure('/etc/selinux/config', cfgText);
        ensure('/etc/httpd/conf/httpd.conf', 'ServerRoot "/etc/httpd"\n\n#\n# Listen: Allows you to bind Apache to specific IP addresses and/or\n# ports, instead of the default. See also the <VirtualHost>\n# directive.\n#\nListen 80\n\nInclude conf.modules.d/*.conf\n\nUser apache\nGroup apache\n\nServerAdmin root@localhost\n\n<Directory />\n    AllowOverride none\n    Require all denied\n</Directory>\n\nDocumentRoot "/var/www/html"\n\n<Directory "/var/www">\n    AllowOverride None\n    Require all granted\n</Directory>\n\n<Directory "/var/www/html">\n    Options Indexes FollowSymLinks\n    AllowOverride None\n    Require all granted\n</Directory>\n\nDirectoryIndex index.html\n\nErrorLog "logs/error_log"\nLogLevel warn\n\nIncludeOptional conf.d/*.conf\n');
        const ssh = this.fs.getNode('/etc/ssh/sshd_config');
        const sshText = '#\t$OpenBSD: sshd_config,v 1.104 2021/07/02 05:11:21 dtucker Exp $\n\n# This is the sshd server system-wide configuration file.  See\n# sshd_config(5) for more information.\n\n# Include the crypto policy\nInclude /etc/crypto-policies/back-ends/opensshserver.config\n\n#Port 22\n#AddressFamily any\n#ListenAddress 0.0.0.0\n#ListenAddress ::\n\nHostKey /etc/ssh/ssh_host_rsa_key\nHostKey /etc/ssh/ssh_host_ecdsa_key\nHostKey /etc/ssh/ssh_host_ed25519_key\n\n# Logging\n#SyslogFacility AUTH\nSyslogFacility AUTHPRIV\n#LogLevel INFO\n\n# Authentication:\n\n#LoginGraceTime 2m\nPermitRootLogin yes\n#StrictModes yes\n#MaxAuthTries 6\n#MaxSessions 10\n\n#PubkeyAuthentication yes\nAuthorizedKeysFile\t.ssh/authorized_keys\n\nPasswordAuthentication yes\n#PermitEmptyPasswords no\n\n#UsePAM no\nUsePAM yes\n\nX11Forwarding yes\n\nSubsystem\tsftp\t/usr/libexec/openssh/sftp-server\n';
        if (ssh && ssh.type === 'file') { ssh.content = sshText; ssh.size = sshText.length; } else ensure('/etc/ssh/sshd_config', sshText, '0600');
        ensure('/var/www/html/.keep', '');
        const keep = this.fs.getNode('/var/www/html/.keep');
        if (keep) { const dir = this.fs.getNode('/var/www/html'); delete dir.children['.keep']; }
        ensure('/var/log/audit/audit.log', '', '0600');
        ensure('/var/log/messages', '', '0600');
    }

    // ===== labels =====

    _seWalk(node, path, fn) {
        fn(node, path);
        if (node.type === 'directory') for (const [n, c] of Object.entries(node.children || {})) this._seWalk(c, (path === '/' ? '' : path) + '/' + n, fn);
    }

    _seMaterialize() {
        this._seWalk(this.fs.fs['/'], '/', (node, path) => {
            if (!node.selinux) {
                const type = this.defaultType(path, node.type);
                node.selinux = { user: 'system_u', role: 'object_r', type, level: 's0' };
            }
        });
    }

    _stem(p) { const m = /[(\[.*?+|{\\]/.exec(p); return m ? m.index : p.length; }

    _ftypeOk(ftype, nodeType) {
        if (ftype === 'all files') return true;
        return ({ directory: 'directory', 'regular file': 'file', 'symbolic link': 'symlink', 'character device': 'file', 'block device': 'file' }[ftype] || 'x') === nodeType;
    }

    _translate(path) {
        for (const e of this.equiv) if (path === e.dst || path.startsWith(e.dst + '/')) return e.src + path.slice(e.dst.length);
        return path;
    }

    // best matching rule (longest literal stem; local rules win ties)
    defaultRule(path, nodeType) {
        const p = this._translate(path);
        let best = null, bestStem = -1;
        const consider = (r, local) => {
            if (!this._ftypeOk(r.ftype, nodeType)) return;
            let re;
            try { re = new RegExp('^(?:' + r.pattern + ')$'); } catch (e) { return; }
            if (!re.test(p)) return;
            const stem = this._stem(r.pattern);
            if (stem > bestStem || (stem === bestStem && local)) { best = r; bestStem = stem; }
        };
        this.defFc.forEach(r => consider(r, false));
        this.localFc.forEach(r => consider(r, true));
        return best;
    }

    defaultType(path, nodeType) { const r = this.defaultRule(path, nodeType); return r ? r.type : 'default_t'; }

    _ancestors(path) {
        const parts = path.split('/').filter(Boolean);
        const nodes = [];
        let cur = this.fs.fs['/'];
        nodes.push({ path: '/', node: cur });
        let acc = '';
        for (const p of parts) {
            if (!cur.children || !cur.children[p]) break;
            cur = cur.children[p];
            acc += '/' + p;
            nodes.push({ path: acc, node: cur });
        }
        return nodes;
    }

    // effective label: explicit, else inherited from the parent
    label(path, node) {
        const full = this._abs(path);
        const chain = this._ancestors(full);
        let last = null;
        for (const { node: n } of chain) if (n.selinux) last = n.selinux;
        if (node && node.selinux) return node.selinux;
        const own = chain.length && chain[chain.length - 1].path === full ? chain[chain.length - 1].node : node;
        if (own && own.selinux) return own.selinux;
        return last ? { user: 'unconfined_u', role: 'object_r', type: last.type, level: last.level || 's0' } : { user: 'system_u', role: 'object_r', type: 'default_t', level: 's0' };
    }

    _abs(p) { return this.fs.resolvePath(p); }

    ctxStr(c) { return `${c.user}:${c.role}:${c.type}:${c.level || 's0'}`; }

    seLabel(path, node) { return this.label(path, node); }

    // freeze inherited labels under path (called before mv)
    freeze(path) {
        const full = this._abs(path);
        const n = this.fs.getNode(full);
        if (!n) return;
        this._seWalk(n, full, (node, p) => { if (!node.selinux) node.selinux = this.label(p, node); });
    }

    // apply the policy defaults to a tree (restorecon -R)
    seRestoreTree(path, opts = {}) {
        const full = this._abs(path);
        const n = this.fs.getNode(full);
        const changes = [];
        if (!n) return changes;
        if (!opts.dry) this.freeze(path);   // unlabeled children report the label they actually had
        this._seWalk(n, full, (node, p) => {
            const cur = this.label(p, node);
            const want = this.defaultType(p, node.type);
            if (cur.type !== want || (opts.force && cur.user !== 'system_u')) {
                const next = { user: opts.force ? 'system_u' : cur.user, role: 'object_r', type: want, level: 's0' };
                changes.push({ path: p, from: this.ctxStr(cur), to: this.ctxStr(next) });
                if (!opts.dry) node.selinux = next;
            } else if (!node.selinux && !opts.dry) node.selinux = cur;
            if (opts.noRecurse) return;
        });
        return opts.noRecurse ? changes.filter(c => c.path === full) : changes;
    }

    // ===== hooks into other commands =====

    installHooks(parent) {
        const wrap = (name, fn) => { const orig = parent[name]; parent[name] = (args, stdin) => fn(orig, args, stdin); };
        parent.seCheckBind = (name, def, p) => this.checkBind(name, def, p);
        parent.seRestoreTree = (p, o) => this.seRestoreTree(p, o);
        parent.seLabel = (p, n) => this.label(p, n);
        // mv keeps labels
        wrap('mv', (orig, args, stdin) => {
            for (const a of args.filter(x => !x.startsWith('-')).slice(0, -1)) this.freeze(a);
            return orig(args, stdin);
        });
        // cp: new copies get the label of the destination directory unless context is preserved
        wrap('cp', (orig, args, stdin) => {
            const ops = args.filter(x => !x.startsWith('-'));
            const preserve = args.some(a => a === '-a' || a === '--archive' || a === '--preserve=all' || a === '--preserve=context' || /^-[a-zA-Z]*a/.test(a) && !a.startsWith('--') || a === '-Z');
            if (preserve) ops.slice(0, -1).forEach(s => this.freeze(s));
            const dest = ops[ops.length - 1];
            const before = new Set();
            const dnode = dest && this.fs.getNode(dest);
            if (dnode && dnode.children) Object.keys(dnode.children).forEach(k => before.add(k));
            const res = orig(args, stdin);
            if (!preserve && ops.length >= 2 && !res.error && !res.stderr) {
                const dn = this.fs.getNode(dest);
                const targets = [];
                if (dn && dn.type === 'directory') for (const s of ops.slice(0, -1)) targets.push(dest.replace(/\/$/, '') + '/' + this.fs.getBasename(s));
                else targets.push(dest);
                for (const t of targets) {
                    const tn = this.fs.getNode(t);
                    if (tn) this._seWalk(tn, this._abs(t), (n) => { delete n.selinux; });
                }
            }
            return res;
        });
    }

    // ===== audit =====

    _auditStamp(d) {
        const p = (n, w = 2) => String(n).padStart(w, '0');
        return { std: `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2)} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} ${d.getUTCFullYear()}`, interp: `${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}.${p(d.getUTCMilliseconds(), 3)}` };
    }

    _isPermissive(domain) { return this.mode === 'permissive' || this.permissiveDomains.has(domain); }

    // record an AVC. returns true when it was denied (enforcing), false when only logged
    logAvc(a) {
        const key = `${a.src}|${a.tcontext.type}|${a.tclass}|${a.perm}`;
        if (this.allowed.has(key)) return false;
        const permissive = this._isPermissive(a.src);
        const d = new Date();
        const serial = ++this.serial;
        const epoch = (d.getTime() / 1000).toFixed(3);
        const pid = a.pid || (this.shared.processes.find(p => p.comm === a.comm) || { pid: 1337 }).pid;
        const scontext = `system_u:system_r:${a.src}:s0`;
        const tctx = this.ctxStr(a.tcontext);
        const extra = a.name ? `name="${a.name}" dev="dm-0" ino=${100000 + (serial % 90000)} ` : (a.port ? `src=${a.port} ` : '');
        const pathPart = a.path && !a.name ? `path="${a.path}" dev="dm-0" ino=${100000 + (serial % 90000)} ` : '';
        const avc = `type=AVC msg=audit(${epoch}:${serial}): avc:  denied  { ${a.perm} } for  pid=${pid} comm="${a.comm}" ${extra}${pathPart}scontext=${scontext} tcontext=${tctx} tclass=${a.tclass} permissive=${permissive ? 1 : 0}`;
        const syscall = `type=SYSCALL msg=audit(${epoch}:${serial}): arch=c000003e syscall=${a.perm === 'name_bind' ? 49 : 262} success=${permissive ? 'yes' : 'no'} exit=${permissive ? 0 : -13} a0=${a.perm === 'name_bind' ? 4 : 'ffffff9c'} a1=7ffd5d4c6bd0 a2=${a.perm === 'name_bind' ? '1c' : '7ffd5d4c6d20'} a3=0 items=0 ppid=1 pid=${pid} auid=4294967295 uid=${a.user === 'apache' ? 48 : 0} gid=${a.user === 'apache' ? 48 : 0} euid=${a.user === 'apache' ? 48 : 0} suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 tty=(none) ses=4294967295 comm="${a.comm}" exe="${a.exe}" subj=${scontext} key=(null)ARCH=x86_64 SYSCALL=${a.perm === 'name_bind' ? 'bind' : 'newfstatat'} AUID="unset" UID="${a.user || 'root'}" GID="${a.user || 'root'}" EUID="${a.user || 'root'}" SUID="root" FSUID="root" EGID="root" SGID="root" FSGID="root"`;
        const ev = { time: d, serial, comm: a.comm, exe: a.exe, avc, syscall, src: a.src, tcontext: a.tcontext, tclass: a.tclass, perm: a.perm, port: a.port, name: a.name, path: a.path, permissive, proto: a.proto };
        this.audit.push(ev);
        this._flushAudit();
        // setroubleshoot logs a summary to /var/log/messages when installed
        if (this.shared.installedPackages.includes('setroubleshoot-server')) {
            const msgs = this.fs.getNode('/var/log/messages');
            if (msgs) {
                const what = a.perm === 'name_bind' ? `from name_bind access on the ${a.tclass} port ${a.port}` : `from ${a.perm} access on the ${a.tclass} ${a.path || a.name}`;
                const line = `${this._auditStamp(d).std.slice(4, 15)} rhcsa-lab setroubleshoot[${pid + 1}]: SELinux is preventing ${a.exe} ${what}. For complete SELinux messages run: sealert -l ${this._uuidFor(ev)}\n`;
                msgs.content += line; msgs.size = msgs.content.length;
            }
        }
        return !permissive;
    }

    _uuidFor(ev) { const h = (n) => ((ev.serial * 2654435761 + n * 40503) >>> 0).toString(16).padStart(8, '0'); return `${h(1)}-${h(2).slice(0, 4)}-${h(3).slice(0, 4)}-${h(4).slice(0, 4)}-${h(5)}${h(6).slice(0, 4)}`; }

    _flushAudit() {
        const node = this.fs.getNode('/var/log/audit/audit.log');
        if (!node) return;
        node.content = this.audit.map(e => `${e.syscall}\n${e.avc}`).join('\n') + (this.audit.length ? '\n' : '');
        node.size = node.content.length;
        node.modified = new Date();
    }

    portType(port, proto) {
        let best = null, bestSpan = Infinity;
        const check = (type, p) => {
            for (const r of p) {
                const [a, b] = String(r).split('-').map(Number);
                const hi = b === undefined ? a : b;
                if (port >= a && port <= hi) { const span = hi - a; if (span < bestSpan) { best = type; bestSpan = span; } }
            }
        };
        for (const [t, m] of Object.entries(this.defPorts)) check(t, m[proto] || []);
        for (const lp of this.localPorts) if (lp.proto === proto) check(lp.type, lp.ports.map(String));
        return best || 'unreserved_port_t';
    }

    // used by systemctl start: would the unit's domain be denied when it binds its port?
    checkBind(name, def, p) {
        if (this.mode === 'disabled' || !def.domain) return { denied: false };
        const ptype = this.portType(p.port, p.proto);
        const allowedTypes = this.domainPorts[def.domain] || [];
        if (allowedTypes.includes(ptype)) return { denied: false };
        const exe = this.domainExec[def.domain] || '/usr/sbin/' + (def.comm || name);
        const denied = this.logAvc({ src: def.domain, comm: def.comm, exe, perm: 'name_bind', tclass: p.proto + '_socket', tcontext: { user: 'system_u', role: 'object_r', type: ptype, level: 's0' }, port: p.port, proto: p.proto });
        return { denied };
    }

    // ===== commands: mode =====

    getenforce() { return this._ok(this.mode === 'disabled' ? 'Disabled' : this.mode === 'enforcing' ? 'Enforcing' : 'Permissive'); }

    setenforce(args) {
        if (this.mode === 'disabled') return this._err('setenforce: SELinux is disabled');
        if (!this._isRoot()) return this._err('setenforce:  setenforce() failed');
        const v = (args[0] || '').toLowerCase();
        if (v === '1' || v === 'enforcing') this.mode = 'enforcing';
        else if (v === '0' || v === 'permissive') this.mode = 'permissive';
        else return this._err('usage:  setenforce [ Enforcing | Permissive | 1 | 0 ]', 1);
        return this._ok();
    }

    sestatus(args) {
        const cfg = this.fs.getNode('/etc/selinux/config');
        const m = /^SELINUX=(\w+)/m.exec((cfg && cfg.content) || '');
        const fromCfg = m ? m[1] : 'enforcing';
        const lines = [
            'SELinux status:                 enabled', 'SELinuxfs mount:                /sys/fs/selinux', 'SELinux root directory:         /etc/selinux', 'Loaded policy name:             targeted',
            `Current mode:                   ${this.mode}`, `Mode from config file:          ${fromCfg}`, 'Policy MLS status:              enabled', 'Policy deny_unknown status:     allowed', 'Memory protection checking:     actual (secure)', 'Max kernel policy version:      33'
        ];
        if (args.includes('-b')) {
            lines.push('', 'Policy booleans:');
            for (const n of Object.keys(this.bools).sort()) lines.push(`${n.padEnd(40)}${this.bools[n].cur ? 'on' : 'off'}`);
        }
        if (args.includes('-v')) {
            lines.push('', 'Process contexts:', 'Current context:                unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023', 'Init context:                   system_u:system_r:init_t:s0', '/usr/sbin/sshd                  system_u:system_r:sshd_t:s0-s0:c0.c1023', '', 'File contexts:', 'Controlling terminal:           unconfined_u:object_r:user_devpts_t:s0', '/etc/passwd                     system_u:object_r:passwd_file_t:s0', '/etc/shadow                     system_u:object_r:shadow_t:s0', '/bin/bash                       system_u:object_r:shell_exec_t:s0', '/bin/login                      system_u:object_r:login_exec_t:s0', '/bin/sh                         system_u:object_r:bin_t:s0 -> system_u:object_r:shell_exec_t:s0', '/sbin/agetty                    system_u:object_r:getty_exec_t:s0', '/sbin/init                      system_u:object_r:bin_t:s0 -> system_u:object_r:init_exec_t:s0', '/usr/sbin/sshd                  system_u:object_r:sshd_exec_t:s0');
        }
        return this._ok(lines.join('\n'));
    }

    // ===== booleans =====

    getsebool(args) {
        const names = args.filter(a => !a.startsWith('-'));
        if (args.includes('-a')) return this._ok(Object.keys(this.bools).sort().map(n => `${n} --> ${this.bools[n].cur ? 'on' : 'off'}`).join('\n'));
        if (!names.length) return this._err('Error: you must specify the boolean name or -a', 1);
        const out = [], errs = [];
        for (const n of names) {
            if (!this.bools[n]) { errs.push(`getsebool:  SELinux boolean ${n} does not exist.`); continue; }
            out.push(`${n} --> ${this.bools[n].cur ? 'on' : 'off'}`);
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 255 : 0 };
    }

    setsebool(args) {
        const persistent = args.includes('-P');
        const rest = args.filter(a => !a.startsWith('-'));
        if (!rest.length) return this._err('Usage:  setsebool [ -P ] boolean value | bool1=val1 bool2=val2...', 1);
        if (!this._isRoot()) return this._err('Could not change active booleans. Please try as root: Permission denied', 255);
        const pairs = [];
        if (rest.some(r => r.includes('='))) rest.forEach(r => { const [k, v] = r.split('='); pairs.push([k, v]); });
        else if (rest.length % 2 === 0) for (let i = 0; i < rest.length; i += 2) pairs.push([rest[i], rest[i + 1]]);
        else return this._err('Usage:  setsebool [ -P ] boolean value | bool1=val1 bool2=val2...', 1);
        const parse = (v) => { const s = String(v).toLowerCase(); if (['on', '1', 'true'].includes(s)) return true; if (['off', '0', 'false'].includes(s)) return false; return null; };
        for (const [k, v] of pairs) {
            if (!this.bools[k]) return this._err(`Could not change active booleans: Boolean ${k} is not defined`, 255);
            if (parse(v) === null) return this._err(`Error: boolean ${k} must be set to on/off, 1/0 or true/false`, 255);
        }
        for (const [k, v] of pairs) { this.bools[k].cur = parse(v); if (persistent) this.bools[k].def = parse(v); }
        return this._ok();
    }

    // ===== restorecon / chcon / matchpathcon =====

    restorecon(args) {
        const flags = args.filter(a => a.startsWith('-')).join('');
        const paths = args.filter(a => !a.startsWith('-'));
        if (!paths.length) return this._err('usage:  restorecon [-iIDFmnprRv0xT] [-e excludedir] pathname...\nusage:  restorecon -f filename [-iIDFmnprRv0xT] [-e excludedir]', 1);
        if (!this._isRoot()) return this._err(`restorecon: Could not set context for ${paths[0]}:  Permission denied`, 255);
        const recurse = /R|r/.test(flags);
        const verbose = /v/.test(flags) || /n/.test(flags) && /v/.test(flags);
        const dry = /n/.test(flags);
        const out = [], errs = [];
        for (const p of paths) {
            const n = this.fs.getNode(p);
            if (!n) { errs.push(`restorecon: lstat(${p}) failed: No such file or directory`); continue; }
            const ch = this.seRestoreTree(p, { dry, force: /F/.test(flags), noRecurse: !recurse });
            if (verbose) ch.forEach(c => out.push(`${dry ? 'Would relabel' : 'Relabeled'} ${c.path} from ${c.from} to ${c.to}`));
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 255 : 0 };
    }

    chcon(args) {
        const opts = { t: null, u: null, r: null, l: null, ref: null, R: false, v: false };
        const rest = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-t' || a === '--type') opts.t = args[++i];
            else if (a.startsWith('--type=')) opts.t = a.slice(7);
            else if (a === '-u' || a === '--user') opts.u = args[++i];
            else if (a.startsWith('--user=')) opts.u = a.slice(7);
            else if (a === '-r' || a === '--role') opts.r = args[++i];
            else if (a.startsWith('--role=')) opts.r = a.slice(7);
            else if (a === '-l' || a === '--range') opts.l = args[++i];
            else if (a.startsWith('--reference=')) opts.ref = a.slice(12);
            else if (a === '--reference') opts.ref = args[++i];
            else if (a === '-R' || a === '--recursive') opts.R = true;
            else if (a === '-v' || a === '--verbose') opts.v = true;
            else if (/^-[Rvh]+$/.test(a)) { if (a.includes('R')) opts.R = true; if (a.includes('v')) opts.v = true; }
            else rest.push(a);
        }
        let full = null;
        if (!opts.t && !opts.u && !opts.r && !opts.l && !opts.ref) {
            full = rest.shift();
            if (!full) return this._err("chcon: missing operand\nTry 'chcon --help' for more information.", 1);
            if (!/^[^:]+:[^:]+:[^:]+(:.*)?$/.test(full)) return this._err(`chcon: invalid context: ‘${full}’: Invalid argument`, 1);
        }
        if (!rest.length) return this._err(rest.length === 0 && !full ? "chcon: missing operand\nTry 'chcon --help' for more information." : `chcon: missing operand after ‘${full}’\nTry 'chcon --help' for more information.`, 1);
        if (!this._isRoot()) return this._err(`chcon: failed to change context of ‘${rest[0]}’ to ‘${full || ''}’: Operation not permitted`, 1);
        let refCtx = null;
        if (opts.ref) { const rn = this.fs.getNode(opts.ref); if (!rn) return this._err(`chcon: failed to get security context of ‘${opts.ref}’: No such file or directory`, 1); refCtx = this.label(opts.ref, rn); }
        const out = [], errs = [];
        for (const p of rest) {
            const n = this.fs.getNode(p);
            if (!n) { errs.push(`chcon: cannot access ‘${p}’: No such file or directory`); continue; }
            const apply = (node, path) => {
                const cur = this.label(path, node);
                let next;
                if (full) { const [u, r, t, ...l] = full.split(':'); next = { user: u, role: r, type: t, level: l.join(':') || 's0' }; }
                else if (refCtx) next = { ...refCtx };
                else next = { user: opts.u || cur.user, role: opts.r || cur.role, type: opts.t || cur.type, level: opts.l || cur.level || 's0' };
                if (!this.allTypes.has(next.type)) { errs.push(`chcon: failed to change context of ‘${path}’ to ‘${this.ctxStr(next)}’: Invalid argument`); return; }
                node.selinux = next;
                if (opts.v) out.push(`changing security context of ‘${path}’`);
            };
            this._seWalk(n, this._abs(p), (node, path) => { if (opts.R || path === this._abs(p)) apply(node, path); });
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    matchpathcon(args) {
        const verify = args.includes('-V');
        const noName = args.includes('-n');
        const paths = args.filter(a => !a.startsWith('-'));
        if (!paths.length) return this._err('usage:  matchpathcon [-V] [-N] [-n] [-f file_contexts_file] [-p prefix] [-P policy_root_path] filepath...', 1);
        const out = [];
        for (const p of paths) {
            const n = this.fs.getNode(p);
            const abs = this._abs(p);
            const type = this.defaultType(abs, n ? n.type : 'file');
            const rule = this.defaultRule(abs, n ? n.type : 'file');
            const want = `${rule && rule.user || 'system_u'}:object_r:${type}:s0`;
            if (verify) {
                if (!n) { out.push(`${abs} not found`); continue; }
                const cur = this.label(abs, n);
                out.push(cur.type === type ? `${abs} verified.` : `${abs} has context ${this.ctxStr(cur)}, should be ${want}`);
            } else out.push(`${noName ? '' : abs + '\t'}${want}`);
        }
        return this._ok(out.join('\n'));
    }

    fixfiles(args) {
        if (!this._isRoot()) return this._err('fixfiles: You must be root to run fixfiles.', 1);
        const verb = args.find(a => !a.startsWith('-'));
        if (verb === 'onboot') {
            const root = this.fs.fs['/'];
            root.children['.autorelabel'] = { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' };
            return this._ok('System will relabel on next boot');
        }
        if (verb === 'restore' || verb === 'relabel') {
            const tree = args.filter(a => a.startsWith('/'))[0] || '/';
            const ch = this.seRestoreTree(tree);
            return this._ok(`${ch.length} files relabeled`.replace(/^/, verb === 'relabel' ? 'Cleaning out /tmp\n' : ''));
        }
        if (verb === 'check') { const ch = this.seRestoreTree(args.filter(a => a.startsWith('/'))[0] || '/', { dry: true }); return this._ok(ch.map(c => `${c.path} ${c.from} -> ${c.to}`).join('\n')); }
        return this._err('Usage: fixfiles [-v] [-F] [-f] relabel\nor\nfixfiles [-v] [-F] [-B | -N time ] { check | restore | verify } dir/file ...\nor\nfixfiles [-v] [-F] { check | restore | verify } -R rpmpackage[,rpmpackage...]\nor\nfixfiles [-v] [-F] { check | restore | verify } -C PREVIOUS_FILECONTEXT\nor\nfixfiles [-F] onboot', 1);
    }

    // ===== semanage =====

    semanage(args) {
        const obj = args[0];
        if (!obj || obj === '-h' || obj === '--help') return this._ok('usage: semanage [-h] {import,export,login,user,port,ibpkey,ibendport,interface,module,node,fcontext,boolean,permissive,dontaudit} ...');
        if (!this._isRoot()) return this._err('ValueError: SELinux policy is not managed or store cannot be accessed.', 1);
        const rest = args.slice(1);
        const has = (...f) => rest.some(a => f.includes(a));
        const val = (...f) => { for (const x of f) { const i = rest.indexOf(x); if (i >= 0) return rest[i + 1]; const e = rest.find(a => a.startsWith(x + '=')); if (e) return e.slice(x.length + 1); } return undefined; };
        const operands = () => { const o = []; for (let i = 0; i < rest.length; i++) { if (/^-/.test(rest[i])) { if (['-t', '--type', '-p', '--proto', '-f', '--ftype', '-s', '--seuser', '-e', '--equal', '-r', '--range', '-S', '--store', '-o', '-i'].includes(rest[i])) i++; continue; } o.push(rest[i]); } return o; };
        switch (obj) {
            case 'port': return this._semPort(rest, has, val, operands);
            case 'fcontext': return this._semFcontext(rest, has, val, operands);
            case 'boolean': return this._semBoolean(rest, has, val, operands);
            case 'permissive': return this._semPermissive(rest, has, val, operands);
            case 'login': return this._ok(has('-l', '--list') ? 'Login Name           SELinux User         MLS/MCS Range        Service\n\n__default__          unconfined_u         s0-s0:c0.c1023       *\nroot                 unconfined_u         s0-s0:c0.c1023       *' : '');
            case 'user': return this._ok(has('-l', '--list') ? '                Labeling   MLS/       MLS/                          \nSELinux User    Prefix     MCS Level  MCS Range                      SELinux Roles\n\nguest_u         user       s0         s0                             guest_r\nroot            user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r\nstaff_u         staff      s0         s0-s0:c0.c1023                 staff_r sysadm_r unconfined_r\nsysadm_u        sysadm     s0         s0-s0:c0.c1023                 sysadm_r\nsystem_u        user       s0         s0-s0:c0.c1023                 system_r unconfined_r\nunconfined_u    unconfined s0         s0-s0:c0.c1023                 system_r unconfined_r\nuser_u          user       s0         s0                             user_r\nxguest_u        user       s0         s0                             xguest_r' : '');
            case 'module': return this._ok(has('-l', '--list') ? this.modules.map(m => `${m.padEnd(25)}400     pp`).join('\n') : '');
            case 'export': return this._semExport(rest, val);
            case 'import': return this._semImport(rest, val);
            default: return this._err(`usage: semanage [-h] {import,export,login,user,port,ibpkey,ibendport,interface,module,node,fcontext,boolean,permissive,dontaudit} ...\nsemanage: error: argument subcommand: invalid choice: '${obj}'`, 2);
        }
    }

    _semPortLine(type, proto, ports) { return `${type.padEnd(30)} ${proto.padEnd(8)} ${ports.join(', ')}`; }

    _semPort(rest, has, val, operands) {
        const type = val('-t', '--type');
        const proto = val('-p', '--proto');
        if (has('-l', '--list')) {
            const onlyLocal = has('-C', '--locallist');
            const lines = ['SELinux Port Type              Proto    Port Number', ''];
            const types = new Set([...Object.keys(this.defPorts), ...this.localPorts.map(l => l.type)]);
            const rows = [];
            for (const t of [...types].sort()) {
                for (const pr of ['tcp', 'udp']) {
                    const local = this.localPorts.filter(l => l.type === t && l.proto === pr).flatMap(l => l.ports.map(String));
                    const def = (this.defPorts[t] && this.defPorts[t][pr]) || [];
                    if (onlyLocal) { if (local.length) rows.push(this._semPortLine(t, pr, local)); }
                    else if (local.length || def.length) rows.push(this._semPortLine(t, pr, [...local, ...def]));
                }
            }
            return this._ok(lines.concat(rows).join('\n'));
        }
        if (has('-D', '--deleteall')) { this.localPorts = []; return this._ok(); }
        const ports = operands();
        const isAdd = has('-a', '--add'), isDel = has('-d', '--delete'), isMod = has('-m', '--modify');
        if (!isAdd && !isDel && !isMod) return this._err('usage: semanage port [-h] [-n] [-N] [-S STORE] ('+'-a | -d | -m | -l | -C | -D) [-t TYPE] [-r RANGE] [-p PROTO] port_name', 2);
        if (!ports.length) return this._err('ValueError: Port is required', 1);
        if (!proto) return this._err('ValueError: Protocol is required', 1);
        if (!['tcp', 'udp'].includes(proto)) return this._err(`ValueError: Protocol ${proto} is invalid, must be tcp or udp`, 1);
        const spec = ports[0];
        if (!/^\d+(-\d+)?$/.test(spec)) return this._err(`ValueError: Invalid port ${spec}`, 1);
        const [lo, hi] = spec.split('-').map(Number);
        if (lo < 1 || (hi || lo) > 65535 || (hi !== undefined && hi < lo)) return this._err(`ValueError: Invalid port ${spec}`, 1);
        const existsLocal = this.localPorts.findIndex(l => l.proto === proto && l.ports.map(String).includes(spec));
        const inPolicy = Object.entries(this.defPorts).find(([t, m]) => (m[proto] || []).includes(spec));
        if (isAdd) {
            if (!type) return this._err('ValueError: Type is required', 1);
            if (!this.defPorts[type]) return this._err(`ValueError: Type ${type} is invalid, must be a port type`, 1);
            if (existsLocal >= 0 || inPolicy) return this._err(`ValueError: Port ${proto}/${spec} already defined`, 1);
            let entry = this.localPorts.find(l => l.type === type && l.proto === proto);
            if (!entry) { entry = { type, proto, ports: [] }; this.localPorts.push(entry); }
            entry.ports.push(spec);
            return this._ok();
        }
        if (isDel) {
            if (existsLocal < 0) return this._err(inPolicy ? `ValueError: Port ${proto}/${spec} is defined in policy, cannot be deleted` : `ValueError: Port ${proto}/${spec} is not defined`, 1);
            const e = this.localPorts[existsLocal];
            e.ports = e.ports.filter(x => String(x) !== spec);
            if (!e.ports.length) this.localPorts.splice(existsLocal, 1);
            return this._ok();
        }
        // modify
        if (!type) return this._err('ValueError: Type is required', 1);
        if (!this.defPorts[type]) return this._err(`ValueError: Type ${type} is invalid, must be a port type`, 1);
        if (existsLocal >= 0) {
            const e = this.localPorts[existsLocal];
            e.ports = e.ports.filter(x => String(x) !== spec);
            if (!e.ports.length) this.localPorts.splice(existsLocal, 1);
        } else if (!inPolicy) return this._err(`ValueError: Port ${proto}/${spec} is not defined`, 1);
        let entry = this.localPorts.find(l => l.type === type && l.proto === proto);
        if (!entry) { entry = { type, proto, ports: [] }; this.localPorts.push(entry); }
        entry.ports.push(spec);
        return this._ok();
    }

    _semFcontext(rest, has, val, operands) {
        const ftypeMap = { a: 'all files', f: 'regular file', d: 'directory', c: 'character device', b: 'block device', s: 'socket', l: 'symbolic link', p: 'named pipe', '--': 'regular file', '-d': 'directory', '-l': 'symbolic link' };
        if (has('-l', '--list')) {
            const onlyLocal = has('-C', '--locallist');
            const rows = [];
            const fmt = (r) => `${r.pattern.padEnd(50)} ${r.ftype.padEnd(18)} ${r.user}:object_r:${r.type}:s0`;
            if (onlyLocal) {
                this.localFc.forEach(r => rows.push(fmt(r)));
                this.equiv.forEach(e => rows.push(`${e.dst} = ${e.src}`));
            } else {
                this.defFc.slice().sort((a, b) => a.pattern.localeCompare(b.pattern)).forEach(r => rows.push(fmt(r)));
                this.localFc.forEach(r => rows.push(fmt(r)));
                this.equiv.forEach(e => rows.push(`${e.dst} = ${e.src}`));
                rows.push('', ...['/bin = /usr/bin', '/lib = /usr/lib', '/lib64 = /usr/lib', '/sbin = /usr/sbin', '/run = /var/run', '/var/lib/xguest/home = /home', '/var/run = /run'].map(x => x));
            }
            return this._ok(['SELinux fcontext                                   type               Context', ''].concat(rows).join('\n'));
        }
        if (has('-D', '--deleteall')) { this.localFc = []; this.equiv = []; return this._ok(); }
        const eq = val('-e', '--equal');
        const ops = operands();
        if (eq !== undefined && has('-a', '--add')) {
            const dst = ops[0];
            if (!dst) return this._err('ValueError: Equivalence class requires two paths', 1);
            if (this.equiv.some(e => e.dst === dst)) return this._err(`ValueError: Equivalence class for ${dst} already exists`, 1);
            this.equiv.push({ src: eq, dst });
            return this._ok();
        }
        const type = val('-t', '--type');
        const ftypeArg = val('-f', '--ftype');
        const ftype = ftypeArg ? (ftypeMap[ftypeArg] || ftypeMap['-' + ftypeArg] || 'all files') : 'all files';
        const pattern = ops[0];
        if (!has('-a', '--add') && !has('-d', '--delete') && !has('-m', '--modify')) return this._err('usage: semanage fcontext [-h] [-n] [-N] [-S STORE] [ --add ( -t TYPE -f FTYPE -r RANGE -s SEUSER | -e EQUAL ) | --delete ( -t TYPE -f FTYPE | -e EQUAL ) | --deleteall  | --extract  | --list [-C] | --modify ( -t TYPE -f FTYPE -r RANGE -s SEUSER | -e EQUAL ) ] file_spec', 2);
        if (!pattern) return this._err('ValueError: file specification is required', 1);
        const idx = this.localFc.findIndex(r => r.pattern === pattern && r.ftype === ftype);
        if (has('-a', '--add')) {
            if (!type) return this._err('ValueError: SELinux Type is required', 1);
            if (!this.allTypes.has(type)) return this._err(`ValueError: Type ${type} is invalid, must be a file or device type`, 1);
            if (idx >= 0) return this._err(`ValueError: File context for ${pattern} already defined`, 1);
            if (!pattern.startsWith('/')) return this._err('ValueError: Invalid file specification', 1);
            try { new RegExp(pattern); } catch (e) { return this._err('ValueError: Invalid regular expression', 1); }
            this.localFc.push({ pattern, type, ftype, user: val('-s', '--seuser') || 'system_u' });
            return this._ok();
        }
        if (has('-d', '--delete')) {
            if (idx < 0) return this._err(this.defFc.some(r => r.pattern === pattern) ? `ValueError: File context for ${pattern} is defined in policy, cannot be deleted` : `ValueError: File context for ${pattern} is not defined`, 1);
            this.localFc.splice(idx, 1);
            return this._ok();
        }
        if (!type) return this._err('ValueError: SELinux Type is required', 1);
        if (!this.allTypes.has(type)) return this._err(`ValueError: Type ${type} is invalid, must be a file or device type`, 1);
        if (idx >= 0) { this.localFc[idx].type = type; return this._ok(); }
        if (this.defFc.some(r => r.pattern === pattern)) { this.localFc.push({ pattern, type, ftype, user: 'system_u' }); return this._ok(); }
        return this._err(`ValueError: File context for ${pattern} is not defined`, 1);
    }

    _semBoolean(rest, has, val, operands) {
        if (has('-l', '--list')) {
            const only = has('-C', '--locallist');
            const rows = [];
            for (const n of Object.keys(this.bools).sort()) {
                const b = this.bools[n];
                if (only && b.def === this._factory(n)) continue;
                rows.push(`${n.padEnd(31)}(${(b.cur ? 'on' : 'off').padEnd(5)},${(b.def ? 'on' : 'off').padStart(5)})  ${b.desc}`);
            }
            return this._ok(['SELinux boolean                State  Default Description', ''].concat(rows).join('\n'));
        }
        const name = operands()[0];
        if (has('-m', '--modify')) {
            if (!name) return this._err('ValueError: You must specify a boolean name', 1);
            if (!this.bools[name]) return this._err(`ValueError: Boolean ${name} is not defined`, 1);
            if (has('--on', '-1')) { this.bools[name].cur = true; this.bools[name].def = true; }
            else if (has('--off', '-0')) { this.bools[name].cur = false; this.bools[name].def = false; }
            else return this._err('ValueError: You must specify one of the following: -1, --on, -0, --off', 1);
            return this._ok();
        }
        return this._err('usage: semanage boolean [-h] [-n] [-N] [-S STORE] ( --modify ( --on | --off ) | --list [-C] | --extract ) boolean', 2);
    }

    _factory(n) { const f = { httpd_builtin_scripting: true, httpd_enable_cgi: true, mount_anyfile: true, nfs_export_all_ro: true, nfs_export_all_rw: true, selinuxuser_execmem: true, selinuxuser_execstack: true, selinuxuser_ping: true }; return !!f[n]; }

    _semPermissive(rest, has, val, operands) {
        const dom = operands()[0] || val('-a', '--add') || val('-d', '--delete');
        if (has('-l', '--list')) return this._ok('Builtin Permissive Types \n\nsmokeping_t\nabrt_t\nsvirt_qmu_t\nsvirt_kvm_t\nxend_t' + (this.permissiveDomains.size ? '\n\nCustomized Permissive Types\n\n' + [...this.permissiveDomains].join('\n') : '') + '\n');
        if (has('-a', '--add')) { const d = val('-a', '--add') || dom; if (!/_t$/.test(d || '')) return this._err(`ValueError: Type ${d} is invalid, must be a domain or attribute`, 1); this.permissiveDomains.add(d); return this._ok(); }
        if (has('-d', '--delete')) { const d = val('-d', '--delete') || dom; if (!this.permissiveDomains.has(d)) return this._err(`ValueError: Permissive for ${d} is not defined`, 1); this.permissiveDomains.delete(d); return this._ok(); }
        return this._err('usage: semanage permissive [-h] [-n] [-N] [-S STORE] ( --add | --delete | --list ) type', 2);
    }

    _semExport(rest, val) {
        const lines = [];
        this.localPorts.forEach(l => l.ports.forEach(p => lines.push(`port -a -t ${l.type} -p ${l.proto} ${p}`)));
        this.localFc.forEach(r => lines.push(`fcontext -a -f ${r.ftype === 'all files' ? 'a' : r.ftype === 'directory' ? 'd' : 'f'} -t ${r.type} '${r.pattern}'`));
        this.equiv.forEach(e => lines.push(`fcontext -a -e ${e.src} ${e.dst}`));
        Object.keys(this.bools).forEach(n => { if (this.bools[n].def !== this._factory(n)) lines.push(`boolean -m -${this.bools[n].def ? 1 : 0} ${n}`); });
        this.permissiveDomains.forEach(d => lines.push(`permissive -a ${d}`));
        const out = val('-f', '-o', '--output');
        const text = lines.join('\n') + (lines.length ? '\n' : '');
        if (out) {
            const parent = this.fs.getNode(this.fs.getParentPath(out));
            if (!parent) return this._err(`[Errno 2] No such file or directory: '${out}'`, 1);
            parent.children[this.fs.getBasename(out)] = { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: text.length, modified: new Date(), content: text };
            return this._ok();
        }
        return this._ok(text.replace(/\n$/, ''));
    }

    _semImport(rest, val) {
        const f = val('-f', '-i', '--input');
        const node = f ? this.fs.getNode(f) : null;
        if (f && !node) return this._err(`[Errno 2] No such file or directory: '${f}'`, 1);
        const text = node ? node.content : '';
        for (const line of text.split('\n').filter(Boolean)) {
            const r = this.semanage(line.replace(/'/g, '').split(/\s+/));
            if (r.exitCode) return this._err(`${r.stderr}\nsemanage: error during import: ${line}`, 1);
        }
        return this._ok();
    }

    // ===== ausearch / audit2allow / sealert / semodule =====

    _since(ts) {
        const now = Date.now();
        if (!ts || ts === 'boot') return 0;
        if (ts === 'recent') return now - 10 * 60 * 1000;
        if (ts === 'today') { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.getTime(); }
        if (ts === 'yesterday') { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.getTime() - 86400000; }
        if (ts === 'this-week') return now - 7 * 86400000;
        if (ts === 'this-month') return now - 31 * 86400000;
        if (ts === 'this-year') return now - 366 * 86400000;
        if (ts === 'now') return now;
        const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(ts);
        if (m) { const d = new Date(); d.setUTCHours(+m[1], +m[2], +(m[3] || 0), 0); return d.getTime(); }
        return null;
    }

    ausearch(args) {
        if (!this._isRoot()) return this._err('Error opening config file (Permission denied)\nNOTE - using built-in logs: /var/log/audit/audit.log\nYou probably need root access', 1);
        let types = null, ts = null, comm = null, interp = false, raw = false;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-m' || a === '--message') types = String(args[++i]).split(',').map(x => x.toUpperCase());
            else if (a === '-ts' || a === '--start') ts = args[++i];
            else if (a === '-c' || a === '--comm') comm = args[++i];
            else if (a === '-i' || a === '--interpret') interp = true;
            else if (a === '-r' || a === '--raw') raw = true;
            else if (a === '-sv' || a === '--success') i++;
            else if (a === '-te' || a === '--end' || a === '-x' || a === '--exe' || a === '-p' || a === '-ui' || a === '-ua' || a === '-f') i++;
            else if (a === '-a' || a === '-ga' || a === '-k') i++;
        }
        if (types) for (const t of types) if (!/^[A-Z_]+$/.test(t)) return this._err(`Unknown message type: ${t}`, 1);
        const since = ts !== null ? this._since(ts) : 0;
        if (since === null) return this._err(`Invalid start time: ${ts}`, 1);
        let ev = this.audit.filter(e => e.time.getTime() >= since);
        if (comm) ev = ev.filter(e => e.comm === comm);
        if (types && !types.includes('AVC') && !types.includes('SYSCALL')) ev = [];
        if (!ev.length) return { stdout: '<no matches>', stderr: '', exitCode: 1 };
        if (raw) return this._ok(ev.map(e => `${e.syscall}\n${e.avc}`).join('\n'));
        const blocks = ev.map(e => {
            const stamp = this._auditStamp(e.time);
            let sys = e.syscall.replace(/key=\(null\)ARCH.*$/, 'key=(null)');
            let avc = e.avc;
            if (interp) {
                sys = sys.replace(/msg=audit\([\d.]+:/, `msg=audit(${stamp.interp}:`).replace(/arch=c000003e/, 'arch=x86_64').replace(/syscall=\d+/, `syscall=${e.perm === 'name_bind' ? 'bind' : 'newfstatat'}`).replace(/auid=4294967295/, 'auid=unset').replace(/ses=4294967295/, 'ses=unset').replace(/uid=48 gid=48 euid=48/, 'uid=apache gid=apache euid=apache').replace(/uid=0 gid=0 euid=0/, 'uid=root gid=root euid=root').replace(/suid=0 fsuid=0 egid=0 sgid=0 fsgid=0/, 'suid=root fsuid=root egid=root sgid=root fsgid=root');
                avc = avc.replace(/msg=audit\([\d.]+:/, `msg=audit(${stamp.interp}:`);
            }
            return `----\ntime->${stamp.std}\n${types && types.includes('SYSCALL') || !types ? '' : ''}${sys}\n${avc}`;
        });
        // the real tool prints PROCTITLE first; keep the two records that matter for tasks
        return this._ok(blocks.join('\n'));
    }

    _parseAvcs(text) {
        const out = [];
        const re = /avc:\s+denied\s+\{\s*([^}]+?)\s*\}\s+for\s+(.*?)scontext=(\S+)\s+tcontext=(\S+)\s+tclass=(\S+)(?:\s+permissive=(\d))?/g;
        let m;
        while ((m = re.exec(text)) !== null) {
            const s = m[3].split(':'), t = m[4].split(':');
            const comm = (/comm="([^"]*)"/.exec(m[2]) || [])[1] || '';
            const name = (/\bname="([^"]*)"/.exec(m[2]) || [])[1];
            const port = (/\bsrc=(\d+)/.exec(m[2]) || [])[1];
            const pathv = (/\bpath="([^"]*)"/.exec(m[2]) || [])[1];
            out.push({ perms: m[1].split(/\s+/), src: s[2], tgt: t[2], tclass: m[5], comm, name, port: port ? +port : undefined, path: pathv, tcontext: m[4] });
        }
        return out;
    }

    _te(avcs, modName) {
        const byKey = new Map();
        for (const a of avcs) {
            const k = `${a.src}|${a.tgt}|${a.tclass}`;
            if (!byKey.has(k)) byKey.set(k, { ...a, perms: new Set() });
            a.perms.forEach(p => byKey.get(k).perms.add(p));
        }
        const rules = [...byKey.values()];
        const types = [...new Set(rules.flatMap(r => [r.src, r.tgt]))];
        return { rules, types };
    }

    audit2allow(args, stdin = '') {
        let all = false, why = false, mod = null, inFile = null, pkgDir = false;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-a' || a === '--all') all = true;
            else if (a === '-w' || a === '--why') why = true;
            else if (a === '-M') mod = args[++i];
            else if (a === '-m') mod = args[++i];
            else if (a === '-i' || a === '--input') inFile = args[++i];
            else if (a === '-R' || a === '-r' || a === '-v' || a === '-d' || a === '-D' || a === '-l' || a === '-e') { /* tolerated */ }
        }
        if (!this._isRoot() && !stdin) return this._err('audit2allow: you must be root to read the audit log', 1);
        let text = stdin || '';
        if (inFile) { const n = this.fs.getNode(inFile); if (!n) return this._err(`audit2allow: [Errno 2] No such file or directory: '${inFile}'`, 1); text = n.content; }
        else if (all || (!stdin)) { const n = this.fs.getNode('/var/log/audit/audit.log'); text = n ? n.content : ''; }
        const avcs = this._parseAvcs(text);
        if (!avcs.length) return this._ok('');
        const { rules, types } = this._te(avcs, mod);
        if (why) {
            return this._ok(avcs.map(a => `${a.tcontext ? '' : ''}type=AVC msg=audit(1730542211.123:${this.serial}): avc:  denied  { ${a.perms.join(' ')} } for  ${a.port ? `src=${a.port} ` : ''}comm="${a.comm}" scontext=system_u:system_r:${a.src}:s0 tcontext=${a.tcontext} tclass=${a.tclass}\n\n\tWas caused by:\n\t\tMissing type enforcement (TE) allow rule.\n\n\t\tYou can use audit2allow to generate a loadable module to allow this access.\n`).join('\n'));
        }
        const rulesText = [];
        const bySrc = {};
        rules.forEach(r => { (bySrc[r.src] = bySrc[r.src] || []).push(r); });
        for (const [src, rs] of Object.entries(bySrc)) {
            rulesText.push(`#============= ${src} ==============`, '');
            for (const r of rs) {
                const perms = [...r.perms];
                const hint = r.tclass.endsWith('_socket') && perms.includes('name_bind') ? `#!!!! This avc can be allowed using the boolean 'nis_enabled'\n` : '';
                rulesText.push(`${hint}allow ${r.src} ${r.tgt}:${r.tclass} ${perms.length > 1 ? '{ ' + perms.join(' ') + ' }' : perms[0]};`);
            }
            rulesText.push('');
        }
        if (mod) {
            if (!this._isRoot()) return this._err('audit2allow: cannot write policy package as non-root', 1);
            const te = `\nmodule ${mod} 1.0;\n\nrequire {\n${types.map(t => `\ttype ${t};`).join('\n')}\n${[...new Set(rules.map(r => r.tclass))].map(c => `\tclass ${c} { ${[...new Set(rules.filter(r => r.tclass === c).flatMap(r => [...r.perms]))].join(' ')} };`).join('\n')}\n}\n\n#============= ${rules[0].src} ==============\n${rules.map(r => `allow ${r.src} ${r.tgt}:${r.tclass} ${[...r.perms].length > 1 ? '{ ' + [...r.perms].join(' ') + ' }' : [...r.perms][0]};`).join('\n')}\n`;
            const dir = this.fs.getNode(this.fs.currentPath);
            const mk = (name, content, extra) => { dir.children[name] = Object.assign({ type: 'file', permissions: '0644', owner: this.fs.currentUser, group: 'root', size: content.length, modified: new Date(), content }, extra || {}); };
            mk(`${mod}.te`, te);
            mk(`${mod}.pp`, '\u0000SELINUX_POLICY_PACKAGE\u0000', { sepol: { name: mod, rules: rules.map(r => ({ src: r.src, tgt: r.tgt, tclass: r.tclass, perms: [...r.perms] })) } });
            return this._ok(`******************** IMPORTANT ***********************\nTo make this policy package active, execute:\n\nsemodule -i ${mod}.pp\n`);
        }
        return this._ok(rulesText.join('\n').replace(/\n\n$/, '\n'));
    }

    semodule(args) {
        const opts = { i: null, r: null, e: null, d: null, l: false, X: null };
        const rest = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-i' || a === '--install') opts.i = args[++i];
            else if (a === '-r' || a === '--remove') opts.r = args[++i];
            else if (a === '-e' || a === '--enable') opts.e = args[++i];
            else if (a === '-d' || a === '--disable') opts.d = args[++i];
            else if (a === '-l' || a === '--list-modules' || a === '--list') opts.l = true;
            else if (a === '-X' || a === '--priority') opts.X = args[++i];
            else if (a === '-B' || a === '--build' || a === '-n' || a === '-v') { /* ignored */ }
            else rest.push(a);
        }
        if (opts.l || (!opts.i && !opts.r && !opts.e && !opts.d && args.length === 0)) {
            if (args.length === 0) return this._err('semodule:  Permission denied', 1);
            return this._ok(this.modules.slice().sort().join('\n'));
        }
        if (!this._isRoot()) return this._err('semodule:  Permission denied', 1);
        if (opts.i) {
            const n = this.fs.getNode(opts.i);
            if (!n) return this._err(`semodule:  Failed on ${opts.i}!`, 1);
            if (!n.sepol) return this._err(`libsemanage.semanage_direct_install_file: Unable to read file ${opts.i}\nsemodule:  Failed on ${opts.i}!`, 1);
            const name = n.sepol.name;
            if (!this.modules.includes(name)) this.modules.push(name);
            n.sepol.rules.forEach(r => r.perms.forEach(p => this.allowed.add(`${r.src}|${r.tgt}|${r.tclass}|${p}`)));
            this.localModules = this.localModules || {};
            this.localModules[name] = n.sepol.rules;
            return this._ok();
        }
        if (opts.r) {
            if (!this.modules.includes(opts.r)) return this._err(`libsemanage.semanage_direct_remove_key: Unable to remove module ${opts.r} at priority 400. (No such file or directory).\nsemodule:  Failed!`, 1);
            const rules = (this.localModules || {})[opts.r];
            if (rules) rules.forEach(r => r.perms.forEach(p => this.allowed.delete(`${r.src}|${r.tgt}|${r.tclass}|${p}`)));
            this.modules = this.modules.filter(m => m !== opts.r);
            return this._ok();
        }
        if (opts.e || opts.d) {
            const name = opts.e || opts.d;
            if (!this.modules.includes(name)) return this._err(`semodule:  Failed on ${name}!`, 1);
            return this._ok();
        }
        return this._err('semodule:  Invalid option', 1);
    }

    sealert(args) {
        if (!this.shared.installedPackages.includes('setroubleshoot-server')) return this._err('sealert: command not found', 127);
        const aIdx = args.indexOf('-a');
        const lIdx = args.indexOf('-l');
        if (aIdx < 0 && lIdx < 0) return this._err('usage: sealert [-h] [-s] [-p] [-a ALL_PATHS_AUDIT_LOGS] [-l LOOKUP_ID]...', 1);
        if (!this._isRoot()) return this._err('sealert: error: must be root to read the audit log', 1);
        let events = this.audit.slice();
        if (aIdx >= 0) {
            const f = args[aIdx + 1];
            if (!f || !this.fs.getNode(f)) return this._err(`sealert: error: ${f || ''}: No such file or directory`, 1);
        }
        if (lIdx >= 0) {
            const id = args[lIdx + 1];
            if (id !== '*') events = events.filter(e => this._uuidFor(e) === id);
            if (!events.length) return this._err(`Error: no alert found with id ${id}`, 1);
        }
        // group identical alerts like setroubleshoot does
        const groups = new Map();
        for (const e of events) { const k = `${e.src}|${e.tcontext.type}|${e.tclass}|${e.perm}|${e.port || e.name || e.path}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); }
        const out = [];
        if (aIdx >= 0) out.push('100% done', `found ${groups.size} alerts in ${args[aIdx + 1]}`);
        if (!groups.size) return this._ok('100% done\nfound 0 alerts in ' + (args[aIdx + 1] || '/var/log/audit/audit.log'));
        for (const list of groups.values()) out.push(this._alertText(list));
        return this._ok(out.join('\n'));
    }

    _alertText(list) {
        const e = list[0];
        const sep = '-'.repeat(80);
        const srcBase = e.comm;
        const t = e.tcontext;
        const first = list[0].time, last = list[list.length - 1].time;
        const id = this._uuidFor(e);
        const lines = [sep, ''];
        if (e.perm === 'name_bind') {
            lines.push(`SELinux is preventing ${e.exe} from name_bind access on the ${e.tclass} port ${e.port}.`, '');
            lines.push('*****  Plugin bind_ports (99.5 confidence) suggests   ************************', '');
            lines.push(`If you want to allow ${e.exe} to bind to network port ${e.port}`, 'Then you need to modify the port type.', 'Do', `# semanage port -a -t PORT_TYPE -p ${e.proto || 'tcp'} ${e.port}`, `    where PORT_TYPE is one of the following: ${(this.domainPorts[e.src] || []).join(', ')}.`, '');
        } else {
            lines.push(`SELinux is preventing ${e.exe} from ${e.perm} access on the ${e.tclass} ${e.path || e.name}.`, '');
            lines.push('*****  Plugin catchall_labels (83.8 confidence) suggests   *******************', '');
            lines.push(`If you want to allow ${srcBase} to have ${e.perm} access on the ${e.name || e.path} ${e.tclass}`, 'Then you need to change the label on ' + (e.path || e.name), 'Do', `# semanage fcontext -a -t FILE_TYPE '${e.path || e.name}'`, `where FILE_TYPE is one of the following: ${[...this.httpdReadable].filter(x => /^(httpd_sys|httpd_user|public_content|httpd_cache)/.test(x)).join(', ')}.`, 'Then execute:', `restorecon -v '${e.path || e.name}'`, '');
            lines.push('*****  Plugin restorecon (6.67 confidence) suggests   ************************', '');
            lines.push(`If you want to fix the label.`, `${e.path || e.name} default label should be ${this.defaultType(e.path || '/', 'file')}.`, 'Then you can run restorecon. The access attempt may have been stopped due to insufficient permissions to access a parent directory in which case try to change the following command accordingly.', 'Do', `# /sbin/restorecon -v ${e.path || e.name}`, '');
        }
        lines.push('*****  Plugin catchall (1.44 confidence) suggests   **************************', '');
        lines.push(`If you believe that ${srcBase} should be allowed ${e.perm} access on the ${e.port || e.name || e.path} ${e.tclass} by default.`, 'Then you should report this as a bug.', 'You can generate a local policy module to allow this access.', 'Do', 'allow this access for now by executing:', `# ausearch -c '${srcBase}' --raw | audit2allow -M my-${srcBase}`, `# semodule -X 300 -i my-${srcBase}.pp`, '');
        lines.push('Additional Information:');
        const row = (k, v) => `${k.padEnd(30)}${v}`;
        lines.push(row('Source Context', `system_u:system_r:${e.src}:s0`), row('Target Context', this.ctxStr(t)), row('Target Objects', e.port ? `${e.port} [ ${e.tclass} ]` : `${e.path || e.name} [ ${e.tclass} ]`), row('Source', srcBase), row('Source Path', e.exe));
        if (e.port) lines.push(row('Port', String(e.port)));
        lines.push(row('Host', 'rhcsa-lab'), row('Source RPM Packages', ''), row('Target RPM Packages', ''), row('SELinux Policy RPM', 'selinux-policy-targeted-38.1.23-1.el9.noarch'), row('Local Policy RPM', 'selinux-policy-targeted-38.1.23-1.el9.noarch'), row('Selinux Enabled', 'True'), row('Policy Type', 'targeted'), row('Enforcing Mode', e.permissive ? 'Permissive' : 'Enforcing'), row('Host Name', 'rhcsa-lab'), row('Platform', 'Linux rhcsa-lab 5.14.0-362.8.1.el9_3.x86_64 #1 SMP PREEMPT_DYNAMIC x86_64 x86_64'), row('Alert Count', String(list.length)), row('First Seen', this._auditStamp(first).std), row('Last Seen', this._auditStamp(last).std), row('Local ID', id), '', 'Raw Audit Messages', e.avc, '', `Hash: ${srcBase},${e.src},${t.type},${e.tclass},${e.perm}`, '');
        return lines.join('\n');
    }

    sesearch(args) {
        const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
        const s = get('-s'), tt = get('-t'), c = get('-c');
        if (!args.some(a => ['--allow', '-A', '--type_trans', '-T', '--role_allow', '-R'].includes(a)) && !args.includes('--allow')) return this._err('sesearch: no rule type specified', 1);
        const rules = [];
        const add = (src, tgt, cls, perms) => rules.push({ src, tgt, cls, perms });
        add('httpd_t', 'httpd_sys_content_t', 'file', 'getattr ioctl lock map open read');
        add('httpd_t', 'httpd_sys_content_t', 'dir', 'getattr ioctl lock open read search');
        add('httpd_t', 'httpd_sys_rw_content_t', 'file', 'append create getattr ioctl link lock map open read rename setattr unlink write');
        add('httpd_t', 'http_port_t', 'tcp_socket', 'name_bind');
        add('httpd_t', 'http_cache_port_t', 'tcp_socket', 'name_bind');
        add('httpd_t', 'ntop_port_t', 'tcp_socket', 'name_bind');
        add('sshd_t', 'ssh_port_t', 'tcp_socket', 'name_bind');
        add('chronyd_t', 'ntp_port_t', 'udp_socket', 'name_bind');
        add('mysqld_t', 'mysqld_port_t', 'tcp_socket', 'name_bind');
        const hit = rules.filter(r => (!s || r.src === s) && (!tt || r.tgt === tt) && (!c || r.cls === c || (c === 'tcp_socket' && r.cls === 'tcp_socket')));
        if (!hit.length) return this._ok('');
        return this._ok(hit.map(r => `allow ${r.src} ${r.tgt}:${r.cls} ${r.perms.includes(' ') ? '{ ' + r.perms + ' }' : r.perms};`).join('\n'));
    }

    // ===== a small web server model for curl =====

    curl(args, stdin) {
        const opts = { s: false, I: false, i: false, o: null, v: false, L: false, k: false, X: 'GET', f: false, w: null };
        let url = null;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-o' || a === '--output') opts.o = args[++i];
            else if (a === '-X' || a === '--request') opts.X = args[++i];
            else if (a === '-H' || a === '--header' || a === '-d' || a === '--data' || a === '-u' || a === '-A' || a === '--connect-timeout' || a === '-m' || a === '--max-time' || a === '-w' || a === '--write-out') { if (a === '-w' || a === '--write-out') opts.w = args[i + 1]; i++; }
            else if (/^-[a-zA-Z]+$/.test(a)) { for (const ch of a.slice(1)) { if (ch in opts) opts[ch] = true; } }
            else if (a.startsWith('--')) { if (a === '--head') opts.I = true; if (a === '--silent') opts.s = true; if (a === '--include') opts.i = true; if (a === '--verbose') opts.v = true; if (a === '--location') opts.L = true; if (a === '--fail') opts.f = true; }
            else url = a;
        }
        if (!url) return this._err("curl: try 'curl --help' or 'curl --manual' for more information", 2);
        const m = /^(?:(https?|ftp|file):\/\/)?([^\/:?#]+|\[[^\]]+\])(?::(\d+))?(\/[^?#]*)?(\?[^#]*)?/.exec(url);
        if (!m) return this._err(`curl: (3) URL using bad/illegal format or missing URL`, 3);
        const scheme = m[1] || 'http';
        const host = m[2];
        const port = m[3] ? parseInt(m[3], 10) : (scheme === 'https' ? 443 : 80);
        const path = decodeURIComponent(m[4] || '/');
        if (scheme === 'ftp' || scheme === 'file') return this._err(`curl: (7) Failed to connect to ${host} port ${port}: Connection refused`, 7);
        const localNames = ['localhost', '127.0.0.1', '::1', '[::1]', 'rhcsa-lab', 'rhcsa-lab.example.com', '192.168.1.100'];
        if (!localNames.includes(host)) {
            const r = this.shared.storage ? this.shared.storage._resolves(host) : false;
            if (!r) return this._err(`curl: (6) Could not resolve host: ${host}`, 6);
            return this._err(`curl: (7) Failed to connect to ${host} port ${port}: No route to host`, 7);
        }
        // who listens on the port?
        const svc = this.shared.svc;
        const S = this.shared.services;
        let owner = null;
        for (const name of ['httpd', 'nginx']) {
            if (S[name] && S[name].active) { const p = svc._svPort(name); if (p && p.port === port) owner = name; }
        }
        const cmdErr = (n, msg) => this._err(`curl: (${n}) ${msg}`, n);
        if (!owner) {
            // other listening services (just report an empty reply)
            if (port === 22 && S.sshd.active) return cmdErr(1, 'Received HTTP/0.9 when not allowed');
            return this._err(`curl: (7) Failed to connect to ${host} port ${port}${opts.v ? '' : ''}: Connection refused`, 7);
        }
        if (scheme === 'https') return cmdErr(35, 'error:0A000126:SSL routines::unexpected eof while reading');
        // locate the document
        let docroot = '/var/www/html';
        if (owner === 'httpd') { const cf = this.fs.getNode('/etc/httpd/conf/httpd.conf'); const dm = /^\s*DocumentRoot\s+"?([^"\s]+)"?/m.exec((cf && cf.content) || ''); if (dm) docroot = dm[1]; }
        else docroot = '/usr/share/nginx/html';
        const exe = owner === 'httpd' ? '/usr/sbin/httpd' : '/usr/sbin/nginx';
        const comm = owner === 'httpd' ? 'httpd' : 'nginx';
        const full = (docroot.replace(/\/$/, '') + (path === '/' ? '' : path)).replace(/\/+$/, '') || '/';
        let status = 200, reason = 'OK', body = '', ctype = 'text/html; charset=UTF-8';
        let node = this.fs.getNode(full);
        let target = full;
        if (node && node.type === 'directory') {
            const idx = node.children && node.children['index.html'];
            if (idx) { node = idx; target = full + '/index.html'; } else { node = null; status = 403; }
        }
        const page = (code, title, msg) => `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">\n<html><head>\n<title>${code} ${title}</title>\n</head><body>\n<h1>${title}</h1>\n<p>${msg}</p>\n</body></html>`;
        const worker = owner === 'httpd' ? 'apache' : 'nginx';
        if (status === 403) {
            reason = 'Forbidden';
            body = owner === 'httpd' && !this.fs.getNode(full) ? '' : page(403, 'Forbidden', "You don't have permission to access this resource.");
            if (owner === 'httpd') body = '<!doctype html>\n<html>\n  <head>\n    <meta charset=\'utf-8\'>\n    <title>HTTP Server Test Page</title>\n  </head>\n  <body>\n    <h1>HTTP Server <strong>Test Page</strong></h1>\n    <p>This page is used to test the proper operation of the HTTP server after it has been installed. If you can read this page, it means that the web server installed at this site is working properly, but has not yet been configured.</p>\n  </body>\n</html>';
        } else if (!node) {
            status = 404; reason = 'Not Found';
            body = page(404, 'Not Found', 'The requested URL was not found on this server.');
        } else {
            // POSIX permissions for the worker user
            const modeOk = this._worldReadable(docroot, full, node);
            const lab = this.label(target, node);
            if (!modeOk) { status = 403; reason = 'Forbidden'; body = page(403, 'Forbidden', "You don't have permission to access this resource."); this._accessLogError(owner, `[core:error] AH00035: access to ${path} denied (filesystem path '${target}') because search permissions are missing on a component of the path`); }
            else if (this.mode !== 'disabled' && !this.httpdReadable.has(lab.type) && !(lab.type === 'user_home_t' && this.bools.httpd_enable_homedirs.cur) && !(['nfs_t'].includes(lab.type) && this.bools.httpd_use_nfs.cur) && !(['cifs_t'].includes(lab.type) && this.bools.httpd_use_cifs.cur)) {
                const denied = this.logAvc({ src: 'httpd_t', comm, exe, perm: 'getattr', tclass: node.type === 'directory' ? 'dir' : 'file', tcontext: lab, path: target, user: worker });
                if (denied) { status = 403; reason = 'Forbidden'; body = page(403, 'Forbidden', "You don't have permission to access this resource."); this._accessLogError(owner, `[core:error] AH00132: file permissions deny server access: ${target}`); }
            }
            if (status === 200) {
                body = node.content || '';
                if (/\.txt$/.test(target)) ctype = 'text/plain; charset=UTF-8'; else if (/\.json$/.test(target)) ctype = 'application/json'; else if (/\.css$/.test(target)) ctype = 'text/css'; else if (/\.png$/.test(target)) ctype = 'image/png';
            }
        }
        this._accessLog(owner, host, opts.X, path, status, body.length);
        const date = new Date().toUTCString();
        const server = owner === 'httpd' ? 'Apache/2.4.57 (Red Hat Enterprise Linux)' : 'nginx/1.20.1';
        const headers = [`HTTP/1.1 ${status} ${reason}`, `Date: ${date}`, `Server: ${server}`];
        if (status === 200 && node) headers.push(`Last-Modified: ${(node.modified || new Date()).toUTCString()}`, `ETag: "${(body.length).toString(16)}-6091c7a1b2e00"`, 'Accept-Ranges: bytes');
        headers.push(`Content-Length: ${body.length}`, `Content-Type: ${status === 200 ? ctype : 'text/html; charset=iso-8859-1'}`);
        let out = '';
        const info = [];
        if (opts.v) info.push(`*   Trying ${host === 'localhost' ? '::1' : host}:${port}...`, `* Connected to ${host} (${host === 'localhost' ? '::1' : host}) port ${port} (#0)`, `> ${opts.X} ${path} HTTP/1.1`, `> Host: ${host}${port === 80 ? '' : ':' + port}`, '> User-Agent: curl/7.76.1', '> Accept: */*', '>');
        if (opts.I) out = headers.join('\r\n') + '\r\n';
        else if (opts.i) out = headers.join('\r\n') + '\r\n\r\n' + body;
        else out = body;
        if (opts.v) out = info.concat(headers.map(h => '< ' + h), ['<', ...(opts.I ? [] : [body]), `* Connection #0 to host ${host} left intact`]).join('\n');
        if (opts.o && !opts.I) { const parent = this.fs.getNode(this.fs.getParentPath(opts.o)); if (parent) parent.children[this.fs.getBasename(opts.o)] = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: body.length, modified: new Date(), content: body }; out = opts.s ? '' : '  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n                                 Dload  Upload   Total   Spent    Left  Speed\n100 ' + body.length + '  100 ' + body.length + '    0     0  ' + (body.length * 20) + '      0 --:--:-- --:--:-- --:--:-- ' + (body.length * 20); }
        if (opts.f && status >= 400) return this._err(`curl: (22) The requested URL returned error: ${status}`, 22);
        if (opts.w) out += opts.w.replace(/%\{http_code\}/g, String(status)).replace(/\\n/g, '\n');
        return this._ok(out);
    }

    _worldReadable(docroot, fullPath, node) {
        // every directory from / to the file needs o+x (or apache group), the file o+r
        const chain = this._ancestors(fullPath);
        for (let i = 0; i < chain.length - 1; i++) { const m = chain[i].node.permissions.slice(-1); if (!(parseInt(m, 10) & 1)) return false; }
        return !!(parseInt(node.permissions.slice(-1), 10) & 4);
    }

    _ensureLog(path) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0700', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        if (!cur.children[name]) cur.children[name] = { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' };
        return cur.children[name];
    }

    _accessLog(owner, host, method, path, status, bytes) {
        const dir = owner === 'httpd' ? '/var/log/httpd' : '/var/log/nginx';
        const n = this._ensureLog(`${dir}/access${owner === 'httpd' ? '_log' : '.log'}`);
        const d = new Date();
        const p = (x) => String(x).padStart(2, '0');
        const ts = `${p(d.getUTCDate())}/${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]}/${d.getUTCFullYear()}:${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} +0000`;
        n.content += `${host === 'localhost' ? '::1' : host} - - [${ts}] "${method} ${path} HTTP/1.1" ${status} ${bytes} "-" "curl/7.76.1"\n`;
        n.size = n.content.length;
    }

    _accessLogError(owner, msg) {
        if (owner !== 'httpd') return;
        const n = this._ensureLog('/var/log/httpd/error_log');
        const d = new Date();
        n.content += `[${d.toUTCString().slice(0, 3)} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}.000000 ${d.getUTCFullYear()}] ${msg} [pid 1501:tid 139000000000000] [client ::1:44822]\n`;
        n.size = n.content.length;
    }

    // ===== small helpers =====

    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _isRoot() { return this.fs.currentUid === 0; }
}

if (typeof window !== 'undefined') {
    window.SELinuxEngine = SELinuxEngine;
}
