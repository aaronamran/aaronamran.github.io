---
title: 'Super Process'
date: '2026-03-24'
excerpt: 'Practice vulnerability detection in a web application, exploiting the vulnerability through the Metasploit Framework, and privilege escalation attacks due to misconfigurations.'
prog: 'Hackviser Warmup Stage 3  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_logo.png" alt="Super Process logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Super Process</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 3</div>
</div>
</div>
<p class="lead mb-4">This warmup focuses on teaching how to perform vulnerability discovery in a common open-source web application, gain access to the machine, and perform escalation attacks on Linux-based systems. It is recommended to practice vulnerability detection in a web application, exploiting the vulnerability through the Metasploit Framework, and privilege escalation attacks due to misconfigurations.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which ports are open?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_image1.png" alt="Super Process Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 22, 9001</p>

<p class="mb-2"><strong>Question 2:</strong> What is the CVE code of the vulnerability found in the web application?</p>
<p class="mb-3">Our nmap port scan revealed that the target is running a HTTP server on port 9001, which looks like the following when opened in a web browser.</p>
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_image2.png" alt="Super Process Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We can use <code>searchsploit supervisor</code> in the terminal to identify what vulnerabilities exist for the Supervisor service.</p>
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_image3.png" alt="Super Process Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">The third searchsploit result shows there is a Remote Code Execution (RCE) vulnerability. Let's open Metasploit in the console and use <code>search supervisor</code>, then use the XML-RPC Remote Code Execution module. To find the CVE code, we need to use <code>info</code> and search for the references.</p>
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_image4.png" alt="Super Process Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_image5.png" alt="Super Process Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> CVE-2017-11610</p>

<p class="mb-2"><strong>Question 3:</strong> Which user's permissions and authorizations does the vulnerable service work with?</p>
<p class="mb-3">To obtain the required information, we need to configure the exploit and and run it. Remember to set RHOSTS to the target IP address, LHOSTS to your local IP address, and then run <code>check</code> before executing the exploit. Once the Meterpreter session is opened, we need to run <code>shell</code>, then run <code>whoami</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_image6.png" alt="Super Process Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> nobody</p>

<p class="mb-2"><strong>Question 4:</strong> What is the name of the application with SUID permissions that we can use for privilege escalation?</p>
<p class="mb-3">We can use the command <code>find / -perm -u=s -type f 2>/dev/null</code> to find applications with SUID permissions for the target system.</p>
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_image7.png" alt="Super Process Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> /usr/bin/python2.7</p>

<p class="mb-2"><strong>Question 5:</strong> What is the password hash value in /etc/shadow for the user "root"?</p>
<p class="mb-3">Since we cannot directly read the contents of /etc/shadow, we need to escalate our privileges using the SUID application we found earlier. Once we have root access, we can read the file and obtain the password hash. To achieve this, run <code>python2.7 -c 'import os; os.execl("/bin/sh", "sh", "-p")'</code>, then run <code>whoami</code> to confirm if the current user is root. Once confirmed, we can directly use <code>cat /etc/shadow</code> to read the password hash.</p>
<img src="/assets/hackinglabs/hackviser/warmups/superprocess/superprocess_hackviser_image8.png" alt="Super Process Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> $y$j9T$e8KohoZuo9Aaj1SpH7/pm1$mu9eKYycNlRPCJ51dW8d71.aPH0ceBM0AKxAaiil7C5</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/glitch.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>