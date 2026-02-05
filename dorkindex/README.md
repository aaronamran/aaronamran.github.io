# 🔍 DorkIndex

**Client-Side Google Dorking Tool for OPSEC-Conscious Bug Bounty Hunters**

A 100% client-side reconnaissance tool that generates search engine dork queries without ever sending your target data to any server. No tracking, no logging, no backend—just pure client-side JavaScript for maximum operational security.

---

## ✨ Features

### 🔒 OPSEC-First Design
- **100% Client-Side** - All processing happens in your browser
- **No Backend** - No server, no logs, no IP collection
- **No Referrer Leakage** - All links use `rel="noopener noreferrer"`
- **No Auto-Search** - Manual control over every query
- **No Tracking** - No analytics, telemetry, or cookies

### 🎯 Smart Dorking
- **Engine-Specific Queries** - Optimized dorks for each search engine
- **Multi-Engine Support** - Google, Bing, DuckDuckGo, Yandex, Brave Search
- **Negative Filters** - Auto-exclude noise (GitHub, Stack Overflow, etc.)
- **Subdomain Support** - Optional wildcard subdomain targeting
- **Category-Based** - Organized dork packs for different recon types

### 📦 Pre-Built Dork Categories
- 🔑 **Files & Secrets** - Exposed credentials, configs, keys
- 💾 **Backups & Logs** - Archives, dumps, log files
- 🔐 **Admin Panels** - Admin interfaces and dashboards
- 📂 **Open Directories** - Directory listings
- ☁️ **Cloud Buckets** - S3, Azure, GCP storage
- ⚙️ **CI/CD & DevOps** - Docker, Kubernetes, Terraform configs
- 🐛 **Debug & Errors** - Stack traces, error pages

---

## 🚀 Quick Start

### Option 1: Local File (Maximum Privacy)
1. Download/clone this repository
2. Open `index.html` in your browser
3. Enter target domains
4. Select search engine
5. Click desired dork categories
6. Manually open generated search URLs

### Option 2: Static Hosting
Deploy to:
- **GitHub Pages** - Free, no server-side code
- **Netlify/Vercel** - Static hosting only
- **Your own server** - Serve as static files

**⚠️ Never deploy with logging/analytics enabled**

---

## 📖 Usage Guide

### 1. Enter Target(s)
```
example.com
api.example.com
app.example.com
```

**Options:**
- ✅ Include subdomains (`*.example.com`)
- ✅ Apply negative filters (removes GitHub, Stack Overflow, etc.)

### 2. Select Search Engine
Choose based on your needs:
- **Google** - Most powerful, high captcha risk
- **Bing** - Different index, underrated for recon
- **DuckDuckGo** - Privacy-friendly, limited operators
- **Yandex** - Excellent for forgotten/orphaned assets
- **Brave** - Independent index, privacy-focused

### 3. Choose Dork Categories
Click any dork button to generate queries. Each category contains multiple pre-built dorks optimized for different recon scenarios.

### 4. Review & Search
- Review generated queries
- Click "🔍 Search" to open in new tab (manual, OPSEC-safe)
- Or copy URL to use in VPN/Tor browser

---

## 🛡️ OPSEC Best Practices

### ✅ Do's
- Use behind VPN/proxy when targeting sensitive programs
- Spread queries over time (avoid bursts)
- Use different search engines to reduce fingerprinting
- Clear browser data regularly
- Save results locally, not in cloud services

### ❌ Don'ts
- Don't use "Open All" features in bulk
- Don't automate searches with scripts
- Don't use on logged-in Google accounts for sensitive targets
- Don't ignore captchas (they're anti-automation, respect them)
- Don't share generated URLs with targets embedded

---

## 🎨 Customization

### Adding Custom Dorks
Edit `dorks.json` to add your own dorks:

```json
{
  "name": "Your custom dork",
  "google": "site:{target} your google query",
  "bing": "site:{target} your bing query",
  "duckduckgo": "site:{target} simple query",
  "yandex": "site:{target} your yandex query",
  "brave": "site:{target} your brave query"
}
```

### Engine-Specific Considerations
- **Google** - Supports all operators (`intitle:`, `inurl:`, `filetype:`)
- **Bing** - Good support, slightly different parsing
- **DuckDuckGo** - Minimal operators, mostly `site:` and quotes
- **Yandex** - Excellent for international/Cyrillic content
- **Brave** - Independent index, growing coverage

---

## 🧪 Technical Details

### Files Structure
```
DorkIndex/
├── index.html      # Main interface
├── app.js          # Core logic (no backend calls)
├── styles.css      # Clean, responsive styling
├── dorks.json      # Dork templates database
├── LICENSE         # MIT License
└── README.md       # This file
```

### Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Brave Browser

Requires JavaScript enabled (for client-side processing only).

---

## 🤝 Contributing

Contributions welcome! To add dorks:
1. Fork this repo
2. Add dorks to `dorks.json` with engine-specific variations
3. Test across multiple engines
4. Submit PR with clear descriptions

**Focus on:**
- Engine-specific optimizations
- Real-world bug bounty scenarios
- Reducing false positives
- OPSEC-safe implementations

---

## ⚖️ Legal & Ethical Use

### Disclaimer
This tool **only generates search URLs**. It does not:
- Automate searches
- Bypass rate limits or protections
- Access non-public data
- Violate search engine ToS

### Responsible Use
- Only use on authorized targets (bug bounty/VDP programs)
- Respect search engine rate limits
- Follow responsible disclosure practices
- Comply with local laws and regulations

**You are responsible for how you use this tool.**

---

## 🌟 Why DorkIndex?

### vs. Manual Dorking
- ✅ Faster dork generation
- ✅ Engine-specific optimization
- ✅ Organized categories
- ✅ Reusable templates

### vs. Automated Tools
- ✅ No captcha triggers
- ✅ Full control over queries
- ✅ No server-side logging
- ✅ Lower detection risk

### Philosophy
**Manual control = Better OPSEC**

This tool fits real bug bounty recon workflows, not script-kiddie automation. It respects search engines while maximizing your efficiency.

---

## 📋 Roadmap

Potential future enhancements:
- [ ] Export/import custom dork packs
- [ ] Dork result tracking (local only)
- [ ] Advanced query builder
- [ ] More search engines (Mojeek, Baidu)
- [ ] Browser extension version

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built for the bug bounty community with OPSEC and privacy as core principles.

**Stay safe. Hunt responsibly. Find bugs. Get paid.** 🎯

---

## 📧 Contact

Found a bug? Have a suggestion? Open an issue or PR!

**Remember:** This tool is for authorized security testing only. Always get permission before testing targets.