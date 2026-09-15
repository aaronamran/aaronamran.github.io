---
title: 'Editorial'
date: '2026-09-14'
excerpt: 'Easy - Linux'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Editorial</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Editorial is an easy difficulty Linux machine that features a publishing web application vulnerable to Server-Side Request Forgery (SSRF). This vulnerability is leveraged to gain access to an internal running API, which is then leveraged to obtain credentials that lead to SSH access to the machine. Enumerating the system further reveals a Git repository that is leveraged to reveal credentials for a new user. The root user can be obtained by exploiting CVE-2022-24439 and the sudo configuration.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many TCP ports are listening on Editorial?</p>
<p class="mb-3">Run <code>nmap -sC -sV -A [TARGET_IP] -Pn</code> to discover open ports.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-jbyobmwxar]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.19.96 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-14 07:43 EDT
Nmap scan report for 10.129.19.96
Host is up (0.26s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0d:ed:b2:9c:e2:53:fb:d4:c8:c1:19:6e:75:80:d8:64 (ECDSA)
|_  256 0f:b9:a7:51:0e:00:d5:7b:5b:7c:5f:bf:2b:ed:53:a0 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://editorial.htb
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 47.61 seconds
```

<p class="mb-3">We also need to add the DNS entry to the <code>/etc/hosts</code> file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-jbyobmwxar]─[~]
└──╼ [★]$ echo "10.129.19.96 editorial.htb" | sudo tee -a /etc/hosts
10.129.19.96 editorial.htb
```

<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is the primary domain name used by the webserver on editorial box?</p>
<p class="mb-3">Run <code>curl -I [TARGET_IP]</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-jbyobmwxar]─[~]
└──╼ [★]$ curl -I 10.129.19.96
HTTP/1.1 301 Moved Permanently
Server: nginx/1.18.0 (Ubuntu)
Date: Sun, 13 Sep 2026 11:48:40 GMT
Content-Type: text/html
Content-Length: 178
Connection: keep-alive
Location: http://editorial.htb
```

<p class="mb-3">Opening the website in a web browser and exploring reveals a page with multiple input fields.</p>

![Editorial1](/images/editorial_hackthebox_image1.png)

<p class="mb-5"><strong>Answer:</strong> editorial.htb</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What relative endpoint on the webserver can cause the server to generate an outbound HTTP request?</p>
<p class="mb-3">We open a new terminal and run <code>nc -lvnp 1337</code> to catch inbound requests. In the website, we display the DevTools Network Tab, enter <code>http://[LOCAL_IP]:1337</code> into the Cover URL field and click on Preview.</p>

![Editorial2](/images/editorial_hackthebox_image2.png)

<p class="mb-3">We should see the file name called upload-cover in the Network tab. At the same time, our Netcat listener should successfully receive an inbound request, proving SSRF.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-jbyobmwxar]─[~]
└──╼ [★]$ nc -lvnp 1337
Listening on 0.0.0.0 1337
Connection received on 10.129.19.96 36992
GET / HTTP/1.1
Host: 10.10.14.224:1337
User-Agent: python-requests/2.25.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
```

<p class="mb-5"><strong>Answer:</strong> /upload-cover</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What TCP port is serving another webserver listening only on localhost?</p>
<p class="mb-3"></p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<p class="mb-2"><strong>Question 5:</strong> </p>
<p class="mb-3"></p>

<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Submit the flag located in the dev user's home directory.</p>
<p class="mb-3"></p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

![Editorial1](/images/editorial_hackthebox_image1.png)

<p class="mb-2"><strong>Question 7:</strong> </p>
<p class="mb-3"></p>

<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<p class="mb-2"><strong>Question 8:</strong> </p>
<p class="mb-3"></p>

<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<p class="mb-2"><strong>Question 9:</strong> </p>
<p class="mb-3"></p>

<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<p class="mb-2"><strong>Question 10:</strong> </p>
<p class="mb-3"></p>

<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<p class="mb-2"><strong>Question 11:</strong> </p>
<p class="mb-3"></p>

<p class="mb-5"><strong>Answer:</strong> </p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>