---
title: 'Anchor'
date: '2026-06-26'
excerpt: 'Basic - Web - System'
prog: 'Hackviser Scenarios -  June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Anchor</h1>
<div class="writeup-date">June 2026 &middot; Scenarios</div>
</div>
</div>
<p class="lead mb-4">We have discovered that Nexcorp, a company we serve, has been cyber-attacked and its data has been stolen, and that this data has been uploaded to a website used for illegal file transfer. It is believed that the leaked data is hosted on the server of this website. Your task is to recover the leaked data and identify the attackers. Good luck!</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many files have been transferred to date?</p>
<p class="mb-3">We open anchorfile.hv in a web browser.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/anchor/anchor_hackviser_image1.png" alt="Anchor 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 2,424,521</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the IBAN address to which the money from the data sale will be transferred?</p>
<p class="mb-3">After a while of exploring the web application and fuzzing directory paths which did not yield any success, our next step is to gain access to the target server. First we perform a port scan via Nmap using <code>nmap -sC -sV -A [target_IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/anchor/anchor_hackviser_image2.png" alt="Anchor 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Notice that port 21, 22 and 80 are open. We will be targeting FTP port 21, because Nmap detects that it uses vsFTPd 2.3.4. There exists a backdoor vulnerability in vsFTPd 2.3.4, because in July 2011, the source archive for <code>vsftpd-2.3.4.tar.gz</code> on the official distribution site was briefly compromised by an unknown attacker. A backdoor was inserted into the source code before it was noticed and removed. vsFTPd monitors incoming authentication attempts. If a username supplied during login ends with the specific two-character sequence <code>:)</code> (a smiley face), the backdoor code triggers a specific routine. This routine attempts to spawn a bind shell (<code>/bin/sh</code>) executing with root privileges, listening on an uncommon high-numbered port (typically TCP port 6200). If the specific trigger condition is met, an auditor scanning the system would suddenly observe a new open port (6200) responding with a shell interface.</p>
<p class="mb-3">We open two terminals side by side, and test this backdoor. First we run <code>ftp [target_IP]</code> and login as <code>guest:)</code> and leave the password empty. Then we press Enter. Once the FTP login process starts to be unresponsive, we move to the other opened terminal. Here, we run <code>nc -nv [target_IP] 6200</code> to connect to the newly spawned port of the backdoor. Running <code>whomai</code> returns <code>root</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/anchor/anchor_hackviser_image3.png" alt="Anchor 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Since the FTP network loop is fragile, we need to maintain persistence independent of the FTP process. To do this, we enter <code>python3 -c 'import pty; pty.spawn("/bin/bash")'</code> to drop into a fully interactive Python terminal environment with the same root privileges.</p>
<p class="mb-3">Now we can search for the IBAN address in the server by using <code>grep -rnwI '/' -e 'IBAN' 2>/dev/null</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/anchor/anchor_hackviser_image4.png" alt="Anchor 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> DE89370400440532013000</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> From which IP address was the file with the company's data uploaded?</p>
<p class="mb-3">To find the source IP address of the uploaded file, we need to search for <code>access.log</code> in <code>/var/log/apache2</code>. But <code>access.log</code> is empty, so we need to find the relevant log file elsewhere. Moving one directory path up and reading <code>uploads.log</code> gives us the information we need.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/anchor/anchor_hackviser_image5.png" alt="Anchor 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 198.51.100.5</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What is the password of the admin user in the leaked data?</p>
<p class="mb-3">Now that we know the name of the file containing the company's data is <code>nexcorp.sql</code>, we need to find this file and read it. Running <code>find / -name "nexcorp.sql" -type f</code> shows us the full path of the file. We can then directly read it using <code>cat /etc/uploads/nexcorp.sql</code> and search for information about the admin user.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/anchor/anchor_hackviser_image6.png" alt="Anchor 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> AdminPass1234!</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>