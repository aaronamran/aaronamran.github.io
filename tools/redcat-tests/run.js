// Runs every suite as its own process and reports an overall result. Usage: npm test
const { spawnSync } = require('child_process');
const suites = ['validation-answers.js', 'validation-edge.js', 'terminal-suite.js', 'pager-suite.js', 'persist-suite.js', 'boot-suite.js', 'practice-suite.js', 'modal-suite.js', 'landing-suite.js'];
let failed = 0;
for (const s of suites) {
  const r = spawnSync(process.execPath, [s], { cwd: __dirname, encoding: 'utf8' });
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
  if (r.status !== 0) { failed++; console.log(`>> ${s} FAILED`); }
}
console.log(failed ? `\n${failed} suite(s) failed` : '\nall suites passed');
process.exit(failed ? 1 : 0);
