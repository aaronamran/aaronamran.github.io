---
title: 'Django Server Misconfigurations at Berkeley Lab'
date: '2025-12-01'
excerpt: 'Public recognition via White Hats for Science program.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/lawrenceberkeleynationallablogo.png" alt="LBL logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Lawrence Berkeley National Laboratory (LBNL)</div>
<h1 class="writeup-title">Django Server Misconfigurations at Berkeley Lab</h1>
<div class="writeup-date">December 2025 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>
<p class="lead mb-4">As usual, I was spending my free time hunting for security flaws on foreign government websites, including those belonging to the Dutch Government, the UK Government, and most notably, the US Government. One random day, on 16 December 2025, I came across a LinkedIn post from someone whose name I can no longer remember. In the post, he mentioned that he had successfully found a security vulnerability in one of Lawrence Berkeley National Laboratory's (LBNL) websites.</p>
<p class="lead mb-4">Out of curiosity, I visited <a href="https://commons.lbl.gov/spaces/cpp/pages/197691423/White+Hats+for+Science#:~:text=2025%2D12%2D16%3A%20Thank%20you%20to%20Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)%20%2D%20Sarawak%20Information%20Systems%20(SAINS)%20for%20identifying%20a%20web%20server%20misconfiguration." target="_blank" rel="noopener noreferrer">https://go.lbl.gov/vdp</a> and read through LBNL's Vulnerability Disclosure Program rules. Unlike most VDPs, I genuinely think LBNL's scope is well-suited for people who are lazy, like me. Let me explain.</p>
<p class="lead mb-4">Their scope explicitly disallows any testing that requires account creation. This means that all testing must be conducted in a fully public-facing, black-box manner. One could argue that this narrow scope significantly reduces the attack surface. However, from my perspective, it aligns perfectly with how I prefer to work.</p>

<div class="text-center">
<a href="https://commons.lbl.gov/spaces/cpp/pages/197691423/White+Hats+for+Science#:~:text=2025%2D12%2D16%3A%20Thank%20you%20to%20Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)%20%2D%20Sarawak%20Information%20Systems%20(SAINS)%20for%20identifying%20a%20web%20server%20misconfiguration." target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/lbnldjango/whitehatsforsciencekudos1.png" alt="LBNL VDP" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">Since I had some free time to spare, I figured that procrastinating would only do more harm than good. I immediately performed subdomain enumeration using C99"s Subdomain Finder, copied the results into a text file, and used the Bulk URL Opener browser extension to open multiple subdomains simultaneously.</p>
<p class="lead mb-4">The first 100 subdomains did not yield anything particularly interesting. I was mostly performing surface-level reconnaissance, hoping for quick wins. Most of the subdomains either returned HTTP 403 responses or required authentication via internal LBNL staff accounts.</p>
<p class="lead mb-4">I continued going through the list, opening more subdomains, skipping those that were clearly not worth further investigation, and keeping an eye out for anything unusual or promising.</p>
<p class="lead mb-4">Eventually, I reached roughly the 120th and 121st subdomains. Both turned out to be API endpoints for production and staging environments. These endpoints were clearly intended for programmatic access rather than human-facing web pages, which explained why viewing them directly in a browser did not reveal much.</p>
<p class="lead mb-4">At a surface level, it was apparent that these API endpoints were running on Django, which confirmed my suspicion that they were backend API services rather than static public websites. Django is a widely used Python web framework for building both web applications and RESTful APIs.</p>

<img src="/assets/ethicalhacking/lbnldjango/djangodebugtrue.png" alt="LBNL Django Debug Mode Enabled" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">The moment I noticed that Django Debug Mode was enabled on a public-facing API endpoint, I knew I had found a significant security issue. In general, Django Debug Mode exposes highly detailed error information, including stack traces, environment variables, and sometimes even database credentials. This type of information can be extremely valuable to attackers and may lead to further exploitation or privilege escalation.</p>
<p class="lead mb-4">What made this even more interesting was that the debug page itself conveniently displayed several accessible paths, including <code>admin/</code>, <code>accounts/</code>, <code>_allauth/</code>, and <code>api/</code>. It felt almost like one of those games where, at the very beginning, you are given hints and tools to guide you forward.</p>
<p class="lead mb-4">I began modifying the URL by appending these paths to the base endpoint, hoping that each request might lead to something new. After about ten minutes of exploring many empty rooms, I finally stumbled upon an endpoint that immediately caught my attention:</p>
<div class="text-center mb-4">
<div style="display:inline-block; text-align:left; position:relative;">
<pre><code id="dorkCode">https://redacted.lbl.gov/_allauth/openapi.yaml</code></pre>
<div id="dorkCopied" style="position:absolute; right:90px; top:50%; transform:translateY(-50%); display:none; background:#28a745; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.85rem;">Copied!</div>
</div>
</div>
<img src="/assets/ethicalhacking/lbnldjango/djangodebug1.png" alt="LBNL Django Debug Mode Error Page" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="lead mb-4">The page returned a <code>ModuleNotFoundError</code>, but more importantly, it exposed extremely verbose debug information. As soon as I saw details such as the Python version and Python path, I knew this was a serious misconfiguration. I scrolled further down the page.</p>

<img src="/assets/ethicalhacking/lbnldjango/djangodebug2.png" alt="LBNL Django Debug Mode Error Page Continued" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/lbnldjango/djangodebug3.png" alt="LBNL Django Debug Mode Error Page Continued" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">There it was. Sensitive server-side information laid out openly, effectively served on a silver platter for anyone curious enough.</p>
<p class="lead mb-4">I immediately drafted an email to the Berkeley Lab Cybersecurity team, explaining how I discovered the endpoint and providing clear steps to reproduce the issue. At the time, it was almost lunchtime on 17 December 2025 in Malaysia, while it was still the night of 16 December 2025 in the United States.</p>
<p class="lead mb-4">Exactly 25 minutes later, I received a reply from their cybersecurity team. They thanked me for the responsible disclosure and informed me that they would add my name to the <a href="https://commons.lbl.gov/spaces/cpp/pages/197691423/White+Hats+for+Science#:~:text=2025%2D12%2D16%3A%20Thank%20you%20to%20Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)%20%2D%20Sarawak%20Information%20Systems%20(SAINS)%20for%20identifying%20a%20web%20server%20misconfiguration." target="_blank" rel="noopener noreferrer">White Hats for Science Kudos list</a>. I replied shortly after, and about an hour later, I received a follow-up confirmation email.</p>

<img src="/assets/ethicalhacking/lbnldjango/lbldjangoemailreply.png" alt="LBNL Django Email Reply" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">It was a great feeling, especially just before the Christmas holiday season kicked in. Not only did I learn something new, but I was also acknowledged for helping to keep a major research laboratory more secure. It was a small win, but one that I would absolutely recommend experiencing.</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">December 2025</p>
</section>

<div class="writeup-nav">
</div>

</div>