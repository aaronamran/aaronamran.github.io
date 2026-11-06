// Machine state survives a reload: page 1 changes things and saves, page 2 is seeded with that save.
const { startServer, openTerminal, sleep } = require('./lib');

(async () => {
  const { srv, port } = await startServer();
  let fails = 0, total = 0;
  const check = (name, cond, extra = '') => { total++; if (!cond) { fails++; console.log(`PERSIST FAIL: ${name} ${extra}`); } };
  try {
    const a = await openTerminal(port);
    const setup = [
      'useradd tester', 'echo hi > /tmp/persist.txt', 'mkdir -p /srv/data', 'systemctl stop chronyd', 'systemctl disable sshd',
      'dnf install -y tree', 'setenforce 0', 'firewall-cmd --add-service=http', 'firewall-cmd --permanent --add-service=https',
      'hostnamectl set-hostname lab2.example.com', 'sysctl -w vm.swappiness=10',
      "echo '5 4 * * * /usr/local/bin/x.sh' | crontab -", 'podman run -d --name web ubi9 sleep 1000',
      'groupadd devs', 'usermod -aG devs tester', 'sleep 500 &', 'nohup sleep 600 &', 'cd /srv/data',
    ];
    for (const c of setup) await a.run(c, 120);
    const before = {
      uptime: (await a.run('uptime -s')).trim(),
      ps: (await a.run('ps -e | wc -l')).trim(),
    };
    check('page 1 saved', a.w.terminal.world.save());
    const saved = a.w.localStorage.getItem('redcat_world');
    check('save record exists and is a reasonable size', !!saved && saved.length > 1000 && saved.length < 2000000, String(saved && saved.length));
    a.close();

    const b = await openTerminal(port, { storage: { redcat_world: saved } });
    const run = async (c, ms) => (await b.run(c, ms || 120)).replace(/ /g, ' ');
    check('no page errors on reload', b.errors.length === 0, JSON.stringify(b.errors.slice(0, 2)));
    check('user survives', /uid=\d+\(tester\)/.test(await run('id tester')));
    check('supplementary group survives', /devs/.test(await run('id tester')));
    check('file survives', /persist\.txt\s*hi/.test(await run('cat /tmp/persist.txt')));
    check('cwd survives', /\/srv\/data/.test(await run('pwd')));
    check('stopped service stays stopped', /inactive/.test(await run('systemctl is-active chronyd')));
    check('disabled service stays disabled', /disabled/.test(await run('systemctl is-enabled sshd')));
    check('installed package survives', /tree/.test(await run('rpm -q tree')) && !/not installed/.test(await run('rpm -q tree')));
    check('tree command exists', !/not found/.test(await run('type tree')));
    check('selinux mode survives', /Permissive/.test(await run('getenforce')));
    check('runtime firewall rule survives a reload', /http\b/.test(await run('firewall-cmd --list-services')));
    check('permanent firewall rule survives', /https/.test(await run('firewall-cmd --permanent --list-services')));
    check('hostname survives', /lab2\.example\.com/.test(await run('hostname')));
    check('sysctl value survives', /= 10/.test(await run('sysctl vm.swappiness')));
    check('crontab survives', /x\.sh/.test(await run('crontab -l')));
    check('container survives', /web/.test(await run('podman ps -a')));
    check('uptime keeps counting from the same boot', (await run('uptime -s')).trim() === before.uptime, before.uptime + ' vs ' + (await run('uptime -s')).trim());
    check('shell jobs end with the old shell', /^\s*$/.test((await run('jobs')).replace(/^.*jobs/, '')), await run('jobs'));
    const sl = await run('pgrep -a sleep');
    check('nohup job keeps running, plain job is gone', /600/.test(sl) && !/ 500/.test(sl), sl);
    check('commands keep working', /hello/.test(await run('echo hello')));
    check('new work after reload saves again', b.w.terminal.world.save());
    b.close();

    // a save from a different version of the site is ignored
    const stale = JSON.parse(saved); stale.finger = 'other';
    const c = await openTerminal(port, { storage: { redcat_world: JSON.stringify(stale) } });
    check('stale save is ignored', /no such user|no such/i.test(await c.run('id tester')) || /cannot find/i.test(await c.run('id tester')));
    c.close();

    // a corrupt save is ignored too
    const d = await openTerminal(port, { storage: { redcat_world: '{not json' } });
    check('corrupt save does not break the terminal', /hello/.test(await d.run('echo hello')) && d.errors.length === 0);
    d.close();
  } finally { srv.close(); }
  console.log(`persistence: ${total - fails}/${total} ok`);
  process.exitCode = fails ? 1 : 0;
  process.exit();
})();
