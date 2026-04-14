---
title: 'Find and Crack'
date: '2026-03-01'
excerpt: ''
prog: 'Hackviser Warmup  -  2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_logo.png" alt="Find and Crack logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Find and Crack</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 3</div>
</div>
</div>
<p class="lead mb-4">Cracking encrypted files is accomplished by exploiting weaknesses in encryption algorithms or by guessing encryption keys by trial and error. It is recommended to practice vulnerability research, system access, privilege escalation and gaining access to encrypted data on the target machine running an open source web application.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the name of IT Asset Management and service desk system software used?</p>
<p class="mb-3">Open the target site in a web browser.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image1.png" alt="Find and Crack Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Clicking on IT Management link brings us to the login interface, which shows the GLPI logo.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image2.png" alt="Find and Crack Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> GLPI</p>

<p class="mb-2"><strong>Question 2:</strong> What is the username used to connect to the database?</p>
<p class="mb-3">As the initial part of gathering information, let's run an nmap scan using <code>nmap -sC -sV -A [target hostname]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image3.png" alt="Find and Crack Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now that we know which ports are open, let's proceed with Metasploit and search for relevant GLPI exploits.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image4.png" alt="Find and Crack Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We will use the exploit named <code>exploit/linux/http/glpi_htmlawed_php_injection</code> from the year 2022. Then as usual, set the <code>RHOSTS</code>, <code>LHOST</code>, and run the exploit. A meterpreter session will be opened upon successful exploitation. Navigate to the GLPI directory and check for config files.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image5.png" alt="Find and Crack Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image6.png" alt="Find and Crack Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> glpiuser</p>

<p class="mb-2"><strong>Question 3:</strong> Which command can be run with sudo privileges?</p>
<p class="mb-3">Enter <code>shell</code> to create a new shell session. Then enter <code>whoami</code> to see which user you are currently logged in as. Run <code>sudo -l</code> to list the commands that can be run with sudo privileges.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image7.png" alt="Find and Crack Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> find</p>

<p class="mb-2"><strong>Question 4:</strong> What is backup.zip password?</p>
<p class="mb-3">We use <code>sudo find / -name "backup.zip"</code> to find the backup file. But when we use <code> cp -r /root/backup.zip ./</code>, we do not have the necessary permissions. Our next step is to find a way to escalate privileges. To achieve this, let's utilise the <a href="https://gtfobins.github.io/gtfobins/find/" target="_blank" referrerpolicy="no-referrer">GTFOBins payloads for find command</a>.</p>
<p class="mb-3">Once we run <code>sudo find . -exec /bin/sh \; -quit</code> and check if it works using <code>whoami</code>, we can see that we have now successfully escalated to root. Our attempt to unzip the backup file fails, so we need to run a Python HTTP server to allow us to download the zip file onto our local machine.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image8.png" alt="Find and Crack Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Opening <code>http://energysolutions.hv:1337</code> in the web browser shows us the directory listing. Click on the backup.zip file to download it.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image9.png" alt="Find and Crack Image 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Open another terminal and navigate to the Downloads directory. We will use fcrackzip tool with the full command <code>fcrackzip -D -p /usr/share/wordlists/rockyou.txt -u backup.zip</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image10.png" alt="Find and Crack Image 10" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> asdf;lkj</p>

<p class="mb-2"><strong>Question 5:</strong> Who is suspected of mining?</p>
<p class="mb-3">Now we can unzip the backup file using <code>unzip -P "asdf;lkj" backup.zip</code>. After some filtering with grep, we discover the person suspected of mining.</p>
<img src="/assets/hackinglabs/hackviser/warmups/findandcrack/findandcrack_hackviser_image11.png" alt="Find and Crack Image 11" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Ethan Friedman</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/dynamicbook.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>