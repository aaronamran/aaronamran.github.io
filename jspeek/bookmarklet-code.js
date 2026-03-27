/**
 * JSPeek - Web Application Security Bookmarklet
 * Scans current page and opens results in a new tab (CSP/Trusted Types safe)
 */
(function() {
  'use strict';

  if (window.jspeekActive) {
    alert('JSPeek is already scanning!');
    return;
  }
  window.jspeekActive = true;

  const currentUrl = window.location.href;
  const doc = document;

  // Show notification
  alert('🔍 JSPeek is scanning this page...\n\nResults will open in a new tab when complete.');

  // Results storage
  const results = {
    scripts: [],
    endpoints: new Set(),
    secrets: new Set(),
    findings: [],
    technologies: new Set(),
    cmsInfo: []
  };

  // Secret patterns
  const secretPatterns = {
    'AWS Key': /AKIA[0-9A-Z]{16}/g,
    'Google API': /AIza[0-9A-Za-z\-_]{35}/g,
    'Stripe Live': /sk_live_[0-9a-zA-Z]{24,}/g,
    'GitHub PAT': /ghp_[0-9a-zA-Z]{36}/g,
    'Slack Token': /xox[baprs]-[0-9a-zA-Z\-]{10,48}/g,
    'JWT': /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g,
    'Private Key': /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
    'MongoDB': /mongodb(?:\+srv)?:\/\/[^\s"\'<>]+/g,
    'PostgreSQL': /postgres(?:ql)?:\/\/[^\s"\'<>]+/g,
    'Facebook Token': /EAACEdEose0cBA[A-Z0-9]{20,}/g,
    'Slack Webhook': /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+/g,
    'Discord Webhook': /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/g,
    'Algolia API Key': /algolia.{0,32}([a-z0-9]{32})\b/gi,
    'Cloudflare Token': /cloudflare.{0,32}(?:secret|token).{0,32}([a-z0-9_-]{38,42})\b/gi,
    'Google OAuth': /ya29\.[a-z0-9_-]{30,}/gi
  };

  const endpointPattern = /(['"`])(\/(api|v\d+|graphql|auth|admin|user|login|logout|register|upload|download|file|data|webhook|callback|oauth|token|key|config|settings|profile|account)[^\s'"`\;,)}\]]{0,100})\1/gi;

  // Scan scripts
  doc.querySelectorAll('script').forEach(script => {
    const src = script.src || '(inline)';
    const content = script.textContent || '';
    const size = content.length;

    results.scripts.push({
      src: src,
      size: size,
      inline: !script.src
    });

    // Find endpoints
    let match;
    const endpointRegex = new RegExp(endpointPattern);
    while ((match = endpointRegex.exec(content)) !== null) {
      results.endpoints.add(match[2]);
    }

    // Find secrets
    Object.entries(secretPatterns).forEach(([name, regex]) => {
      const secretRegex = new RegExp(regex);
      let secretMatch;
      while ((secretMatch = secretRegex.exec(content)) !== null) {
        results.secrets.add(`${name}: ${secretMatch[0].substring(0, 60)}...`);
      }
    });
  });

  // Scan HTML for sensitive patterns (enhanced for PHP/CMS)
  const html = doc.documentElement.outerHTML;
  const sensitiveChecks = [
    { n: 'API Keys', r: /api[_-]?key['"]?\s*[:\=]\s*['"]?([\w\-\.]+)/gi, contextLength: 50 },
    { n: 'Tokens', r: /(\w*token\w*)['"]?\s*[:\=]\s*['"]?([\w\-\.]+)/gi, contextLength: 50 },
    { n: 'Passwords', r: /(\w*password\w*)['"]?\s*[:\=]\s*['"]?([^'"\s<>]+)/gi, contextLength: 50 },
    { n: 'Database URIs', r: /(mongodb:\/\/[^\s<>"']+|postgres:\/\/[^\s<>"']+|mysql:\/\/[^\s<>"']+)/gi, contextLength: 80 },
    { n: 'WordPress Nonce', r: /_wpnonce['"]?\s*[:\=]\s*['"]?([a-z0-9]+)/gi, contextLength: 40 },
    { n: 'PHP Errors', r: /(Fatal error|Warning|Parse error|Notice):.*in\s+(\/[^\s]+)\s+on line\s+(\d+)/gi, contextLength: 100 },
    { n: 'SQL Queries', r: /(SELECT|INSERT|UPDATE|DELETE)\s+.*FROM\s+[\w_`]+/gi, contextLength: 80 },
    { n: 'CSRF Tokens', r: /csrf[_-]?token['"]?\s*[:\=]\s*['"]?([\w\-]+)/gi, contextLength: 40 }
  ];

  sensitiveChecks.forEach(check => {
    let match;
    const regex = new RegExp(check.r);
    const seen = new Set();
    
    while ((match = regex.exec(html)) !== null) {
      const fullMatch = match[0];
      // Avoid duplicates
      if (seen.has(fullMatch)) continue;
      seen.add(fullMatch);
      
      // Get context around the match
      const start = Math.max(0, match.index - check.contextLength);
      const end = Math.min(html.length, match.index + fullMatch.length + check.contextLength);
      const context = html.substring(start, end)
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      results.findings.push({ 
        type: check.n, 
        value: fullMatch,
        context: context.length > 150 ? context.substring(0, 150) + '...' : context
      });
      
      // Limit to max 10 findings per type to avoid overwhelming output
      if (seen.size >= 10) break;
    }
  });

  // Check localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('token') || lowerKey.includes('key') || lowerKey.includes('auth')) {
        const value = localStorage.getItem(key);
        results.findings.push({ 
          type: 'LocalStorage', 
          value: `${key} = ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`
        });
      }
    }
  } catch (e) {}

  // Detect CMS and Technologies
  const cmsDetection = [
    { name: 'WordPress', patterns: [/wp-content/i, /wp-includes/i, /wp-json/i], version: /ver=([0-9.]+)/i },
    { name: 'Drupal', patterns: [/\/sites\/default/i, /Drupal.settings/i, /drupal.js/i], version: /Drupal ([0-9.]+)/i },
    { name: 'Joomla', patterns: [/\/components\/com_/i, /Joomla!/i, /joomla.js/i], version: /Joomla! ([0-9.]+)/i },
    { name: 'Magento', patterns: [/Mage.Cookies/i, /\/skin\/frontend/i], version: /Magento\/([0-9.]+)/i },
    { name: 'Laravel', patterns: [/laravel_session/i, /XSRF-TOKEN/i], version: null },
    { name: 'Symfony', patterns: [/symfony/i, /_symfony/i], version: null },
    { name: 'Django', patterns: [/csrfmiddlewaretoken/i, /django/i], version: null },
    { name: 'React', patterns: [/react/i, /__REACT/i], version: /react@([0-9.]+)/i },
    { name: 'Vue.js', patterns: [/vue.js/i, /__VUE/i], version: /vue@([0-9.]+)/i },
    { name: 'Angular', patterns: [/ng-version/i, /angular/i], version: /ng-version="([0-9.]+)"/i }
  ];

  cmsDetection.forEach(cms => {
    const detected = cms.patterns.some(pattern => pattern.test(html));
    if (detected) {
      results.technologies.add(cms.name);
      let versionInfo = cms.name;
      if (cms.version) {
        const versionMatch = html.match(cms.version);
        if (versionMatch) {
          versionInfo += ` ${versionMatch[1]}`;
        }
      }
      results.cmsInfo.push(versionInfo);
    }
  });

  // Check for admin panels
  const adminPatterns = [
    '/wp-admin', '/administrator', '/admin', '/admin.php', '/login.php',
    '/phpmyadmin', '/cpanel', '/adminer.php', '/admin/login'
  ];
  adminPatterns.forEach(path => {
    if (html.includes(path)) {
      results.findings.push({
        type: 'Admin Path',
        value: path,
        context: 'Potential admin panel detected'
      });
    }
  });

  // Open results in new tab
  const resultsWindow = window.open('', '_blank');
  if (!resultsWindow) {
    alert('❌ Popup blocked! Please allow popups for this site and try again.');
    window.jspeekActive = false;
    return;
  }

  // Build results HTML
  let resultsContent = '<div class="results-container">';

  // Technologies/CMS section
  if (results.cmsInfo.length > 0) {
    resultsContent += `
      <div class="section">
        <div class="section-header">⚡ Technologies Detected (${results.cmsInfo.length})</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 15px;">
    `;
    results.cmsInfo.forEach(info => {
      resultsContent += `<span class="badge">${info}</span>`;
    });
    resultsContent += '</div></div>';
  }

  // Scripts section
  if (results.scripts.length > 0) {
    resultsContent += `
      <div class="section">
        <div class="section-header">📜 Scripts Found (${results.scripts.length})</div>
        <div class="items-list">
    `;

    results.scripts.forEach(script => {
      resultsContent += `
        <div class="item">
          <div class="item-title">${script.src}</div>
          <div class="item-subtitle">
            ${script.size.toLocaleString()} bytes • ${script.inline ? 'Inline' : 'External'}
          </div>
        </div>
      `;
    });
    resultsContent += '</div></div>';
  }

  // Endpoints section
  if (results.endpoints.size > 0) {
    resultsContent += `
      <div class="section">
        <div class="section-header">🔗 Endpoints (${results.endpoints.size})</div>
        <div class="items-list">
    `;

    Array.from(results.endpoints).forEach(endpoint => {
      resultsContent += `
        <div class="item">
          <div class="item-title">${endpoint}</div>
        </div>
      `;
    });
    resultsContent += '</div></div>';
  }

  // Secrets section
  if (results.secrets.size > 0) {
    resultsContent += `
      <div class="section">
        <div class="section-header">⚠️ Potential Secrets (${results.secrets.size})</div>
        <div class="items-list">
    `;

    Array.from(results.secrets).forEach(secret => {
      resultsContent += `
        <div class="item">
          <div class="item-title">${secret}</div>
        </div>
      `;
    });
    resultsContent += '</div></div>';
  }



  // Additional findings section
  if (results.findings.length > 0) {
    resultsContent += `
      <div class="section">
        <div class="section-header">🚨 Sensitive Findings (${results.findings.length})</div>
        <div class="items-list">
    `;

    results.findings.forEach(finding => {
      const escapedValue = (finding.value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const escapedContext = (finding.context || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      resultsContent += `
        <div class="item">
          <div class="finding-type">${finding.type}</div>
          <div class="finding-value">
            <code>${escapedValue}</code>
          </div>
          ${finding.context ? `
          <div class="finding-context">
            <div style="color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-bottom: 4px; text-transform: uppercase;">Context:</div>
            <code>${escapedContext}</code>
          </div>
          ` : ''}
        </div>
      `;
    });
    resultsContent += '</div></div>';
  }

  // Export button
  resultsContent += `
    <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(59, 130, 246, 0.15);">
      <button id="jspeek-export" class="export-btn">
        Copy Results as JSON
      </button>
    </div>
  `;

  resultsContent += '</div>';

  // Build complete HTML
  const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSPeek Results - ${currentUrl}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #0a1628 0%, #1a2332 100%);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: rgba(255, 255, 255, 0.02);
      padding: 25px 30px;
      border-radius: 12px;
      border: 1px solid rgba(59, 130, 246, 0.15);
      margin-bottom: 20px;
      text-align: center;
    }
    .header .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 15px auto;
      display: block;
    }
    .header h1 {
      font-size: 2rem;
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
      margin-bottom: 10px;
    }
    .header .target {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      margin-bottom: 5px;
    }
    .header .target strong {
      color: #06b6d4;
      font-weight: 600;
    }
    .header .timestamp {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.8rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(59, 130, 246, 0.15);
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }
    .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: #06b6d4;
    }
    .results-container {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(59, 130, 246, 0.15);
      border-radius: 12px;
      padding: 25px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section:last-child {
      margin-bottom: 0;
    }
    .section-header {
      font-size: 1.1rem;
      color: #06b6d4;
      margin-bottom: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .items-list {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      padding: 15px;
      max-height: 350px;
      overflow-y: auto;
    }
    .item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(59, 130, 246, 0.1);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .item:last-child {
      margin-bottom: 0;
    }
    .item-title {
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 6px;
      word-break: break-all;
    }
    .item-subtitle {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }
    .badge {
      display: inline-block;
      background: rgba(6, 182, 212, 0.15);
      color: #06b6d4;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.85rem;
      margin: 4px;
      border: 1px solid rgba(6, 182, 212, 0.25);
    }
    .export-btn {
      background: linear-gradient(135deg, #2563eb, #0284c7);
      color: #fff;
      border: none;
      padding: 14px 30px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
      display: block;
      margin-left: auto;
      margin-right: auto;
      transition: all 0.3s ease;
    }
    .export-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    }
    .finding-type {
      color: #06b6d4;
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .finding-value {
      background: rgba(0, 0, 0, 0.25);
      padding: 10px;
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.85rem;
      word-break: break-all;
      margin-bottom: 6px;
    }
    .finding-context {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.8rem;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="{{LOGO_BASE64}}" alt="JSPeek Logo" class="logo">
      <h1>JSPeek Results</h1>
      <div class="target">Target: <strong>${currentUrl}</strong></div>
      <div class="timestamp">Scanned: ${new Date().toLocaleString()}</div>
    </div>

    <!-- Stats Dashboard -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">📜 Scripts</div>
        <div class="stat-value">${results.scripts.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">🔗 Endpoints</div>
        <div class="stat-value">${results.endpoints.size}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">⚠️ Secrets</div>
        <div class="stat-value">${results.secrets.size}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">🚨 Findings</div>
        <div class="stat-value">${results.findings.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">⚡ Tech</div>
        <div class="stat-value">${results.cmsInfo.length}</div>
      </div>
    </div>

    <!-- Results -->
    <div class="results-container">
      ${resultsContent}
    </div>
  </div>

  <script>
    // Export functionality
    document.getElementById('jspeek-export').onclick = function() {
      const exportData = {
        url: '${currentUrl.replace(/'/g, "\\'")}',
        timestamp: new Date().toISOString(),
        scripts: ${JSON.stringify(results.scripts)},
        endpoints: ${JSON.stringify(Array.from(results.endpoints))},
        secrets: ${JSON.stringify(Array.from(results.secrets))},
        technologies: ${JSON.stringify(Array.from(results.technologies))},
        cmsInfo: ${JSON.stringify(results.cmsInfo)},
        findings: ${JSON.stringify(results.findings)}
      };

      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
        .then(() => alert('✅ Results copied to clipboard!'))
        .catch(() => {
          console.log('JSPeek Results:', exportData);
          alert('❌ Copy failed. Check browser console for results.');
        });
    };

  </script>
</body>
</html>
  `;

  resultsWindow.document.open();
  resultsWindow.document.write(fullHTML);
  resultsWindow.document.close();
  window.jspeekActive = false;

})();
