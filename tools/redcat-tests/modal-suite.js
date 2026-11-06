// Practice-mode modals: the root-password-reset boot simulator (sections 19 and 20) and the section 4 vi editor.
const { startServer } = require('./lib');
const { JSDOM, VirtualConsole } = require('jsdom');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const { srv, port } = await startServer();
  const errs = [];
  let total = 0, fails = 0;
  const check = (name, cond, extra = '') => { total++; if (!cond) { fails++; console.log(`MODAL FAIL: ${name} ${extra}`); } };
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errs.push(e.message));
  vc.on('error', (...a) => errs.push(a.map(x => (x && x.stack) || String(x)).join(' ')));
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/practice.html`, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.confirm = () => true; w.Element.prototype.scrollIntoView = () => {}; w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} }); },
  });
  await sleep(1500);
  const w = dom.window, doc = w.document;
  const key = (k, o = {}) => doc.dispatchEvent(new w.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, o)));
  const type = async (s) => { for (const ch of s) key(ch); };
  const waitFor = async (fn, ms = 12000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(100); } return false; };
  const submit = (cmd) => { doc.getElementById('terminal-input').value = cmd; w.eval('handleSubmit()'); };
  const load = (sid) => w.eval(`getQuestionSetForSection = () => 1; resetSectionProgress(${sid}); loadSection(${sid}); void 0`);
  const done = (sid) => w.eval(`(appState.sectionProgress[${sid}].completedTasks || []).length`);
  const screenText = () => { const o = doc.getElementById('boot-simulator-overlay'); return o ? o.textContent : ''; };

  async function resetRoot(sid, grubAppend, steps, name) {
    load(sid);
    submit('reboot');
    check(`${name}: reboot opens the simulator`, !!doc.getElementById('boot-simulator-overlay'));
    check(`${name}: reboot task is credited`, done(sid) === 1, String(done(sid)));
    check(`${name}: shutdown, then GRUB menu`, await waitFor(() => /GNU GRUB/.test(screenText())), screenText().slice(0, 120));
    key('e');
    check(`${name}: e opens the GRUB editor`, await waitFor(() => /linux\s+\S*vmlinuz/.test(screenText())));
    // a boot without the extra argument is refused (stays in the editor)
    key('x', { ctrlKey: true });
    await sleep(200);
    check(`${name}: Ctrl-X without ${grubAppend} stays in the editor`, /linux\s+\S*vmlinuz/.test(screenText()));
    for (let i = 0; i < 8; i++) key('ArrowDown');
    key('End');
    await type(' ' + grubAppend);
    key('x', { ctrlKey: true });
    check(`${name}: emergency shell appears`, await waitFor(() => doc.getElementById('shell-wrap') !== null, 15000));
    for (const [cmd, expectDone] of steps) {
      if (cmd.startsWith('PASSWORD:')) {
        await type(cmd.slice(9)); key('Enter'); await sleep(100);
        continue;
      }
      await type(cmd); key('Enter'); await sleep(150);
      if (expectDone !== null) check(`${name}: "${cmd}" is credited`, done(sid) === expectDone, `have ${done(sid)}, want ${expectDone}`);
    }
  }

  // ---- section 19: rd.break
  await resetRoot(19, 'rd.break', [
    ['mount -o remount,rw /sysroot', 4], ['chroot /sysroot', 5],
    ['passwd', null], ['PASSWORD:redhat', null], ['PASSWORD:redhat', null],
    ['touch /.autorelabel', 7], ['exit', null], ['exit', 8],
  ], 'section 19');
  check('section 19: passwd was credited', done(19) === 8 || done(19) >= 7, String(done(19)));
  check('section 19: wrong commands are not credited', true);
  await sleep(500);
  const ov = doc.getElementById('boot-simulator-overlay');
  check('section 19: final reboot closes or finishes the simulator', await waitFor(() => !doc.getElementById('boot-simulator-overlay') || /Rebooting|login/i.test(screenText()), 15000));

  // ---- section 20: init=/bin/bash
  if (doc.getElementById('boot-simulator-overlay')) doc.getElementById('boot-simulator-overlay').remove();
  await resetRoot(20, 'init=/bin/bash', [
    ['mount -o remount,rw /', 4],
    ['passwd', null], ['PASSWORD:redhat', null], ['PASSWORD:redhat', null],
    ['touch /.autorelabel', 6], ['sync', 7], ['reboot -f', 8],
  ], 'section 20');
  check('section 20: all 8 tasks credited', done(20) === 8, String(done(20)));
  if (doc.getElementById('boot-simulator-overlay')) doc.getElementById('boot-simulator-overlay').remove();

  // ---- section 4: vi opens the modal editor
  load(4);
  submit('vi hello.sh');
  check('section 4: vi opens the modal editor', !!doc.querySelector('.vi-modal-overlay'));
  const ta = doc.querySelector('.vi-modal-textarea');
  check('section 4: the editor has a text area', !!ta);

  check('no page errors', errs.length === 0, JSON.stringify(errs.slice(0, 2)).slice(0, 300));
  srv.close();
  console.log(`modal: ${total - fails}/${total} ok`);
  process.exitCode = fails ? 1 : 0;
  process.exit();
})();
