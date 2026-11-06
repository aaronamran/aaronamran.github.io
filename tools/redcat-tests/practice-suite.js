// Practice mode: every section loads, and the answer implied by each task's expected data is accepted by the real page.
// Sections driven by modal editors (4: vi scripts, 19/20: boot simulator) are only loaded, not played.
const { startServer } = require('./lib');
const { JSDOM, VirtualConsole } = require('jsdom');

const MODAL = new Set([4, 19, 20]);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const { srv, port } = await startServer();
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errs.push(e.message));
  vc.on('error', (...a) => errs.push(a.map(x => (x && x.stack) || String(x)).join(' ')));
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/practice.html`, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.confirm = () => true; w.Element.prototype.scrollIntoView = () => {}; w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} }); },
  });
  await sleep(1500);
  const w = dom.window;
  const bad = [];
  let total = 0, played = 0, sections = 0;
  const ids = w.eval('sections.map(s => s.id)');
  for (const sid of ids) {
    sections++;
    for (let set = 1; set <= 6; set++) {
      const has = w.eval(`!!sections.find(s => s.id === ${sid}).questionSets.set${set}`);
      if (!has) continue;
      try { w.eval(`getQuestionSetForSection = () => ${set}; resetSectionProgress(${sid}); loadSection(${sid}); void 0`); } catch (e) { bad.push(`S${sid}/set${set}: load threw ${e.message}`); continue; }
      const tasks = w.eval(`getSectionById(${sid}, ${set}).tasks.map(t => ({ id: t.id, expected: t.expected, modal: !!(t.bootModal || t.triggersBootModal) }))`);
      total += tasks.length;
      if (MODAL.has(sid)) continue;
      for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        const v = [].concat(t.expected).find(x => x && !x.match);
        if (!v) continue;   // "write the line" tasks have no command to synthesise
        const q = (x) => (/\s/.test(x) && !/['"]/.test(x) ? `"${x}"` : x);   // data that already carries quotes stays as is
        const rest = v.orderedValues && v.orderedValues.length ? v.orderedValues : (v.requiredValues || []);
        const cmd = [v.command, ...(v.requiredFlags || []), ...rest].map(q).join(' ');
        w.eval(`appState.currentTaskIndex = ${i}`);   // each task is tested on its own
        w.document.getElementById('terminal-input').value = cmd;
        const before = i;
        try { w.eval('handleSubmit()'); } catch (e) { bad.push(`S${sid}/set${set}/#${t.id}: threw ${e.message}`); break; }
        const after = w.eval('appState.currentTaskIndex');
        played++;
        if (after !== before + 1) bad.push(`S${sid}/set${set}/#${t.id}: not accepted: ${cmd}`);
      }
    }
  }
  srv.close();
  // a few tasks have intentionally vague data (a bare command with no arguments to synthesise from)
  console.log(`practice: ${sections} sections, ${total} tasks, ${played} answered, ${bad.length} not accepted, ${errs.length} page errors`);
  for (const b of bad.slice(0, 400)) console.log('  ' + b.slice(0, 200));
  if (errs.length) console.log('  errors:', errs.slice(0, 3));
  process.exitCode = errs.length ? 1 : 0;
  process.exit();
})();
