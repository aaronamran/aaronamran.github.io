---
title: 'World Health Organization''s WordPress Vulnerability'
date: '2026-04-01'
excerpt: 'Public recognition via the WHO Vulnerability Hall of Fame.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/whologo.png" alt="WHO logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">World Health Organization (WHO)</div>
<h1 class="writeup-title">World Health Organization's WordPress Vulnerability</h1>
<div class="writeup-date">April 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>

<p class="lead mb-4">I think it was around September 2024 when I first came across the WHO Vulnerability Hall of Fame. At the time, I was still in the learning phase, studying beginner cybersecurity stuff, and seeing other people post their wins made me wonder what it actually took to get listed. I kept that goal in my sights; my principle has always been that if I can't get it now, I will definitely get it later.</p>

<div class="text-center">
<a href="https://www.who.int/about/cybersecurity/vulnerability-hall-of-fame/ethical-hacker-list#:~:text=Ethical%20hackers-,Vulnerability%20Hall%20of%20Fame,-To%20continuously%20improve" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/whowordpress/who_vuln_hof.png" alt="WHO VDP 1" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
<a href="https://www.who.int/about/cybersecurity/vulnerability-hall-of-fame/ethical-hacker-list#:~:text=Aaron%20Amran%20Bin%20Amiruddin" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/whowordpress/who_vuln_hof_aaronamran.png" alt="WHO VDP 2" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">I'm honestly surprised by how straightforward it is to score a valid, accepted vulnerability on the WHO Hall of Fame. This is definitely good news for anyone looking for bragging rights on social media by saying they "ethically hacked" the WHO. However, that doesn't mean they just accept anything. In my opinion, it simply means their cybersecurity team is proactive. They accept reported vulnerabilities and try to patch every vulnerabilities as long as it falls within their <a href="https://www.who.int/about/cybersecurity/vulnerability-hall-of-fame" target="_blank" referrerpolicy="noreferrer">official scope</a>.</p>
<p class="lead mb-4">Roughly around the same time I started hunting for vulnerabilities in UNICEF and UNESCO, I also began casually scouring through the WHO's public-facing digital assets. I noticed that many XSS and information disclosure issues had been reported previously. Personally, I'm not sure how others were finding those specific bugs; even when I invested more time and effort, I couldn't get an XSS payload to trigger, nor did I find any sensitive leaks via Google Dorks.</p>
<p class="lead mb-4">Since I'm a manual hunter armed with the Wappalyzer extension, I screened the WHO's enumerated subdomains myself. I manually appended <code>/xmlrpc.php</code> to the URL of any site running WordPress. I hit a lot of HTTP 403 responses, but after some thorough searching, I finally came across two unprotected endpoints. The Proof-of-Concept (PoC) for both endpoints used the exact same method, so I only provided proof for one.</p>

<img src="/assets/ethicalhacking/whowordpress/who_subdomain_xmlrpcphp.png" alt="WHO XML-RPC Vulnerability" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I used Burp Suite to intercept the request so I can see the HTTP response.</p>

<img src="/assets/ethicalhacking/whowordpress/who_get_xmlrpcphp_http405.png" alt="WHO XML-RPC Intercept" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Since it returns HTTP 405 Method not Allowed, I changed the request method from GET to POST, and appended some XML code to list the available system methods.</p>

<img src="/assets/ethicalhacking/whowordpress/who_post_listmethods_http200_1.png" alt="WHO XML-RPC List" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/whowordpress/who_post_listmethods_http200_2.png" alt="WHO XML-RPC List" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">XML-RPC endpoints commonly expose the <code>pingback.ping</code> method. When publicly accessible, this method has historically been abused to trigger server-side HTTP requests to third-party targets, which can be leveraged for reflected traffic or amplification-style abuse if not restricted or rate-limited.</p>

<img src="/assets/ethicalhacking/whowordpress/who_post_pingback_http200.png" alt="WHO XML-RPC Pingback" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I then used <a href="https://app.interactsh.com/#/" target="_blank" referrerpolicy="noreferrer">Interactsh Web Client</a> as a temporary callback server for this PoC.</p> 

<img src="/assets/ethicalhacking/whowordpress/interactsh_results.png" alt="Interactsh Results" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Once I proved that the pingback method is working, I checked the IP address to confirm it.</p>

<img src="/assets/ethicalhacking/whowordpress/ip_source_info.png" alt="IP Source Info" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">As usual, I sent an email report detailing the steps I took to the WHO Cybersecurity Team on 26 January 2026. A few days later, on 30 January 2026, I received a reply from them.</p>

<img src="/assets/ethicalhacking/whowordpress/who_cybersec_emailreply1.png" alt="Email 1" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Not bad. I was not expecting them to classify my finding as an Out-of-Band Server-Side Request Forgery (SSRF). After they fixed it, they emailed me and asked me to manually confirm that the vulnerability had been patched.</p>

<img src="/assets/ethicalhacking/whowordpress/who_cybersec_emailreply2.png" alt="Email 2" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I opened the URL of the endpoint in a web browser and checked the Network Tab in the Developer Tools. It was indeed fixed and returned an HTTP 403 Forbidden response.</p>

<img src="/assets/ethicalhacking/whowordpress/xmlrpc_forbidden.png" alt="XMLRPC Forbidden" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Once I confirmed the fix and sent them a screenshot, they replied with an email asking for my name and LinkedIn profile so they could add me to their Hall of Fame.</p>

<img src="/assets/ethicalhacking/whowordpress/who_cybersec_emailreply3.png" alt="Email 3" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">It was only during the first week of April 2026 that I randomly checked and saw they had updated the list. This is why I am publishing this blog on 6 April 2026. My assumption is that they update the list every two to three months. I am still really curious about how to find a successful XSS on WHO's public-facing assets, so I aim to get at least one valid XSS during my next hunt there.</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="#" id="nextHackLink">next hack</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">April 2026</p>
</section>


<div class="writeup-nav">
</div>

</div>