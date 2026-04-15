// count.js — Update these numbers when adding new content.
// Cert counts are derived from the DOM automatically (index.html cert tables).

const counts = {
  vulnerabilityDisclosures: 10,
  algorithmsSolved: 2,
  ctfChallenges: {
    hackthebox:      0,
    hacksmarter:     0,
    hackviser:       26,
    overthewire:     1,
    k8slanparty:     0,
    redtigershackit: 0,
    underthewire:    0
  }
};

function getTotalCTF() {
  return Object.values(counts.ctfChallenges).reduce((sum, n) => sum + n, 0);
}

// Count <tbody tr> rows across all cert panels in the DOM.
// Only has a non-zero result on index.html where the panels exist.
function getTotalCerts() {
  const panels = [
    'cert-offensive',
    'cert-defensive',
    'cert-cloud',
    'cert-software',
    'cert-general'
  ];
  return panels.reduce((sum, id) => {
    const el = document.getElementById(id);
    return sum + (el ? el.querySelectorAll('tbody tr').length : 0);
  }, 0);
}

function updateCounts() {
  // Vulnerability disclosures (ethicalhacking + about sidebar)
  document.querySelectorAll('[id="vuln-count"]').forEach(el => {
    el.textContent = counts.vulnerabilityDisclosures;
  });

  // Total CTF writeups (hacking-labs sidebar)
  document.querySelectorAll('[id="ctf-count"]').forEach(el => {
    el.textContent = getTotalCTF();
  });

  // Total solved algorithms problems (algorithms sidebar)
  document.querySelectorAll('[id="algo-count"]').forEach(el => {
    el.textContent = counts.algorithmsSolved;
  });

  // Platform cards — DOM-counted; only has a value on hacking-labs/index.html
  const platformCount = document.querySelectorAll('.platform-card').length;
  document.querySelectorAll('[id="platform-count"]').forEach(el => {
    el.textContent = platformCount;
  });

  // Cert total — DOM-counted from all 5 cert panel tbody rows
  const certTotal = getTotalCerts();
  document.querySelectorAll('[id="cert-count"], [id="cert-total"]').forEach(el => {
    el.textContent = certTotal;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateCounts);
} else {
  updateCounts();
}

