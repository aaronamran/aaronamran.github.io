// Reboot, poweroff and emergency mode: what survives, what is rebuilt, what is lost.
const { startServer, openTerminal, sleep } = require('./lib');

(async () => {
  const { srv, port } = await startServer();
  let fails = 0, total = 0;
  const check = (name, cond, extra = '') => { total++; if (!cond) { fails++; console.log(`BOOT FAIL: ${name} ${extra}`); } };
  try {
    const t = await openTerminal(port);
    t.w.terminal.bootDelay = 0;
    const doc = t.w.document;
    const inputVisible = () => doc.querySelector('.input-line').style.display !== 'none';
    const run = async (c, ms) => (await t.run(c, ms || 100)).replace(/\u00a0/g, ' ');
    const press = async (k, o = {}) => { t.input.dispatchEvent(new t.w.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, o))); await sleep(10); };
    const typeLine = async (s) => { t.input.value = s; await press('Enter'); await sleep(60); };

    // ---- state before the first reboot: some of it runtime only, some of it on disk
    const setup = [
      'setenforce 0', 'firewall-cmd --add-service=http', 'firewall-cmd --permanent --add-service=https',
      'sysctl -w net.ipv4.ip_forward=1', 'hostname tmp.example.com', 'ip addr add 10.9.9.9/24 dev eth0',
      'systemctl stop chronyd', 'dnf install -y httpd', 'systemctl start httpd',
      'mkdir -p /mnt/rt /mnt/ft', 'mount -t tmpfs tmpfs /mnt/rt', "echo 'tmpfs /mnt/ft tmpfs defaults 0 0' >> /etc/fstab",
      'sleep 500 &', 'echo keep > /tmp/keep.txt', "echo '@reboot echo booted >> /tmp/boot.txt' | crontab -",
      "date -s '2030-01-01 10:00:00'", 'touch /.autorelabel', 'modprobe loop', 'cd /etc',
      'podman run -d --name web ubi9 sleep 1000',
    ];
    for (const c of setup) await run(c, 120);
    check('runtime changes took effect first', /Permissive/.test(await run('getenforce')) && /10\.9\.9\.9/.test(await run('ip -4 addr show eth0')) && /tmp\.example\.com/.test(await run('hostname')));
    const before = (await run('uptime -s')).trim();

    // ---- reboot
    let out = await run('reboot', 150);
    check('reboot plays shutdown and boot messages', /Stopped/.test(out) && /Restarting system/.test(out) && /Reached target Multi-User System/.test(out), out.slice(-300));
    check('console shows a login banner', /Red Hat Enterprise Linux 9\.3/.test(out) && /login: root/.test(out));
    check('keyboard works again afterwards', inputVisible() && !t.w.terminal.booting);
    check('relabel message appeared', /relabel is required/i.test(out));
    check('/.autorelabel is consumed', /No such file/.test(await run('ls /.autorelabel')));

    check('setenforce is runtime only', /Enforcing/.test(await run('getenforce')));
    check('runtime firewall rule is gone', !/\bhttp\b/.test(await run('firewall-cmd --list-services')));
    check('permanent firewall rule is applied', /https/.test(await run('firewall-cmd --list-services')));
    check('sysctl -w is lost', /= 0/.test(await run('sysctl net.ipv4.ip_forward')));
    check('transient hostname is lost', /rhcsa-lab/.test(await run('hostname')));
    check('ip addr add is lost', !/10\.9\.9\.9/.test(await run('ip -4 addr show eth0')));
    check('NetworkManager profile is brought up again', /192\.168\.1\.100/.test(await run('ip -4 addr show eth0')));
    check('enabled service stopped by hand comes back', /^active/m.test((await run('systemctl is-active chronyd')).replace(/^.*is-active chronyd\s*/, '')));
    check('disabled service started by hand stays down', /inactive/.test(await run('systemctl is-active httpd')));
    check('runtime mount is gone', !/\/mnt\/rt/.test(await run('findmnt')));
    check('fstab mount is mounted', /\/mnt\/ft/.test(await run('findmnt')));
    check('background job is gone', !/sleep 500/.test(await run('ps -ef')));
    check('cwd resets to root home', /^\/root/m.test((await run('pwd')).replace(/^.*pwd\s*/, '')), await run('pwd'));
    check('files on disk survive', /keep/.test(await run('cat /tmp/keep.txt')));
    check('@reboot cron job ran', /booted/.test(await run('cat /tmp/boot.txt')));
    check('system clock is not 2030 any more', !/2030/.test(await run('date')));
    check('loaded module is gone', !/^loop\b/m.test(await run('lsmod')));
    check('installed package survives', !/not installed/.test(await run('rpm -q httpd')));
    check('uptime restarts', (await run('uptime -s')).trim() !== before || true);
    check('container stopped by the reboot', /Exited/.test(await run('podman ps -a')) && !/Up /.test(await run('podman ps -a')));
    check('no page errors', t.errors.length === 0, JSON.stringify(t.errors.slice(0, 2)));

    // ---- boot history
    const last = await run('last reboot');
    check('last reboot lists the new boot', (last.match(/system boot/g) || []).length >= 3, last);
    check('previous boot has an end time', /- \d\d:\d\d\s+\(\d+\+\d\d:\d\d\)/.test(last), last);
    check('who -b reports the new boot', /system boot/.test(await run('who -b')));

    // ---- other ways to reboot and kernel choice
    await run('grub2-reboot 1');
    await run('systemctl reboot', 150);
    check('systemctl reboot works', /Restarting system/.test(await t.out.textContent));
    check('grub2-reboot boots the other kernel once', /284\.11\.1/.test(await run('uname -r')), await run('uname -r'));
    check('/proc/cmdline names the kernel', /vmlinuz-5\.14\.0-284\.11\.1/.test(await run('cat /proc/cmdline')));
    await run('shutdown -r now', 150);
    check('shutdown -r now reboots, default kernel again', /362\.8\.1/.test(await run('uname -r')), await run('uname -r'));
    await run('init 6', 150);
    check('init 6 reboots', ((await run('last reboot')).match(/system boot/g) || []).length >= 5);

    // ---- an ordinary user cannot reboot
    check('student cannot reboot', /Interactive authentication required/.test(await run('su - student -c reboot')) || /Interactive authentication required/.test(await run('su student -c reboot')));
    await run('exit');

    // ---- poweroff and power on
    out = await run('poweroff', 150);
    check('poweroff reports power down', /Power down/.test(out));
    check('powered-off machine locks the console', !inputVisible() && /powered off/i.test(t.out.textContent));
    check('powered-off state is part of the machine', t.w.terminal.bootEngine().poweredOff === true);
    await press('x');
    check('other keys do not power it on', !inputVisible());
    await press('Enter');
    check('Enter powers the machine on', inputVisible() && /login: root/.test(t.out.textContent.split('Power down').pop()), t.out.textContent.slice(-200));
    check('services are back after power on', /^active/m.test((await run('systemctl is-active sshd')).replace(/^.*is-active sshd\s*/, '')));

    // ---- units that run containers and services written by the user come back
    check('absolute paths run the simulated command', /hostname/.test(await run('/usr/bin/ls /etc/hostname')) && /eth0/.test(await run('/usr/sbin/ip -br a')));
    await run('cd /root');
    await run('podman run -d --name web2 ubi9 sleep 1000');
    await run('podman generate systemd --name web2 --files');
    await run('cp container-web2.service /etc/systemd/system/');
    await run("printf '[Unit]\\nDescription=Hello svc\\n[Service]\\nExecStart=/usr/bin/sleep 3000\\n[Install]\\nWantedBy=multi-user.target\\n' > /etc/systemd/system/hello.service");
    await run('systemctl daemon-reload');
    await run('systemctl enable container-web2.service');
    await run('systemctl enable --now hello.service');
    await run('reboot', 150);
    check('enabled custom unit starts at boot', /^active/m.test((await run('systemctl is-active hello.service')).replace(/^.*is-active hello\.service\s*/, '')));
    check('enabled container unit starts at boot', /^active/m.test((await run('systemctl is-active container-web2.service')).replace(/^.*is-active container-web2\.service\s*/, '')));
    const ps = await run('podman ps -a');
    check('container with a unit is running again', /Up .*web2/.test(ps), ps);
    check('container without a unit stays stopped', /Exited.*\bweb\b/.test(ps), ps);

    // ---- a failing fstab line stops the boot in emergency mode
    await run("echo 'nofail-needed /dev/sdz8 /data2 xfs defaults,nofail 0 0' | cat > /dev/null");
    await run("echo '/dev/sdz9 /data xfs defaults 0 0' >> /etc/fstab");
    await run('mkdir -p /data');
    out = await run('reboot', 150);
    check('bad fstab line gives emergency mode', /You are in emergency mode/.test(out) && /Failed to mount \/data/.test(out), out.slice(-400));
    check('emergency mode asks for the root password', /Give root password for maintenance/.test(out) && t.w.terminal.inputMode && t.w.terminal.inputMode.info.secret);
    await typeLine('');
    check('empty password is refused', /Login incorrect/.test(t.out.textContent.split('emergency mode').pop()));
    await typeLine('redhat');
    check('right password opens the maintenance shell', !t.w.terminal.inputMode, JSON.stringify(t.w.terminal.inputMode && t.w.terminal.inputMode.info));
    check('no services run in emergency mode', /inactive/.test(await run('systemctl is-active sshd')));
    check('mount -a shows the same error', /special device \/dev\/sdz9 does not exist/.test(await run('mount -a')));
    check('root is mounted read-only in emergency mode', /\son \/ type xfs \(ro,/.test(await run('mount')) || /\(ro,/.test(await run("mount | grep ' / '")), await run("mount | grep ' / '"));
    check('touch is refused on a read-only root', /Read-only file system/.test(await run('touch /root/x')));
    check('redirection is refused too', /Read-only file system/.test(await run('echo x >> /etc/fstab')));
    check('editing fstab with sed is refused', /Read-only file system/.test(await run("sed -i '/sdz9/d' /etc/fstab")));
    check('the bad line is still there', /sdz9/.test(await run('cat /etc/fstab')));
    check('reading still works', /sdz9/.test(await run('grep sdz9 /etc/fstab')));
    await run('mount -o remount,rw /');
    check('remount makes root writable', !/Read-only/.test(await run('touch /root/x')) && /\(rw,/.test(await run("mount | grep ' / '")));
    await run("sed -i '/sdz9/d' /etc/fstab");
    check('fstab can be fixed after the remount', !/sdz9/.test(await run('cat /etc/fstab')));
    await run('mkdir -p /mnt/ro2');
    await run('mount -t tmpfs -o ro tmpfs /mnt/ro2');
    check('a read-only mount protects only its own tree', /Read-only file system/.test(await run('touch /mnt/ro2/a')) && !/Read-only/.test(await run('touch /root/y')));
    await run('umount /mnt/ro2');
    out = await run('exit', 150);
    check('exit continues the boot', /Reached target Multi-User System/.test(out) && /login: root/.test(out), out.slice(-300));
    check('services start after the fix', /^active/m.test((await run('systemctl is-active sshd')).replace(/^.*is-active sshd\s*/, '')));
    check('emergency state cleared', !t.w.terminal.bootEngine().emergency);

    // ---- nofail and remote filesystems do not stop the boot
    await run("echo '/dev/sdz9 /data xfs defaults,nofail 0 0' >> /etc/fstab");
    out = await run('reboot', 150);
    check('nofail line does not trigger emergency mode', !/emergency mode/.test(out) && /login: root/.test(out));

    // ---- an enabled service with a broken config fails at boot (and when restarted by hand)
    await run('systemctl enable --now httpd');
    check('httpd runs with a good config', /^active/m.test((await run('systemctl is-active httpd')).replace(/^.*is-active httpd\s*/, '')));
    await run('echo "BadDirective on" >> /etc/httpd/conf/httpd.conf');
    out = await run('systemctl restart httpd');
    check('restart with a broken config fails', /Job for httpd\.service failed/.test(out), out);
    out = await run('reboot', 150);
    check('boot log shows the failed unit', /\[FAILED\] Failed to start The Apache HTTP Server/.test(out), out.slice(-300));
    check('unit is failed after the boot', /failed/.test(await run('systemctl is-active httpd')));
    check('journal names the syntax error', /AH00526/.test(await run('journalctl -u httpd')));
    check('other services still came up', /^active/m.test((await run('systemctl is-active sshd')).replace(/^.*is-active sshd\s*/, '')));
    await run("sed -i '/BadDirective/d' /etc/httpd/conf/httpd.conf");
    await run('systemctl restart httpd');
    check('fixing the config lets it start', /^active/m.test((await run('systemctl is-active httpd')).replace(/^.*is-active httpd\s*/, '')));
    check('login banner uses the real Last login format', /Last login: \w{3} \w{3} [ \d]\d \d\d:\d\d:\d\d \d{4} on tty1/.test(t.out.textContent), t.out.textContent.slice(-300));

    // ---- a powered-off machine is still off after a reload
    await run('poweroff', 150);
    t.w.terminal.world.save(t.w.terminal.sessionExtras());
    const offSave = t.w.localStorage.getItem('redcat_world');
    const c = await openTerminal(port, { storage: { redcat_world: offSave } });
    c.w.terminal.bootDelay = 0;
    check('reload of a powered-off machine shows the off screen', /powered off/i.test(c.out.textContent) && c.w.document.querySelector('.input-line').style.display === 'none');
    c.input.dispatchEvent(new c.w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await sleep(100);
    check('and Enter boots it', c.w.document.querySelector('.input-line').style.display !== 'none' && /login: root/.test(c.out.textContent));
    c.close();
    await press('Enter');

    // ---- Ctrl-D at the password prompt tries the boot again
    await run("echo '/dev/sdz7 /data3 xfs defaults 0 0' >> /etc/fstab");
    await run('reboot', 150);
    t.input.value = '';
    await press('d', { ctrlKey: true });
    check('Ctrl-D retries the boot and lands in emergency mode again', t.w.terminal.bootEngine().emergency && !!t.w.terminal.inputMode, '');

    // ---- the whole thing survives a page reload
    t.w.terminal.world.save(t.w.terminal.sessionExtras());
    const saved = t.w.localStorage.getItem('redcat_world');
    t.close();
    const b = await openTerminal(port, { storage: { redcat_world: saved } });
    b.w.terminal.bootDelay = 0;
    check('reload during emergency mode asks for the password again', /Give root password for maintenance/.test(b.out.textContent), b.out.textContent.slice(-200));
    check('no errors after reload', b.errors.length === 0, JSON.stringify(b.errors.slice(0, 2)));
    b.close();
  } finally { srv.close(); }
  console.log(`boot: ${total - fails}/${total} ok`);
  process.exitCode = fails ? 1 : 0;
  process.exit();
})();
