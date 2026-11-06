---
title: 'DOM XSS in The UK Intelligence Community UI Kit'
date: '2026-11-06'
excerpt: 'Assigned CVE-2026-112290 from VulnCheck for vulnerability disclosure.'
prog: 'RD'
org: 'MI6'
---


<div class="writeup-header">
<img src="/assets/logo/mi6-logo.png" alt="MI6 logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Secret Intelligence Service MI6</div>
<h1 class="writeup-title">DOM XSS in The UK Intelligence Community UI Kit</h1>
<div class="writeup-date">November 2026 &mdash; Responsible Disclosure</div>
</div>
</div>

<p class="lead mb-4">I have been contemplating whether I should write a blog post about this, because I usually do not include vulnerabilities discovered for CVE assignment purposes in my 'Ethical Hacking' blog. I have long been interested in intelligence agencies and things related to espionage, hence I made it a goal, for the sake of personal achievement, to hunt and responsibly disclose valid cyber vulnerabilities in intelligence agencies where allowed and possible.</p>

<p class="lead mb-4">I cannot confirm whether MI6 has an actual Vulnerability Disclosure Program, but in the context of this blog, I reported the DOM XSS, discovered on a local setup, based on the <a href="https://github.com/mi6/ic-ui-kit?tab=security-ov-file" target="_blank" rel="noopener noreferrer">SECURITY.md file here</a>.</p>

<p class="lead mb-4">I will skip the technical replication details in this blog, since all the information needed can be discovered in <a href="https://aaronamran.github.io/cves/cve-2026-112290/" target="_blank" rel="noopener noreferrer">my CVE disclosure here</a>. Now you might be wondering, how did I even discover the existence of this GitHub repository? Let me answer that question. As I was searching for more CVE-eligible targets on open-source software to increase my CVE count, I realised that many big organisations or companies have their own GitHub pages with many repositories. So I went to search for things like 'Microsoft GitHub', 'Nvidia GitHub' and many others. Eventually, I came across the MI6 GitHub page.</p>

<p class="lead mb-4">I checked through their repositories, and identified which ones are eligible for CVEs. In my mind, I thought it would be crazy if I could find at least one vulnerability in such a well-known agency. After some hours of searching and with AI assistance, I found a sink where DOM XSS pops.</p>

![DOM XSS](/images/CVE-2026-112290_image1.png)

<p class="lead mb-4">I immediately sent a detailed report to the email address provided in the SECURITY.md file on 27 September 2026. Apparently, the maintainers have not replied until now. So once I discovered that the vulnerability had been patched, I took note of the patch commit on GitHub, and applied for a CVE from VulnCheck on 19 October 2026. VulnCheck assigned <a href="https://www.cve.org/CVERecord?id=CVE-2026-112290" target="_blank" rel="noopener noreferrer">CVE-2026-112290</a> to this vulnerability.</p>


<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">November 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>