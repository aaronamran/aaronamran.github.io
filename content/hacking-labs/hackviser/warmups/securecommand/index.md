---
title: 'Secure Command'
date: '2026-02-10'
excerpt: 'Practice basics of the SSH service.'
prog: 'Hackviser Warmup Stage 1  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/securecommand/securecommand_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Secure Command</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 1</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing basics of the SSH service. SSH (Secure Shell) is a protocol used to securely access and manage devices on a network. It encrypts data to protect confidentiality and integrity, making SSH a preferred option over Telnet for remote administration.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which port(s) are open?</p>
<p class="mb-3">Run a Nmap scan on the target IP using <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/securecommand/securecommand_hackviser_image1.png" alt="Secure Command CTF 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 22</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What is the running service name?</p>
<p class="mb-5"><strong>Answer:</strong> SSH</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is "Master's Message" when connecting to SSH with hackviser:hackviser credentials?</p>
<img src="/assets/hackinglabs/hackviser/warmups/securecommand/securecommand_hackviser_image2.png" alt="Secure Command CTF 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> W3lc0m3 t0 h4ck1ng w0rld</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What is the command to change user in Linux?</p>
<img src="/assets/hackinglabs/hackviser/warmups/securecommand/securecommand_hackviser_image3.png" alt="Secure Command CTF 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> su</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What's the password for root user?</p>
<p class="mb-3">Try default passwords like root, password, admin, etc.</p>
<p class="mb-5"><strong>Answer:</strong> root</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> What is the parameter of the ls command that shows hidden files?</p>
<p class="mb-5"><strong>Answer:</strong> -a</p>
<br />

<p class="mb-2"><strong>Question 7:</strong> What is the master's advice?</p>
<p class="mb-5"><strong>Answer:</strong> st4y cur10us</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>