// Landing page (index.html): loads without errors, the chapter picker lists every section and Back returns to the mode choice.
const { startServer } = require('./lib');
const { JSDOM, VirtualConsole } = require('jsdom');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const { srv, port } = await startServer();
  let total = 0, fails = 0;
  const check = (name, cond, extra = '') => { total++; if (!cond) { fails++; console.log(`LANDING FAIL: ${name} ${extra}`); } };
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errs.push(e.detail && e.detail.stack ? e.detail.stack : e.message));
  vc.on('error', (...a) => errs.push(a.join(' ')));
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/index.html`, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} }); },
  });
  await sleep(1200);
  const doc = dom.window.document;
  const visible = (sel) => { const el = doc.querySelector(sel); return !!el && el.style.display !== 'none'; };

  check('landing page loads without errors', errs.length === 0, (errs[0] || '').split('\n')[0]);
  check('mode choice is shown', visible('.practice-mode-section'));
  doc.getElementById('select-chapter-btn').click();
  await sleep(100);
  check('chapter picker is shown', doc.getElementById('chapter-selection').style.display === 'block');
  const n = doc.querySelectorAll('.chapter-card').length;
  check('chapter picker lists all 20 sections', n === 20, String(n));
  doc.getElementById('back-to-mode').click();
  await sleep(100);
  check('Back returns to the mode choice', doc.getElementById('chapter-selection').style.display === 'none' && visible('.practice-mode-section'));
  check('no errors afterwards', errs.length === 0, (errs[0] || '').split('\n')[0]);

  srv.close();
  console.log(`landing: ${total - fails}/${total} ok`);
  process.exitCode = fails ? 1 : 0;
  process.exit();
})();
