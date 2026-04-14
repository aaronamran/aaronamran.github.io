---
title: 'File Inclusion'
date: '2026-03-01'
excerpt: 'Practice File Inclusion attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_fileinclusion/fileinclusion_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">File Inclusion</h1>
<div class="writeup-date">March 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice file inclusion attacks in multiple lab exercises.</p>

<h5 class="mb-2">1. Basic File Inclusion</h5>
<p class="mb-3"><strong>This lab contains a Local File Inclusion (LFI) vulnerability that leads to unauthorized access to local files within the system. The content of the 404 error page you see in the web application is fetched from the path in the "page" parameter in the URL. By changing the "page" parameter, you can access other files on the system. What is the username of the last user added in /etc/passwd?</strong></p>
<p class="mb-5"><strong>Answer:</strong> </p>

<h5 class="mb-2">2. Local File Inclusion Filter Bypass</h5>
<p class="mb-3"><strong>This lab contains a Local File Inclusion (LFI) vulnerability that leads to unauthorized access to local files within the system. The content of the 404 error page you see in the web application is fetched from the path in the "page" parameter in the URL. By changing the "page" parameter, you can access other files on the system. "/" and ".." are blocked to prevent LFI vulnerability. Find a way to bypass this restriction. What is the username of the last user added in /etc/passwd?</strong></p>
<p class="mb-5"><strong>Answer:</strong> </p>

<h5 class="mb-2">3. Basic Remote File Inclusion</h5>
<p class="mb-3"><strong>This lab contains a Remote File Inclusion (RFI) vulnerability that leads to remote code execution, allowing the attacker to run arbitrary code hosted on a remote server. The content of the 404 error page you see in the web application is fetched from the path in the "page" parameter in the URL. A file from a remote system can be included in the page by changing the "page" parameter. You should serve the payload on HackerBox or on your own computer using a VPN. What is the hostname of the server on which the website runs?</strong></p>
<p class="mb-5"><strong>Answer:</strong> </p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>