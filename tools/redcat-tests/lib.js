// Shared helpers: static server for static/redcat and a jsdom terminal driver.
const http = require('http'), fs = require('fs'), path = require('path');
// REDCAT_ROOT overrides; otherwise the site layout (static/redcat) or a standalone Red-Cat checkout (repo root)
const ROOT = process.env.REDCAT_ROOT
  ? path.resolve(process.env.REDCAT_ROOT)
  : [path.resolve(__dirname, '../../static/redcat'), path.resolve(__dirname, '../..')].find(p => fs.existsSync(path.join(p, 'terminal.html')));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

function startServer() {
  return new Promise(resolve => {
    const srv = http.createServer((q, r) => {
      const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
      fs.readFile(p, (e, d) => {
        if (e) { r.writeHead(404); return r.end(); }
        r.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
        r.end(d);
      });
    }).listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Loads terminal.html and returns helpers to type lines, press keys and read output.
async function openTerminal(port, opts = {}) {
  const { JSDOM, VirtualConsole } = require('jsdom');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  vc.on('error', (...a) => errors.push(a.map(x => (x && x.stack) || String(x)).join(' ')));
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/terminal.html`, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} });
      w.Element.prototype.scrollIntoView = () => {};
      // opts.storage seeds localStorage, so a second page can pick up where a first one left off
      for (const [k, v] of Object.entries(opts.storage || {})) w.localStorage.setItem(k, v);
    },
  });
  await sleep(1500);
  const w = dom.window, input = w.document.getElementById('commandInput'), out = w.document.getElementById('output');
  const key = (k, o = {}) => input.dispatchEvent(new w.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true }, o)));
  const text = from => out.innerHTML.slice(from).replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
  async function run(line, wait = 60) {
    const before = out.innerHTML.length;
    input.value = line; key('Enter');
    await sleep(wait);
    return text(before);
  }
  // Types `partial`, presses Tab `times` times; returns the resulting input value and any listing printed.
  async function tab(partial, times = 1) {
    input.value = partial;
    try { input.setSelectionRange(partial.length, partial.length); } catch (e) {}
    const before = out.innerHTML.length;
    for (let i = 0; i < times; i++) key('Tab');
    return { value: input.value, listing: text(before) };
  }
  return { w, input, out, key, run, tab, errors, close: () => w.close() };
}

module.exports = { ROOT, startServer, openTerminal, sleep };
