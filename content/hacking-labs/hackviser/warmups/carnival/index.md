---
title: 'Carnival'
date: '2026-02-11'
excerpt: 'Practice basics of Server Message Block (SMB).'
prog: 'Hackviser Warmup Stage 1  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/carnival/carnival_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Carnival</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 1</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing basics of Server Message Block (SMB). The SMB protocol is a communication protocol that allows computers on a network to share files, printers and other resources.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What stands for SMB service, which usually uses port 445?</p>
<p class="mb-5"><strong>Answer:</strong> Server Message Block</p>

<p class="mb-2"><strong>Question 2:</strong> What is the name of the sharename with the comment "Looks interesting"?</p>
<p class="mb-3">Start off with using Nmap to scan the machine and identify open ports and services using <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/carnival/carnival_hackviser_image1.png" alt="Carnival CTF 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now that SMB is confirmed to be on port 445, use <code>smbclient</code> to connect to the SMB share. Append <code>--no-pass -L [target IP]</code></p>
<img src="/assets/hackinglabs/hackviser/warmups/carnival/carnival_hackviser_image2.png" alt="Carnival CTF 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Projects</p>

<p class="mb-2"><strong>Question 3:</strong> What is the helper command that shows which commands we can run after the SMB connection?</p>
<img src="/assets/hackinglabs/hackviser/warmups/carnival/carnival_hackviser_image3.png" alt="Carnival CTF 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> help</p>

<p class="mb-2"><strong>Question 4:</strong> What is the name of the project?</p>
<p class="mb-3">In the Projects share, use <code>l</code> to list available files and directories.</p>
<img src="/assets/hackinglabs/hackviser/warmups/carnival/carnival_hackviser_image4.png" alt="Carnival CTF 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Bird</p>

<p class="mb-2"><strong>Question 5:</strong> What is connection password inside the .config file?</p>
<p class="mb-3">Use <code>more .config</code> to view the contents of the .config file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/carnival/carnival_hackviser_image5.png" alt="Carnival CTF 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 5afcb573-d71e-490f-841a-accab64082c2</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/querygate.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>