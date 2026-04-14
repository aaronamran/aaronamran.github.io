---
title: 'Reddict'
date: '2026-02-08'
excerpt: 'Practice basics of Redis.'
prog: 'Hackviser Warmup Stage 1  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/reddict/reddict_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Reddict</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 1</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing basics of Redis. Redis (Remote Dictionary Server) is an in-memory data structure store, used as a key&middot;value database, cache, and message broker. It's known for its high performance, scalability, and low-latency operations.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which port(s) are open?</p>
<p class="mb-3">Run a Nmap scan on the target IP using <code>nmap -sC -sV -A -p- [target IP]</code>. It is important to add the <code>-p-</code> flag when running the Nmap scan to ensure Redis' port is detected.</p>
<img src="/assets/hackinglabs/hackviser/warmups/reddict/reddict_hackviser_image1.png" alt="Reddict CTF nmap scan output" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 6379</p>

<p class="mb-2"><strong>Question 2:</strong> What is the version number of the running Redis service?</p>
<p class="mb-3">The version number was detected in the previous Nmap scan.</p>
<p class="mb-5"><strong>Answer:</strong> 6.0.16</p>

<p class="mb-2"><strong>Question 3:</strong> What is the command-line utility lets you interact with a Redis database?</p>
<p class="mb-5"><strong>Answer:</strong> redis-cli</p>

<p class="mb-2"><strong>Question 4:</strong> What is the response when the PING command is run after a successful connection is established?</p>
<img src="/assets/hackinglabs/hackviser/warmups/reddict/reddict_hackviser_image2.png" alt="Reddict CTF redis-cli PING command" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/reddict/reddict_hackviser_image3.png" alt="Reddict CTF redis-cli PING command response" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> PONG</p>

<p class="mb-2"><strong>Question 5:</strong> What command returns information and statistics about the server?</p>
<p class="mb-5"><strong>Answer:</strong> INFO</p>

<p class="mb-2"><strong>Question 6:</strong> Which command returns all keys?</p>
<img src="/assets/hackinglabs/hackviser/warmups/reddict/reddict_hackviser_image4.png" alt="Reddict CTF redis-cli KEYS command" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> KEYS *</p>

<p class="mb-2"><strong>Question 7:</strong> How many key-value pairs are there?</p>
<p class="mb-5"><strong>Answer:</strong> 11</p>

<p class="mb-2"><strong>Question 8:</strong> Which command retrieves the value of the key?</p>
<p class="mb-5"><strong>Answer:</strong> GET</p>

<p class="mb-2"><strong>Question 9:</strong> What is admin's sessionToken value?</p>
<p class="mb-3">Use <code>GET "session:admin-001"</code> and look for the sessionToken value.</p>
<p class="mb-5"><strong>Answer:</strong> iqtoggtry</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/007.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>