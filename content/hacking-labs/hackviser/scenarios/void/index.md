---
title: 'Void'
date: '2026-07-01'
excerpt: 'Basic - System'
prog: 'Hackviser Scenarios -  July 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Void</h1>
<div class="writeup-date">July 2026 &middot; Scenarios</div>
</div>
</div>
<p class="lead mb-4">According to our security analysts' reports, our critical systems have been subjected to scans from a suspicious IP address for some time. Your mission is to identify the owner of this IP address and the associated server, and to uncover what the attackers are doing. Good luck!</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the email address and password for the attacker's GitHub account?</p>
<p class="mb-3">We start off with a Nmap scan using <code>nmap -sC -sV -A [target_IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image1.png" alt="Void 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Notice that on port 10000, the target server is running Webmin Miniserv 1.890. So we open Metasploit and search for related vulnerabilities.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image2.png" alt="Void 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We use the exploit <code>exploit/linux/http/webmin_backdoor</code> and set the required options such as <code>RHOSTS</code> and <code>LHOST</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image3.png" alt="Void 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Once we gain access inside, we run <code>python3 -c 'import pty; pty.spawn("/bin/bash")'</code> to drop into a fully interactive Python terminal environment for stability. Then we explore the system directories and files inside.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image4.png" alt="Void 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">After a while of exploring, we discover a <code>.git</code> folder that contains a <code>help.txt</code> file. Reading it reveals the email and password we need.</p>
<p class="mb-5"><strong>Answer:</strong> timmycoat@anonymmail.hv:wTWQzVeTD3vm</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the MD5 hash value of the malware used by the attacker?</p>
<p class="mb-3">Inside the target machine in the <code>/root</code> directory, we notice that there is a file named <code>phishing_malware.zip</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image5.png" alt="Void 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Running <code>unzip -l phishing_malware.zip</code> allows us to peek inside without extracting it. We then open a Python HTTP server on port 8080 by running <code>cd /root && python3 -m http.server 8080</code> so we can download the zipped malware to crack locally on our machine.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image6.png" alt="Void 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">After downloading the zipped malware and changing directory to the Downloads folder, we run <code>zip2john phishing_malware.zip > zip_hash.txt</code> to extract the hash. Then we use <code>john --wordlist=/usr/share/wordlists/rockyou.txt zip_hash.txt</code> to crack it using John The Rippper and the <code>rockyou.txt</code> wordlist.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image7.png" alt="Void 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">To unzip the malware, we run <code>unzip -P cookie phishing_malware.zip</code>. Then we obtain the MD5 hash value using <code>md5sum phishing_malware.pdf</code>.</p>
<p class="mb-5"><strong>Answer:</strong> b82f8ba530a975e9f2acefe675fbffce</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What is the domain name that the attacker scanned with the SQL Injection scanning tool?</p>
<p class="mb-3">Since SQLmap is an industry standard tool, we can run <code>find / -name "*sqlmap*" 2>/dev/null</code> to search the entire system for any directories or files related to it.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image8.png" alt="Void 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We change directory to <code>/root/.local/share/sqlmap</code>, list out all the contents including hidden directories and files, and keep exploring until we obtain the domain name.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image9.png" alt="Void 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> albireobank.hv</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What is the e-mail address of the victim in the “Stealer Log” data on the server?</p>
<p class="mb-3">After some exploring of the root and home directories, we came across a user account named void. Inside the Downloads directory, there is a directory named <code>best-log</code>, so we explore further inside. Reading <code>Password.txt</code> reveals the e-mail address of the victim.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image10.png" alt="Void 10" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> christopher1d@zeromail.hv</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> Which IP address did the attacker scan for ports and services?</p>
<p class="mb-3">First we use <code>find / -name "*nmap*" -o -name "*scan*" 2>/dev/null</code> to do a system-wide search. Then we redo the search using <code>find / -name "*nmap*" -o -name "*scan*" 2>/dev/null | grep results</code> to narrow down on only the results. Reading the relevant XML file using <code>cat /nmap/scan_results.xml</code> gives us the IP address required.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/void/void_hackviser_image11.png" alt="Void 11" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 45.76.59.241</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">July 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>