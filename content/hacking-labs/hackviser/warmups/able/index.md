---
title: 'Able'
date: '2026-03-26'
excerpt: 'Practice SSH and FTP services, brute-force attacks and privilege escalation techniques.'
prog: 'Hackviser Warmup Stage 3  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_logo.png" alt="Able logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Able</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 3</div>
</div>
</div>
<p class="lead mb-4">Brute-force is one of the methods of password cracking and aims to find the correct answer by systematically trying all possible combinations. It is recommended for practicing SSH and FTP services, brute-force attacks and privilege escalation techniques.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the name of the file in FTP?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target hostname]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image1.png" alt="Able Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">From the nmap scan results, we can see that there are two open ports: 21 (ftp) and 22 (ssh). Let's connect to port 21 using <code>ftp [target IP_Address]</code> with the username <code>Anonymous</code>. No password is required. Then view the available files and download the files.</p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image2.png" alt="Able Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> readme</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What is the username in the readme file that was accidentally leaked?</p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image3.png" alt="Able Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> ronald</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is the group of readme file?</p>
<p class="mb-3">Since we have the username ronald, we need to access the target machine. To do this, we need to brute-force the SSH service using a wordlist. Run <code>hydra -l ronald -P /usr/share/wordlists/rockyou.txt [target IP_Address] ssh -V</code> and wait for a successful attempt.</p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image4.png" alt="Able Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image5.png" alt="Able Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now that we have the password which turns out to be <code>zxcvbnm</code>, ssh to the target machine using <code>ssh ronald@[target IP_Address]</code>. Search for the readme file using <code>find / -name "readme"</code>, then navigate to its directory, and use <code>ls -l</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image6.png" alt="Able Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image7.png" alt="Able Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> sysadmins</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> In which directory path are the other files with the sysadmins group?</p>
<p class="mb-3">Use <code>find / -group sysadmins 2>/dev/null</code> to find all files that belong to the sysadmins group.</p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image8.png" alt="Able Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> /configs</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the file path of the getcap command?</p>
<p class="mb-3">Use <code>whereis getcap</code> to find the file path of the getcap command.</p>
<p class="mb-5"><strong>Answer:</strong> /usr/sbin/getcap</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> What is admin's IP address in the VPN?</p>
<p class="mb-3">To access the information of the admin user of the VPN, let's try to read the admin.vpn.wg.conf file we found previously. However, due to lack of privileges, we cannot read the file directly. </p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image9.png" alt="Able Image 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Let's check if there is a file that has been given a capability that we can use for privilege escalation. When we tried to run the getcap command, we got a command not found error. We could not run the command when we wrote it due to a situation related to the PATH variable. However, in the previous steps, we found the file path of the getcap command. When we tried to run it again using this file path, we were successful.</p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image10.png" alt="Able Image 10" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Looking at the output of the command we ran, we saw that the python3.9 executable file was given the <code>cap_setuid=ep</code> capability. <code>cap_setuid</code> changes the UID value of a process, giving it the capability to run with another user's permissions. Because of the <code>ep</code> value, the python3.9 program will run with root privileges when executed.</p>
<p class="mb-3">With this information, let's try to escalate the privileges by running the payload related to python and capabilities from the <a href="https://gtfobins.org/gtfobins/python/" target="_blank" referrerpolicy="no-referrer">GTFOBins list</a>. We will use this payload: <code>python3.9 -c 'import os; os.setuid(0); os.system("/bin/sh")'</code></p>
<img src="/assets/hackinglabs/hackviser/warmups/able/able_hackviser_image11.png" alt="Able Image 11" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now we can read the admin.vpn.wg.conf file and find the admin's IP address in the VPN.</p>
<p class="mb-5"><strong>Answer:</strong> 10.0.0.2</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>