---
title: 'File Hunter'
date: '2026-02-07'
excerpt: 'Practice basics of the FTP service.'
prog: 'Hackviser Warmup Stage 1  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/filehunter/filehunter_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">File Hunter</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 1</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing basics of the FTP service. FTP (File Transfer Protocol) is a protocol used to make file transfers over the internet. This protocol is used to upload or download files from one computer to another computer.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which port(s) are open?</p>
<p class="mb-3">Run a Nmap scan on the target IP using <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/filehunter/filehunter_hackviser_image1.png" alt="File Hunter CTF nmap scan output" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 21</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What does FTP stand for?</p>
<p class="mb-5"><strong>Answer:</strong> File Transfer Protocol</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What username did you connect to the FTP?</p>
<p class="mb-3">The hint is shown in the previous image due to FTP allowing anonymous login.</p>
<img src="/assets/hackinglabs/hackviser/warmups/filehunter/filehunter_hackviser_image2.png" alt="File Hunter CTF FTP anonymous login hint" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> anonymous</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What command shows which commands we can use on the FTP server?</p>
<img src="/assets/hackinglabs/hackviser/warmups/filehunter/filehunter_hackviser_image3.png" alt="File Hunter CTF FTP help command" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> help</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the name of the file on the FTP server?</p>
<img src="/assets/hackinglabs/hackviser/warmups/filehunter/filehunter_hackviser_image4.png" alt="File Hunter CTF FTP file listing" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> userlist</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> What is the command we can use to download a file from an FTP server?</p>
<p class="mb-5"><strong>Answer:</strong> get</p>
<br />

<p class="mb-2"><strong>Question 7:</strong> Which users' information is in the file?</p>
<p class="mb-5"><strong>Answer:</strong> jack, root</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>