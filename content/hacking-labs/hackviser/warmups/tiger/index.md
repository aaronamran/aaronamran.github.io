---
title: 'Tiger'
date: '2026-02-13'
excerpt: 'Practice basics of Virtual Network Computing (VNC).'
prog: 'Hackviser Warmup Stage 1  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/tiger/tiger_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Tiger</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 1</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing basics of Virtual Network Computing (VNC). VNC is a protocol that allows users to connect to and control a computer remotely. The difference between VNC and RDP is that VNC is platform-independent and works across different operating systems, while RDP is specific to Windows environments.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What does VNC stands for?</p>
<p class="mb-5"><strong>Answer:</strong> Virtual Network Computing</p>

<p class="mb-2"><strong>Question 2:</strong> Which port(s) are open?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/tiger/tiger_hackviser_image1.png" alt="Tiger 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 5901</p>

<p class="mb-2"><strong>Question 3:</strong> Who is the user you have established a VNC connection with?</p>
<p class="mb-3">Use a VNC client such as Remmina to connect to the target machine on port 5901. Choose VNC from the dropdown and enter the target IP address with port 5901. After successfully connecting, check the username by opening a terminal and running <code>whoami</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/tiger/tiger_hackviser_image2.png" alt="Tiger 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/warmups/tiger/tiger_hackviser_image3.png" alt="Tiger 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> leo</p>

<p class="mb-2"><strong>Question 4:</strong> What is the Linux kernel version?</p>
<p class="mb-3">In the terminal use <code>uname -a</code> to check the Linux kernel version.</p>
<p class="mb-5"><strong>Answer:</strong> 5.10.0-28-amd64</p>

<p class="mb-2"><strong>Question 5:</strong> What is the name of the running VNC program?</p>
<p class="mb-3">Use <code>ps aux | grep vnc</code> to check the running VNC program.</p>
<img src="/assets/hackinglabs/hackviser/warmups/tiger/tiger_hackviser_image4.png" alt="Tiger 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Xtigervnc</p>

<p class="mb-2"><strong>Question 6:</strong> What is the IP address of the computer that established a VNC connection on February 23, 2023?</p>
<p class="mb-3">Use <code>ls -al</code> to list available files and directories in the current directory, and navigate to <code>.vnc</code>. Then read the connection logs.</p>
<img src="/assets/hackinglabs/hackviser/warmups/tiger/tiger_hackviser_image5.png" alt="Tiger 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/warmups/tiger/tiger_hackviser_image6.png" alt="Tiger 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 10.1.9.23</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/mount.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>