---
title: 'Work Stuff'
date: '2026-03-17'
excerpt: 'Practice understanding the vulnerabilities of web applications built using Werkzeug and exploiting these vulnerabilities through the Metasploit Framework.'
prog: 'Hackviser Warmup Stage 2  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Work Stuff</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 2</div>
</div>
</div>
<p class="lead mb-4">Werkzeug is a Python-based web application toolkit and is used by popular web frameworks. It facilitates many complex functions related to the HTTP protocol by providing flexibility and modularity. Recommended to understand the vulnerabilities of web applications built using Werkzeug and to practice exploiting these vulnerabilities through the Metasploit Framework.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the WSGI web application library running on port 80?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image1.png" alt="Work Stuff Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Werkzeug</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> Which directory path is accessible if debug mode is active?</p>
<p class="mb-3">We can open the target IP in a web browser.</p>
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image2.png" alt="Work Stuff Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">If the debug mode of werkzeug is enabled, the <code>/console</code> directory path is accessible.</p>
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image3.png" alt="Work Stuff Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We run the command <code>__import__('os').popen('whoami').read();</code> to test if the console is working.</p>
<p class="mb-5"><strong>Answer:</strong> /console</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> Which CLI tool can search for exploits in Exploit DB?</p>
<p class="mb-5"><strong>Answer:</strong> searchsploit</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What is the name of the CLI tool that offers a rich content with exploits, payloads and various scan scripts?</p>
<p class="mb-5"><strong>Answer:</strong> msfconsole</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the disclosure date of the exploit found related to werkzeug?</p>
<p class="mb-3">Using msfconsole, we can find the exploit related to werkzeug and find the disclosure date.</p>
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image4.png" alt="Work Stuff Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 2015-06-28</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> What is the msfconsole command to check whether an exploit will work before it is actually running?</p>
<p class="mb-3">We now use the command <code>use 0</code> to use the werkzeug exploit module. Using <code>show OPTIONS</code> allows us to configure necessary options for the exploit to work. It is important to use <code>set RHOSTS [target_ip]</code> to specify the target IP address. Then we have to use <code>set AUTHMODE none</code> to prevent Metasploit from generating unnecessary authentication attempts. Once we are ready to run the exploit, we use the <code>check</code> command for checking purposes</p>
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image5.png" alt="Work Stuff Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image6.png" alt="Work Stuff Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> check</p>
<br />

<p class="mb-2"><strong>Question 7:</strong> Which file contains information about customers?</p>
<p class="mb-3">Once we run the exploit using the command <code>exploit</code>, a Meterpreter shell is obtained, allowing us to navigate the file system and access sensitive files.</p>
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image7.png" alt="Work Stuff Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image8.png" alt="Work Stuff Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> customers.csv</p>
<br />

<p class="mb-2"><strong>Question 8:</strong> What is the email address of the best customer of the month?</p>
<p class="mb-3">To access the email address, we need to use <code>cat customers.csv</code> to view the file and look for the best customer of the month.</p>
<img src="/assets/hackinglabs/hackviser/warmups/workstuff/workstuff_hackviser_image9.png" alt="Work Stuff Image 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> nolan.christine@protonmail.net</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>