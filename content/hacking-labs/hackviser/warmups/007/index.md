---
title: '007'
date: '2026-02-09'
excerpt: 'Practice basics of Remote Desktop Protocol (RDP).'
prog: 'Hackviser Warmup Stage 1  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/007/007_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">007</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 1</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing basics of Remote Desktop Protocol (RDP). RDP is a protocol that allows users to connect to and control a computer remotely.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is target hostname?</p>
<p class="mb-3">Run a Nmap scan on the target IP using <code>nmap -sC -sV -A -p- [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/007/007_hackviser_image1.png" alt="007 CTF 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/007/007_hackviser_image2.png" alt="007 CTF 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> WIN-B9266PTLH5T</p>

<p class="mb-2"><strong>Question 2:</strong> What does RDP stands for?</p>
<p class="mb-5"><strong>Answer:</strong> Remote Desktop Protocol</p>

<p class="mb-2"><strong>Question 3:</strong> What is usually the most privileged username in Windows?</p>
<p class="mb-5"><strong>Answer:</strong> Administrator</p>

<p class="mb-2"><strong>Question 4:</strong> Whats the Windows version?</p>
<p class="mb-3">To find the Windows version, use Remmina to RDP to the target machine. Simply login as Administrator without any password or other details. A Windows Server 2019 will load. To find the Windows version, search for Run in Windows and type <code>winver</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/007/007_hackviser_image3.png" alt="007 CTF 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 1809</p>

<p class="mb-2"><strong>Question 5:</strong> What is the name of the suspect folder under the C:\ directory?</p>
<img src="/assets/hackinglabs/hackviser/warmups/007/007_hackviser_image4.png" alt="007 CTF 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> junk</p>

<p class="mb-2"><strong>Question 6:</strong> Which user owns the junk folder?</p>
<img src="/assets/hackinglabs/hackviser/warmups/007/007_hackviser_image5.png" alt="007 CTF 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> spy7</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/securecommand.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>