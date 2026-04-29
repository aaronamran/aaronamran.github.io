---
title: 'UNESCO''s Publicly Accessible xmlrpc.php File'
date: '2026-03-10'
excerpt: 'Public recognition via the UNESCO Cybersecurity Hall of Fame.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/unescologo.png" alt="UNESCO logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">United Nations Educational, Scientific and Cultural Organization (UNESCO)</div>
<h1 class="writeup-title">UNESCO's Publicly Accessible xmlrpc.php File</h1>
<div class="writeup-date">March 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>
<p class="lead mb-4">My first attempt at reporting a vulnerability to UNESCO in October 2025 was unsuccessful. I remember spending weeks manually auditing their subdomains after discovering <a href="https://www.unesco.org/en/vulnerability-disclosure" target="_blank" rel="noopener noreferrer">their vulnerability disclosure program</a>. Looking back, my lack of experience was likely the main obstacle.</p>

<div class="text-center">
<a href="https://www.unesco.org/en/vulnerability-disclosure#:~:text=28%20January%202026-,Aaron%20Amran%20Bin%20Amiruddin,-(mailto)%C2%A0" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/unescoxmlrpc/unesco_halloffame_aaron_xmlrpc.png" alt="UNESCO VDP" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">My general strategy for new responsible disclosure programs is simple: once I find an initial vulnerability, I email the organization and gauge their responsiveness. I then adjust my approach based on the complexity of the target and how quickly the team communicates. If the effort required to reach the Hall of Fame seems disproportionate, I either aim for a single submission or move on to a different program and return later.</p>
<p class="lead mb-4">In January 2026, I decided to try again. After studying write-ups from other ethical hackers and reviewing previous vulnerabilities in UNESCO's Hall of Fame, I increased my efforts. I specifically targeted the XML-RPC endpoint. While I knew others had reported this in the past, I wanted to see if any instances remained.</p>
<p class="lead mb-4">Using the Wappalyzer extension, I screened UNESCO's enumerated subdomains. For every site running WordPress, I manually appended <code>/xmlrpc.php</code> to the URL. Eventually, I found a live endpoint.</p>

<img src="/assets/ethicalhacking/unescoxmlrpc/unesco_xmlrpc.png" alt="UNESCO XML-RPC Vulnerability" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">To rule out a false positive, I used Burp Suite to intercept the request.</p>

<img src="/assets/ethicalhacking/unescoxmlrpc/getmethodnotallowed_unesco.png" alt="UNESCO XML-RPC Intercept" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I changed the request method from GET to POST and successfully listed the available system methods.</p>

<img src="/assets/ethicalhacking/unescoxmlrpc/post_unesco_xmlrpc.png" alt="UNESCO XML-RPC POST Request" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/unescoxmlrpc/post_unesco_xmlrpc2.png" alt="UNESCO XML-RPC POST Request" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Since this was sufficient proof of the vulnerability, I submitted my report to UNESCO's Digital Security team on 19 January 2026. After waiting a few weeks, I received a reply on 11 March 2026 confirming they had accepted and fixed the issue.</p> 

<img src="/assets/ethicalhacking/unescoxmlrpc/unesco_digitalsecurity_xmlrpc_email.png" alt="UNESCO Digital Security Email" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">That's nice! So they accepted this small vulnerability and fixed it. I manually verified the fix and provided the team with the necessary details for my listing.</p>

<p class="lead mb-4">Three days later, on 14 March 2026, UNESCO's Digital Security team updated the Cybersecurity Hall of Fame and I saw <a href="https://www.unesco.org/en/vulnerability-disclosure#:~:text=28%20January%202026-,Aaron%20Amran%20Bin%20Amiruddin,-(mailto)%C2%A0" target="_blank" rel="noopener noreferrer" style="display:inline-block;">my name added into the list</a>.</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>

</div>