# Red Cat regression tests

Runs against the Red-Cat pages in jsdom (no real browser). It finds the project itself: `static/redcat` when it sits inside the website repo, the repository root when it sits inside a standalone Red-Cat checkout; set `REDCAT_ROOT` to point at another copy. Hugo ignores this folder.

    npm install
    npm test

- `validation-answers.js` / `validation-edge.js`: accepted and rejected answers for the trainer's `validateCommand`.
- `landing-suite.js`: the landing page loads cleanly, lists all 20 chapters and Back works.
- `practice-suite.js`: opens practice mode and answers every task whose answer can be derived from its data, through the real page.
- `modal-suite.js`: plays the root-password-reset simulator (sections 19 and 20) end to end and opens the section 4 `vi` editor.
- `pager-suite.js`, `persist-suite.js`, `boot-suite.js`: less/more/man/top, the saved machine, reboot and emergency mode.
- `terminal-suite.js`: loads `terminal.html`, runs `data/smoke-commands.txt` and fails on output containing `undefined`, `[object`, `NaN` or JS errors, then checks tab completion.

Add a command to `data/smoke-commands.txt` (`^C`, `^Z`, `^D` send Ctrl keys) or a row to `TAB_CASES` when you add a feature.
