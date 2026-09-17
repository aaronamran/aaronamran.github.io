/* ═══════════════════════════════════════════════
   scripts.js — Shared site logic
   Accent palette (fixed dark theme) + "You're all caught up" modal
   ═══════════════════════════════════════════════ */
(function () {

  /* ── Accent palette ── */
  const PALETTES = {
    green: { accent: '#39d353', dim: 'rgba(57,211,83,0.12)'  },
    cyan:  { accent: '#00D1FF', dim: 'rgba(0,209,255,0.12)'  },
    pink:  { accent: '#FF2E97', dim: 'rgba(255,46,151,0.14)' },
  };

  const root = document.documentElement;

  function applyPalette(name) {
    const tokens = PALETTES[name] || PALETTES.pink;
    root.style.setProperty('--accent',     tokens.accent);
    root.style.setProperty('--accent-dim', tokens.dim);
    document.querySelectorAll('.swatch').forEach(s =>
      s.classList.toggle('active', s.dataset.palette === name));
    localStorage.setItem('accent-palette', name);
  }

  applyPalette(localStorage.getItem('accent-palette') || 'pink');

  const swatchWrap = document.getElementById('paletteSwatches');
  if (swatchWrap) {
    swatchWrap.addEventListener('click', e => {
      const btn = e.target.closest('.swatch');
      if (btn) applyPalette(btn.dataset.palette);
    });
  }

  /* ── Mobile nav hamburger (injected; hidden on desktop via CSS) ── */
  const topbarInner = document.querySelector('.topbar-inner');
  if (topbarInner) {
    const navToggle = document.createElement('button');
    navToggle.id = 'navToggle';
    navToggle.className = 'icon-btn';
    navToggle.setAttribute('aria-label', 'Toggle navigation');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    topbarInner.insertBefore(navToggle, topbarInner.firstChild);
    navToggle.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = topbarInner.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', e => {
      if (!topbarInner.contains(e.target)) {
        topbarInner.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── "You're all caught up" modal ──
     Activated on any page that has an element with id="nextHackLink".
     The modal is injected into the DOM dynamically so no per-page HTML is needed.
  ── */
  const nextLink = document.getElementById('nextHackLink');
  if (nextLink) {
    // Inject modal markup
    const overlay = document.createElement('div');
    overlay.id        = 'cuModal';
    overlay.className = 'cu-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cuModalTitle');
    overlay.innerHTML = `
      <div class="cu-box">
        <div class="cu-header">
          <span id="cuModalTitle">You're all caught up</span>
        </div>
        <div class="cu-body">
          <div class="cu-img-wrap">
            <img src="/assets/img/bnwimage.gif" alt="" loading="lazy" />
          </div>
          <p>Looks like you're enjoying the blog and have reached the end.</p>
          <p>The next post depends on my next valid submission. Don't worry &mdash; recon for the next story is already in progress.</p>
          <p class="cu-regards">Regards,<br>@aaronamran</p>
        </div>
        <div class="cu-footer">
          <button id="cuClose" class="cu-btn">Close</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    function openModal(e) {
      e.preventDefault();
      overlay.classList.add('active');
      document.getElementById('cuClose').focus();
    }

    function closeModal() {
      overlay.classList.remove('active');
      nextLink.focus();
    }

    nextLink.addEventListener('click', openModal);
    document.getElementById('cuClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });
  }

})();