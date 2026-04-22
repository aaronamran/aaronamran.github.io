---
title: 'Server-Side Template Injection (SSTI)'
date: '2026-03-01'
excerpt: 'Practice Server-Side Template Injection (SSTI) attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_ssti/ssti_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Server-Side Template Injection (SSTI)</h1>
<div class="writeup-date">April 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Server-Side Template Injection (SSTI) attacks in multiple lab exercises.</p>

<h5 class="mb-2">1. Basic SSTI</h5>
<p class="mb-3"><strong>This lab contains a Server-Side Template Injection (SSTI) vulnerability in a PHP-based web application that uses the Twig template engine. To complete the lab, exploit the SSTI vulnerability in the search box to access the contents of the config.php file. What is the database password in config.php?</strong></p>
<p class="mb-3">Upon page load, we see a search field. Let's directly test for template injection using the payload <code>{{5*5}}</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_ssti/ssti_hackviser_image1.png" alt="Web Application Security SSTI 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To test if the web app uses Jinja2 (Python) or Twig (PHP), we will use the payload <code>{{7*'7'}}</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_ssti/ssti_hackviser_image2.png" alt="Web Application Security SSTI 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Since the output is 49, this confirms that it is Twig. On the other hand, if the output is 7777777, is is Jinja2. Now to read the database password stored in the config.php file, we will use the payload <code>{{ ['cat config.php'] | map('system') | join }}</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_ssti/ssti_hackviser_image3.png" alt="Web Application Security SSTI 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> kfqEnLyBrT2JaS</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">April 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>