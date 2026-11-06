// Interactive pager (less, more, man): opens only on a terminal, scrolls, searches and restores the screen on exit.
const { startServer, openTerminal, sleep } = require('./lib');

(async () => {
  const { srv, port } = await startServer();
  let fails = 0, total = 0;
  const check = (name, cond, extra = '') => { total++; if (!cond) { fails++; console.log(`PAGER FAIL: ${name} ${extra}`); } };
  try {
    const t = await openTerminal(port);
    const doc = t.w.document;
    const overlay = () => doc.querySelector('.pager-overlay');
    const body = () => overlay() ? Array.from(overlay().children[0].children).map(d => d.textContent.replace(/ /g, '')) : [];
    const status = () => overlay() ? overlay().children[1].textContent.replace(/\u00a0/g, '') : '';
    const press = async (k, o = {}) => { t.input.dispatchEvent(new t.w.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, o))); await sleep(5); };
    const typeKeys = async s => { for (const ch of s) await press(ch); };
    const inputVisible = () => doc.querySelector('.input-line').style.display !== 'none';

    await t.run('seq 1 100 > /tmp/n.txt');
    await t.run('printf "alpha\nbeta\ngamma\n" > /tmp/short.txt');

    // ---- less
    await t.run('less /tmp/n.txt');
    check('less opens an overlay', !!overlay());
    check('terminal input hidden while paging', !inputVisible());
    check('first screen starts at line 1', body()[0] === '1', JSON.stringify(body().slice(0, 2)));
    check('first screen status is ":"', status() === ':', status());
    await press(' ');
    check('space scrolls a screen', body()[0] === '24', body()[0]);
    await press('b');
    check('b scrolls back', body()[0] === '1', body()[0]);
    await press('j'); await press('j');
    check('j scrolls by line', body()[0] === '3', body()[0]);
    await press('k');
    check('k scrolls up a line', body()[0] === '2', body()[0]);
    await press('G');
    check('G reaches the end', status() === '(END)' && body().includes('100'), status());
    await press('g');
    check('g returns to top', body()[0] === '1');
    await typeKeys('/'); await typeKeys('50'); check('search prompt shows typed text', status() === '/50', status()); await press('Enter');
    check('search jumps to match', body()[0] === '50', body()[0]);
    await press('n');
    await press('g'); await typeKeys('/'); await typeKeys('7'); await press('Enter');
    check('search for 7 lands on line 7', body()[0] === '7', body()[0]);
    await press('n');
    check('n finds the next match', body()[0] === '17', body()[0]);
    await press('N');
    check('N searches backwards', body()[0] === '7', body()[0]);
    await press('g');
    await typeKeys('/'); await typeKeys('nomatch'); await press('Enter');
    check('missing pattern is reported', /Pattern not found/.test(status()), status());
    await press('Enter');
    await press('g'); await press('5'); await press('0'); await press('G');
    check('50G goes to line 50', body()[0] === '50', body()[0]);
    await press('c', { ctrlKey: true });
    check('Ctrl+C does not leave less', !!overlay());
    await press('h');
    check('h shows help', /SUMMARY OF LESS COMMANDS/.test(body().join('\n')));
    await press('q');
    check('q inside help returns to the file', !!overlay() && !/SUMMARY/.test(body().join('\n')));
    await press('q');
    check('q quits less', !overlay() && inputVisible());
    check('scrollback kept after quitting', t.out.innerHTML.includes('less /tmp/n.txt'));
    check('less leaves no file text behind', !/\n99\n/.test(t.out.textContent));

    // ---- less variants
    await t.run('less -N /tmp/short.txt');
    check('-N numbers lines', /^\s+1\s+alpha/.test(body()[0]), body()[0]);
    check('short file still shows (END)', status() === '(END)', status());
    await press('q');
    let r = await t.run('less -F /tmp/short.txt');
    check('-F prints short input directly', !overlay() && /alpha/.test(r) && /gamma/.test(r));
    await t.run('cat /tmp/n.txt | less');
    check('piping into less pages stdin', !!overlay() && body()[0] === '1');
    await press('q');
    r = await t.run('less /tmp/n.txt | tail -1');
    check('less into a pipe does not page', !overlay() && /100/.test(r), r.slice(-60));
    await t.run('less +/77 /tmp/n.txt');
    check('+/pattern starts at the match', body()[0] === '77', body()[0]);
    await press(':'); await press('q');
    check(':q quits', !overlay());
    r = await t.run('less /tmp/missing');
    check('missing file errors without paging', !overlay() && /No such file/.test(r));

    // ---- more
    await t.run('more /tmp/n.txt');
    check('more opens', !!overlay() && /^--More--\(23%\)/.test(status()), status());
    await press(' ');
    check('more advances', body()[0] === '24');
    await press('b');
    check('more goes back a screen', body()[0] === '1', body()[0]);
    for (let i = 0; i < 6 && overlay(); i++) await press(' ');
    check('more quits at the end', !overlay() && inputVisible());
    check('more leaves the text it showed', /\n23\n/.test(t.out.textContent) && /\n99\n/.test(t.out.textContent));
    r = await t.run('more /tmp/short.txt');
    check('short file prints without paging', !overlay() && /beta/.test(r));
    await t.run('more /tmp/n.txt'); await press('q');
    check('q quits more', !overlay());

    // ---- man
    await t.run('man ls');
    check('man opens the pager', !!overlay());
    check('man status line', /^Manual page ls\(1\) line 1/.test(status()), status());
    check('man shows the page', /LS\(1\)/.test(body()[0]), body()[0]);
    await press('G');
    check('man END status', /\(END\)/.test(status()), status());
    await press('q');
    check('man quits', !overlay() && inputVisible());
    await t.run('man 1 ls'); check('man accepts a section number', !!overlay()); await press('q');
    r = await t.run('man ls | head -3');
    check('man into a pipe does not page', !overlay() && /LS\(1\)/.test(r));
    r = await t.run('x=$(man ls); echo ${#x}');
    check('man in $(...) does not page', !overlay());
    r = await t.run('man nonexistentcmd');
    check('unknown man page is an error', !overlay() && /No manual entry/.test(r));

    // ---- top
    await t.run('top');
    check('top opens a live view', !!overlay() && /^top - \d\d:\d\d:\d\d up/.test(body()[0]), body()[0]);
    check('top hides the shell input', !inputVisible());
    check('top shows the process table', body().some(l => /PID USER\s+PR\s+NI/.test(l)) && body().some(l => /systemd/.test(l)));
    check('top has no pager status line', status() === '', JSON.stringify(status()));
    const firstPid = () => (body().find((l, i) => i > 6 && /\d/.test(l)) || '').trim().split(/\s+/)[0];
    await press('N');
    check('N sorts by PID', firstPid() === '1', firstPid());
    await press('M');
    const memTop = firstPid();
    await press('P');
    check('M and P re-sort', memTop !== '' && firstPid() !== '', memTop + '/' + firstPid());
    await press('h');
    check('top help', /Help for Interactive Commands/.test(body().join('\n')));
    await press('q');
    check('q leaves help, not top', !!overlay() && !/Help for Interactive/.test(body().join('\n')));
    await press('q');
    check('q quits top', !overlay() && inputVisible());
    check('top leaves nothing behind', !/PID USER/.test(t.out.textContent));

    r = await t.run('top -b -n 1');
    check('top -b prints a snapshot', !overlay() && /PID USER/.test(r));
    r = await t.run('top -b -n 1 | head -2');
    check('top into a pipe does not page', !overlay() && /top - /.test(r));

    await t.run('top -d 0.5');
    const before = body()[0];
    await sleep(1300);
    check('top refreshes on its own', overlay() && body()[0] !== before, before + ' -> ' + body()[0]);
    await press('q');

    await t.run('sleep 300 &');
    r = await t.run('pgrep sleep');
    const pid = (r.match(/\d+/g) || []).pop();
    check('background sleep exists', !!pid, r);
    await t.run('top');
    await press('k');
    check('k asks for a PID', /^PID to signal\/kill/.test(status()), status());
    for (const ch of pid) await press(ch);
    await press('Enter');
    check('k asks for a signal', /^Send pid \d+ signal/.test(status()), status());
    await press('9'); await press('Enter');
    check('kill is reported', /Sent signal 9/.test(status()), status());
    await press('q');
    r = await t.run('pgrep sleep');
    check('killed process is gone', !new RegExp('\\b' + pid + '\\b').test(r), r);

    // ---- screen state afterwards
    r = await t.run('echo back');
    check('shell works after paging', /back/.test(r));
    check('no page errors', t.errors.length === 0, JSON.stringify(t.errors.slice(0, 2)));
    t.close();
  } finally { srv.close(); }
  console.log(`pager: ${total - fails}/${total} ok`);
  process.exitCode = fails ? 1 : 0;
  process.exit();
})();
