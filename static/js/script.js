// ---- SPA setup ----
const navbar    = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.querySelector('.nav-links');

// Set CSS var for #app top offset — runs before first paint via rAF
function setNavH() {
  document.documentElement.style.setProperty('--nav-h', navbar.offsetHeight + 'px');
}
setNavH();
window.addEventListener('resize', setNavH);
// Remove the inline fallback style once we have the real value
document.getElementById('nav-height-init').remove();

// ---- View switching ----
function switchView(id, push) {
  if (typeof push === 'undefined') push = true;
  if (!document.getElementById('view-' + id)) id = 'home';

  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.setAttribute('aria-hidden', 'true');
  });

  const target = document.getElementById('view-' + id);
  target.classList.add('active');
  target.setAttribute('aria-hidden', 'false');
  target.scrollTop = 0;

  // Nav highlight (none on home)
  document.querySelectorAll('.nav-links [data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === id && id !== 'home');
  });

  // Navbar loses scroll-blur on home, keeps it otherwise
  navbar.classList.toggle('scrolled', id !== 'home');

  if (push) {
    const url = id === 'home' ? location.pathname : location.pathname + '#' + id;
    history.pushState({ view: id }, '', url);
  }
}

// Event delegation — catch all [data-view] clicks
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-view]');
  if (!trigger) return;
  e.preventDefault();
  switchView(trigger.dataset.view);
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
});

// Hash routing (back/forward + direct links)
function routeFromHash() {
  const hash = location.hash.slice(1);
  switchView(hash || 'home', false);
}
window.addEventListener('popstate', routeFromHash);
routeFromHash();

// ---- Hamburger ----
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// ---- Platform tab switching (Labs view) ----
const platformSections = document.querySelectorAll('#view-labs .platform-section');
const platformTabs     = document.querySelectorAll('#platform-tabs .platform-tab');

function switchPlatform(pid) {
  platformTabs.forEach(t => t.classList.toggle('active', t.dataset.platform === pid));
  platformSections.forEach(s => { s.hidden = s.id !== 'platform-' + pid; });
}
platformTabs.forEach(tab => tab.addEventListener('click', () => switchPlatform(tab.dataset.platform)));

// ---- Filter + Show More (writeup lists) ----
const PER_PAGE = 10;

function initList(listId, filtersId) {
  const list    = document.getElementById(listId);
  const moreBtn = document.getElementById(listId + '-more');
  if (!list) return;

  const allRows = Array.from(list.querySelectorAll('.writeup-row'));
  let activeFilter = 'all';
  let visible = PER_PAGE;

  function getFiltered() {
    return activeFilter === 'all' ? allRows : allRows.filter(r => r.dataset.filter === activeFilter);
  }

  function render() {
    const f = getFiltered();
    allRows.forEach(r => r.classList.add('card-hidden'));
    f.slice(0, visible).forEach(r => r.classList.remove('card-hidden'));
    if (moreBtn) {
      const rem = f.length - visible;
      moreBtn.hidden = rem <= 0;
      if (rem > 0) moreBtn.textContent = 'Show more (' + Math.min(rem, PER_PAGE) + ' of ' + rem + ' remaining)';
    }
  }

  if (filtersId) {
    document.querySelectorAll('#' + filtersId + ' .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#' + filtersId + ' .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        visible = PER_PAGE;
        render();
      });
    });
  }

  if (moreBtn) moreBtn.addEventListener('click', () => { visible += PER_PAGE; render(); });
  render();
}

function initShowMore(gridId) {
  const grid    = document.getElementById(gridId);
  const moreBtn = document.getElementById(gridId + '-more');
  if (!grid) return;
  const allItems = Array.from(grid.children);
  let visible = PER_PAGE;
  function render() {
    allItems.forEach((item, i) => item.classList.toggle('card-hidden', i >= visible));
    if (moreBtn) {
      const rem = allItems.length - visible;
      moreBtn.hidden = rem <= 0;
      if (rem > 0) moreBtn.textContent = 'Show more (' + Math.min(rem, PER_PAGE) + ' of ' + rem + ' remaining)';
    }
  }
  if (moreBtn) moreBtn.addEventListener('click', () => { visible += PER_PAGE; render(); });
  render();
}

initList('bb-list',  'bb-filters');
initList('htb-list', 'htb-filters');
initList('thm-list', 'thm-filters');
initList('ctf-list', 'ctf-filters');
initShowMore('cert-grid');
