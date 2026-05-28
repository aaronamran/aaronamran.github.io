---
title: 'Command Injection'
date: '2026-03-01'
excerpt: 'Practice Command Injection attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Command Injection</h1>
<div class="writeup-date">March 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice command injection attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Basic Command Injection</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application gives the domain name you want to check as a parameter to the "nslookup" utility running on the terminal. Find a way to run a command on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-3">The page shows a DNS lookup functionality.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image1.png" alt="Web Application Security Command Injection 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To smuggle a command while we enter a domain name, we use the payload <code>google.com; hostname</code>. Then scroll down and see the server's hostname on the screen.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image2.png" alt="Web Application Security Command Injection 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> squirrel</p>
<br />

<h5 class="mb-2"><strong>2. Command Injection Filter Bypass</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application gives the domain name you want to check as a parameter to the "nslookup" utility running on the terminal. If the domain name you are sending contains common commands or operators, your query will be blocked. Find a way to run a command on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-3">We get a similar looking DNS Lookup web application like in the previous task. To bypass the filter, we use <code>google.com`hostname`</code>. The server's hostname will be appended to the output message.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image3.png" alt="Web Application Security Command Injection 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> legend</p>
<br />

<h5 class="mb-2"><strong>3. Command Injection Improved Filter Bypass</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application gives the domain name you want to check as a parameter to the "nslookup" utility running on the terminal. If the domain name you are sending contains commands or operators, your query will be blocked. You should know that almost all commands are ignored. Find a way to run a command on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h5 class="mb-2"><strong>4. Command Injection in Perl-Based Stock Control System</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application checks stock for products with a script written in Perl. Find a way to run commands on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h5 class="mb-2"><strong>5. Command Injection via User-Agent Log Entries</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application logs the User Agent information of visiting users in a log file. Find a way to execute commands on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-5"><strong>Answer:</strong> </p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>