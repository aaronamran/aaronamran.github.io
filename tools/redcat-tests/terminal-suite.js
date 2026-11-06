// Drives the real terminal page in jsdom: smoke battery for broken output and tab-completion checks.
const fs = require('fs'), path = require('path');
const { startServer, openTerminal, sleep } = require('./lib');

const BAD = /undefined|\[object|NaN|TypeError|is not a function|Cannot read|is not defined|ReferenceError|RangeError|Maximum call/;

// [typed text, tab presses, expected input value after, optional substrings the listing must contain]
const TAB_CASES = [
  ['syst', 1, 'system'],
  ['systemctl sta', 2, 'systemctl sta', ['start', 'status']],
  ['systemctl restart sshd', 1, 'systemctl restart sshd.service '],
  ['dnf ins', 1, 'dnf install '],
  ['cat /etc/ho', 1, 'cat /etc/host'],
  ['cd /et', 1, 'cd /etc/'],
  ['echo $HOS', 1, 'echo $HOSTNAME '],
  ['ls ~roo', 1, 'ls ~root/'],
  ['podman ru', 1, 'podman run '],
  ['git ch', 1, 'git che'],
  ['firewall-cmd --perm', 1, 'firewall-cmd --permanent '],
  ['chown ro', 1, 'chown root:'],
  ['useradd -', 2, 'useradd -', ['--b', '-m', '-s']],
  ['ls /etc/pass', 1, 'ls /etc/passwd '],
  ['nmcli con', 1, 'nmcli connection '],
  ['semanage fc', 1, 'semanage fcontext '],
];

(async () => {
  const { srv, port } = await startServer();
  let failures = 0;
  try {
    const t = await openTerminal(port);

    const cmds = fs.readFileSync(path.join(__dirname, 'data/smoke-commands.txt'), 'utf8').split('\n').filter(Boolean);
    let ran = 0, problems = 0;
    for (const c of cmds) {
      if (c === '^C' || c === '^Z' || c === '^D') { t.key(c[1].toLowerCase(), { ctrlKey: true }); await sleep(50); continue; }
      const txt = await t.run(c);
      ran++;
      const hit = txt.replace(c, '').split('\n').filter(l => BAD.test(l));
      if (hit.length) { problems++; console.log(`SMOKE PROBLEM: ${c}\n   ${hit.slice(0, 2).join(' | ').slice(0, 300)}`); }
    }
    console.log(`terminal (smoke): ran ${ran}, problems ${problems}`);
    failures += problems;

    let tabFail = 0;
    for (const [typed, times, want, listed = []] of TAB_CASES) {
      const r = await t.tab(typed, times);
      const miss = listed.filter(x => !r.listing.includes(x));
      if (r.value !== want || miss.length) {
        tabFail++;
        console.log(`TAB FAIL: ${JSON.stringify(typed)} x${times} => ${JSON.stringify(r.value)} (want ${JSON.stringify(want)})${miss.length ? ' missing in listing: ' + miss : ''}`);
      }
      await t.run('', 10);
    }
    console.log(`terminal (tab completion): ${TAB_CASES.length - tabFail}/${TAB_CASES.length} ok`);
    failures += tabFail;

    if (t.errors.length) { console.log('terminal: page JS errors:', t.errors.slice(0, 3)); failures += t.errors.length; }
    t.close();
  } finally { srv.close(); }
  process.exitCode = failures ? 1 : 0;
  process.exit();
})();
