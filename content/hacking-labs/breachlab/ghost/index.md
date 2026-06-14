---
title: 'Ghost'
date: '2026-06-14'
excerpt: 'Linux and shell fundamentals'
prog: 'BreachLab'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">BreachLab</div>
<h1 class="writeup-title">Ghost</h1>
<div class="writeup-date">June 2026</div>
</div>
</div>
<p class="lead mb-4">This is a walkthrough of the <a href="https://breachlab.org/tracks/ghost" target="_blank" referrerpolicy="no-referrer">Ghost challenges on BreachLab</a>. Passwords for levels are not saved automatically. If you do not save them yourself, you will need to start over. Passwords also occasionally change. It is recommended to take notes on how to solve each challenge. As levels get more challenging, detailed notes are useful to return to where you left off, reference for later problems, or help others after you’ve completed the challenge.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Level 0: First Contact</strong> Use the password for <code>ghost0</code> that you captured on the previous level, then: <code>ssh ghost0@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. When we use <code>ls</code>, we can see a <code>README</code> and a <code>workspace</code> folder. Then <code>cd</code> to the workspace folder. Using <code>ls</code> shows us <code>archive</code> folder and <code>notes.txt</code>. Reading notes.txt shows the following: </p>

```txt
OPERATIONAL NOTES — KAEL
========================
Target: internal network segment 10.4.x.x
Method: passive recon, no active scanning
Status: ongoing

Credentials filed separately in archive/.
Do not store passwords in plaintext notes.
```

<p class="mb-3">Once we navigate to <code>workspace/archive</code> and read a file named <code>credentials</code>, we get the password for the Level 1.</p>
<p class="mb-5"><strong>Password:</strong> W3lc0m3T0Gh0st</p>
<br />


<p class="mb-2"><strong>Level 1: Name Game</strong> Use the password that you captured on the previous level, then: <code>ssh ghost1@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. When we use <code>ls -al</code>, we see the following:</p>

```bash
ghost1@breachlab:~$ ls -al
total 100
-rw-r----- 1 ghost1 ghost1   13 May 19 12:05  -
-rw-r----- 1 ghost1 ghost1   13 May 19 12:05  --help
drwx------ 1 ghost1 ghost1 4096 Jun 13 06:58  .
drwxr-xr-x 1 root   root   4096 May 19 12:05  ..
-rw-r----- 1 ghost1 ghost1   13 May 19 12:05  ...
-rw-r--r-- 1 ghost1 ghost1  220 Jan  6  2022  .bash_logout
-rw-r--r-- 1 ghost1 ghost1 3771 Jan  6  2022  .bashrc
drwx------ 2 ghost1 ghost1 4096 Jun 13 06:58  .cache
drwxrwxr-x 3 ghost1 ghost1 4096 May 24 13:08  .local
-rw-r--r-- 1 ghost1 ghost1  807 Jan  6  2022  .profile
drwx------ 2 ghost1 ghost1 4096 May 19 14:59  .ssh
drwxrwxr-x 3 ghost1 ghost1 4096 Jun  9 14:41  .terminfo
drwxrwxr-x 4 ghost1 ghost1 4096 Jun 10 06:41  LazyOwn
-rw-r----- 1 ghost1 ghost1  228 Apr 17 09:44  MANIFEST
-rw-r----- 1 ghost1 ghost1   15 May 19 12:05 'file name'
```

<p class="mb-3">Simply use <code>cat 'file name'</code> to read the password. It is important to use single or double quotes when reading the file because it has a space in its name.</p>
<p class="mb-5"><strong>Password:</strong> D4shIsN0tAFl4g</p>
<br />


<p class="mb-2"><strong>Level 2: In The Shadows</strong> Use the password that you captured on the previous level, then: <code>ssh ghost2@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 3: Access Denied</strong> Use the password that you captured on the previous level, then: <code>ssh ghost3@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 4: Signal In The Noise</strong> Use the password that you captured on the previous level, then: <code>ssh ghost4@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 5: The Listener</strong> Use the password that you captured on the previous level, then: <code>ssh ghost5@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 6: Ghost In The Machine</strong> Use the password that you captured on the previous level, then: <code>ssh ghost6@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 7: Lost In Translation</strong> Use the password that you captured on the previous level, then: <code>ssh ghost7@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 8: Something's Running</strong> Use the password that you captured on the previous level, then: <code>ssh ghost8@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 9: Noise Floor</strong> Use the password that you captured on the previous level, then: <code>ssh ghost9@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 10: Binary Strings</strong> Use the password that you captured on the previous level, then: <code>ssh ghost10@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 11: Wrapped Three Deep</strong> Use the password that you captured on the previous level, then: <code>ssh ghost11@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 12: Key Not Password</strong> Use the password that you captured on the previous level, then: <code>ssh ghost12@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 13: Port 3000</strong> Use the password that you captured on the previous level, then: <code>ssh ghost13@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 14: TLS, Not Plaintext</strong> Use the password that you captured on the previous level, then: <code>ssh ghost14@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 15: Port Range</strong> Use the password that you captured on the previous level, then: <code>ssh ghost15@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 16: Diff</strong> Use the password that you captured on the previous level, then: <code>ssh ghost16@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 17: No Shell For You</strong> Use the password that you captured on the previous level, then: <code>ssh ghost17@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 18: Wrong User</strong> Use the password that you captured on the previous level, then: <code>ssh ghost18@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 19: Your First Script</strong> Use the password that you captured on the previous level, then: <code>ssh ghost19@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 20: Cron Discovery</strong> Use the password that you captured on the previous level, then: <code>ssh ghost20@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<p class="mb-2"><strong>Level 21: Git Archaeology</strong> Use the password that you captured on the previous level, then: <code>ssh ghost21@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>
<br />


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>