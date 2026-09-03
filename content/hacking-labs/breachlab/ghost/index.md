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
<p class="mb-2"><strong>Level 0: First Contact</strong> | Getting your bearings on a box you have never seen before. Every single engagement — offensive or defensive — starts here. Use the password for <code>ghost0</code> that you captured on the previous level, then: <code>ssh ghost0@204.168.229.209 -p 2222</code>.</p>
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


<p class="mb-2"><strong>Level 1: Name Game</strong> | Shell quoting is the foundation for shell injection, path traversal, and every real attack that abuses how operators pass arguments to other programs. Use the password that you captured on the previous level, then: <code>ssh ghost1@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. When we use <code>ls -al</code>, we see the following:</p>

```Bash
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


<p class="mb-2"><strong>Level 2: In The Shadows</strong> | Forensics and malware persistence analysis. Attackers hide their tools in exactly this way. Defenders hunt exactly this way. Use the password that you captured on the previous level, then: <code>ssh ghost2@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login.</p>

```Bash
ghost2@breachlab:~$ ls -a
.  ..  .bash_logout  .bashrc  .cache  .local  .memo  .profile  .ssh  .terminfo  investigation
ghost2@breachlab:~$ cd investigation
ghost2@breachlab:~/investigation$ ls -la
total 40
drwxr-x--- 1 ghost2 ghost2 4096 Jun 22 13:41 .
drwx------ 1 ghost2 ghost2 4096 Jun 26 04:04 ..
drwxr-x--- 1 ghost2 ghost2 4096 Jun 22 13:41 .leads
-rw-r----- 1 ghost2 ghost2  201 Jun 22 13:41 report.txt
-rw-r----- 1 ghost2 ghost2  205 Jun 22 13:41 summary.txt
ghost2@breachlab:~/investigation$ cd .leads
ghost2@breachlab:~/investigation/.leads$ ls -la
total 40
drwxr-x--- 1 ghost2 ghost2 4096 Jun 22 13:41 .
drwxr-x--- 1 ghost2 ghost2 4096 Jun 22 13:41 ..
-rw-r----- 1 ghost2 ghost2   13 Jun 22 13:41 .source_alpha
-rw-r----- 1 ghost2 ghost2   13 Jun 22 13:41 .source_beta
-rw-r----- 1 ghost2 ghost2   15 Jun 22 13:41 .source_omega
ghost2@breachlab:~/investigation/.leads$ cat .*
cat: .: Is a directory
cat: ..: Is a directory
7a4e91c63d2f
bb50d8e4a11c
H1dd3nInSh4dow
```

<p class="mb-3">Once we are logged in, we use <code>ls -la</code> to view hidden folders and files. Running <code>cat .*</code> attempts to read all items in the current directory, which reveals the password to the next level.</p>
<p class="mb-5"><strong>Password:</strong> H1dd3nInSh4dow</p>
<br />


<p class="mb-2"><strong>Level 3: Access Denied</strong> | Linux permissions are the entire foundation of privilege escalation. This is level zero of real privesc. Use the password that you captured on the previous level, then: <code>ssh ghost3@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. We then list out all the contents of the current directory.</p>

```Bash
ghost3@breachlab:~$ ls -al
total 68
drwx------ 1 ghost3 ghost3 4096 Aug 23 02:47 .
drwxr-xr-x 1 root   root   4096 Jun 22 13:41 ..
-rw-r--r-- 1 ghost3 ghost3  220 Jan  6  2022 .bash_logout
-rw-r--r-- 1 ghost3 ghost3 3771 Jan  6  2022 .bashrc
drwx------ 2 ghost3 ghost3 4096 Aug  9 13:36 .cache
drwxrwxr-x 3 ghost3 ghost3 4096 Jul  4 20:41 .local
-rw-r--r-- 1 ghost3 ghost3  807 Jan  6  2022 .profile
drwx------ 2 ghost3 ghost3 4096 Jun 24 02:16 .ssh
drwxrwxr-x 3 ghost3 ghost3 4096 Aug 10 17:47 .terminfo
drwxrwxr-x 3 ghost3 ghost3 4096 Aug 16 20:35 .warp
-rw-r----- 1 ghost3 ghost3  308 Apr 17 09:44 map.txt
```

<p class="mb-3">Notice that there is a file named <code>map.txt</code>. Reading it shows the following:</p>

```Bash
ghost3@breachlab:~$ cat map.txt
KAEL'S STORAGE LAYOUT
=====================
Recovered from workstation. Partially redacted.

  /var/intel/public/   — world readable
  /var/intel/ops/      — restricted
  /var/intel/archive/  — root only

Access follows the group scheme. The kernel will
tell you what you are, if you ask it.

— KAEL
```

<p class="mb-3">With the clues provided, we attempt to list out all the contents of each of the directories:</p>

```Bash
ghost3@breachlab:~$ ls -al /var/intel/public/
total 12
drwxr-xr-x 1 root root 4096 Jun 22 13:41 .
drwxr-xr-x 1 root root 4096 Jun 22 13:41 ..
-rw-r--r-- 1 root root  161 Jun 22 13:41 report_q1.txt
ghost3@breachlab:~$ ls -al /var/intel/ops/
total 16
drwxr-x--- 1 root analysts 4096 Jun 22 13:41 .
drwxr-xr-x 1 root root     4096 Jun 22 13:41 ..
----r----- 1 root analysts   19 Jun 22 13:41 access_codes.dat
----r----- 1 root analysts  103 Jun 22 13:41 operative_list.txt
ghost3@breachlab:~$ ls -al /var/intel/archive/
ls: cannot open directory '/var/intel/archive/': Permission denied
```

<p class="mb-3">Notice the permissions of the files <code>access_codes.dat</code> and <code>operative_list.txt</code> in <code>/var/intel/ops/</code>. To cross check our current user permissions, we run <code>id</code> which returns <code>uid=5003(ghost3) gid=5003(ghost3) groups=5003(ghost3),5010(analysts),5024(ghost-players)</code>. Since we do have the permissions to read those files, we can directly read <code>/var/intel/ops/access_codes.dat</code> which gives us the password for the next level.</p>
<p class="mb-5"><strong>Password:</strong> P3rm1ss10ns_M4tt3r</p>
<br />


<p class="mb-2"><strong>Level 4: Signal In The Noise</strong> | Threat hunting. This is the core loop of every SOC analyst on the planet — find the needle in the log haystack. Use the password that you captured on the previous level, then: <code>ssh ghost4@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. The current directory contains a folder named <code>vault</code>, which we then change directory to. Listing out the contents reveals a huge number of files.</p>

```Bash
ghost4@breachlab:~$ ls
vault
ghost4@breachlab:~$ cd vault
ghost4@breachlab:~/vault$ ls
louco        record_0042  record_0084  record_0126  record_0168  record_0210  record_0252  record_0294  record_0336  record_0378  record_0420  record_0462
record_0001  record_0043  record_0085  record_0127  record_0169  record_0211  record_0253  record_0295  record_0337  record_0379  record_0421  record_0463
record_0002  record_0044  record_0086  record_0128  record_0170  record_0212  record_0254  record_0296  record_0338  record_0380  record_0422  record_0464
record_0003  record_0045  record_0087  record_0129  record_0171  record_0213  record_0255  record_0297  record_0339  record_0381  record_0423  record_0465
record_0004  record_0046  record_0088  record_0130  record_0172  record_0214  record_0256  record_0298  record_0340  record_0382  record_0424  record_0466
record_0005  record_0047  record_0089  record_0131  record_0173  record_0215  record_0257  record_0299  record_0341  record_0383  record_0425  record_0467
record_0006  record_0048  record_0090  record_0132  record_0174  record_0216  record_0258  record_0300  record_0342  record_0384  record_0426  record_0468
record_0007  record_0049  record_0091  record_0133  record_0175  record_0217  record_0259  record_0301  record_0343  record_0385  record_0427  record_0469
record_0008  record_0050  record_0092  record_0134  record_0176  record_0218  record_0260  record_0302  record_0344  record_0386  record_0428  record_0470
record_0009  record_0051  record_0093  record_0135  record_0177  record_0219  record_0261  record_0303  record_0345  record_0387  record_0429  record_0471
record_0010  record_0052  record_0094  record_0136  record_0178  record_0220  record_0262  record_0304  record_0346  record_0388  record_0430  record_0472
record_0011  record_0053  record_0095  record_0137  record_0179  record_0221  record_0263  record_0305  record_0347  record_0389  record_0431  record_0473
record_0012  record_0054  record_0096  record_0138  record_0180  record_0222  record_0264  record_0306  record_0348  record_0390  record_0432  record_0474
record_0013  record_0055  record_0097  record_0139  record_0181  record_0223  record_0265  record_0307  record_0349  record_0391  record_0433  record_0475
record_0014  record_0056  record_0098  record_0140  record_0182  record_0224  record_0266  record_0308  record_0350  record_0392  record_0434  record_0476
record_0015  record_0057  record_0099  record_0141  record_0183  record_0225  record_0267  record_0309  record_0351  record_0393  record_0435  record_0477
record_0016  record_0058  record_0100  record_0142  record_0184  record_0226  record_0268  record_0310  record_0352  record_0394  record_0436  record_0478
record_0017  record_0059  record_0101  record_0143  record_0185  record_0227  record_0269  record_0311  record_0353  record_0395  record_0437  record_0479
record_0018  record_0060  record_0102  record_0144  record_0186  record_0228  record_0270  record_0312  record_0354  record_0396  record_0438  record_0480
record_0019  record_0061  record_0103  record_0145  record_0187  record_0229  record_0271  record_0313  record_0355  record_0397  record_0439  record_0481
record_0020  record_0062  record_0104  record_0146  record_0188  record_0230  record_0272  record_0314  record_0356  record_0398  record_0440  record_0482
record_0021  record_0063  record_0105  record_0147  record_0189  record_0231  record_0273  record_0315  record_0357  record_0399  record_0441  record_0483
record_0022  record_0064  record_0106  record_0148  record_0190  record_0232  record_0274  record_0316  record_0358  record_0400  record_0442  record_0484
record_0023  record_0065  record_0107  record_0149  record_0191  record_0233  record_0275  record_0317  record_0359  record_0401  record_0443  record_0485
record_0024  record_0066  record_0108  record_0150  record_0192  record_0234  record_0276  record_0318  record_0360  record_0402  record_0444  record_0486
record_0025  record_0067  record_0109  record_0151  record_0193  record_0235  record_0277  record_0319  record_0361  record_0403  record_0445  record_0487
record_0026  record_0068  record_0110  record_0152  record_0194  record_0236  record_0278  record_0320  record_0362  record_0404  record_0446  record_0488
record_0027  record_0069  record_0111  record_0153  record_0195  record_0237  record_0279  record_0321  record_0363  record_0405  record_0447  record_0489
record_0028  record_0070  record_0112  record_0154  record_0196  record_0238  record_0280  record_0322  record_0364  record_0406  record_0448  record_0490
record_0029  record_0071  record_0113  record_0155  record_0197  record_0239  record_0281  record_0323  record_0365  record_0407  record_0449  record_0491
record_0030  record_0072  record_0114  record_0156  record_0198  record_0240  record_0282  record_0324  record_0366  record_0408  record_0450  record_0492
record_0031  record_0073  record_0115  record_0157  record_0199  record_0241  record_0283  record_0325  record_0367  record_0409  record_0451  record_0493
record_0032  record_0074  record_0116  record_0158  record_0200  record_0242  record_0284  record_0326  record_0368  record_0410  record_0452  record_0494
record_0033  record_0075  record_0117  record_0159  record_0201  record_0243  record_0285  record_0327  record_0369  record_0411  record_0453  record_0495
record_0034  record_0076  record_0118  record_0160  record_0202  record_0244  record_0286  record_0328  record_0370  record_0412  record_0454  record_0496
record_0035  record_0077  record_0119  record_0161  record_0203  record_0245  record_0287  record_0329  record_0371  record_0413  record_0455  record_0497
record_0036  record_0078  record_0120  record_0162  record_0204  record_0246  record_0288  record_0330  record_0372  record_0414  record_0456  record_0498
record_0037  record_0079  record_0121  record_0163  record_0205  record_0247  record_0289  record_0331  record_0373  record_0415  record_0457  record_0499
record_0038  record_0080  record_0122  record_0164  record_0206  record_0248  record_0290  record_0332  record_0374  record_0416  record_0458  record_0500
record_0039  record_0081  record_0123  record_0165  record_0207  record_0249  record_0291  record_0333  record_0375  record_0417  record_0459
record_0040  record_0082  record_0124  record_0166  record_0208  record_0250  record_0292  record_0334  record_0376  record_0418  record_0460
record_0041  record_0083  record_0125  record_0167  record_0209  record_0251  record_0293  record_0335  record_0377  record_0419  record_0461
ghost4@breachlab:~/vault$ cat record_0001
[2026-03-28 02:01:01] STATUS: 41b952e38b4298e07ec671735d818a9d
```

<p class="mb-3">Reading few of the files shows us that there is a certain pattern to their contents. So we run <code>cat record_* | grep -v "STATUS"</code> to search through all files in the directory. The <code>-v</code> flag is "invert-match" which tells grep to show us everything that does not contain the word STATUS. Reading the output reveals to us the password we need.</p>

```Bash
ghost4@breachlab:~/vault$ cat record_* | grep -v "STATUS"
[2026-03-28 02:47:13] password=OXJukpigxrek5Aij
[2026-03-28 02:47:13] password=lGkIOi0VAxYi9mWK
[CLASSIFIED] CREDENTIAL: Gr3p_F1nds_Truth
[2026-03-28 02:47:13] password=IToIl8UcTIkRC6cM
[2026-03-28 02:47:13] password=6nRicmB1WPUtRdIB
[2026-03-28 02:47:13] password=wH7v87lbQx9HTiqq
```

<p class="mb-5"><strong>Password:</strong> Gr3p_F1nds_Truth</p>
<br />


<p class="mb-2"><strong>Level 5: The Listener</strong> | Network reconnaissance and banner grabbing. The opening move in every pentest. Use the password that you captured on the previous level, then: <code>ssh ghost5@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. Listing out available files shows a README file. Reading it gives us a clue on what is happening.</p>

```Bash
ghost5@breachlab:~$ ls
README
ghost5@breachlab:~$ cat README
ANALYST WORKSTATION — KAEL
Last active: 2026-03-28 02:47 UTC
Status: Abandoned

I left a service running on this box. Used to be my back channel —
two ports, one tells you how to talk, the other answers if you say
the right word.

I locked down `ss` and `netstat` weeks ago. Don't bother. The kernel
won't help you here. You'll have to knock on doors yourself.

`nc` and `curl` are still on the box. That's all you need.

Find the listener. Read what it tells you. Then answer it correctly.

— KAEL
```

<p class="mb-3">So we run <code>seq 1 65535 | xargs -P 250 -I {} bash -c '(echo > /dev/tcp/127.0.0.1/{}) 2>/dev/null && echo "Open port: {}"'</code> to scan the localhost for open ports. <code>seq 1 65535</code> generates a sequence of numbers from 1 to 65535, printing each number on a new line. <code>xargs -P 250 -I {}</code> reads the numbers coming through the pipe and passes them as arguments to a command. <code>-P 250</code> controls concurrency by running 250 parallel processes at any given moment. <code>-I {}</code> creates a placeholder named <code>{}</code>. Everywhere <code>{}</code> appears in the following command, <code>xargs</code> will replace it with the current port numnber. <code>/dev/tcp/127.0.0.1/{}</code> means Bash attempts to open a TCP connection to <code>127.0.0.1</code> on the port replacing <code>{}</code>. <code>echo > ...</code> tries to send an empty line into that TCP socket. <code>2>/dev/null</code> discards all error messages (like Connection refused or Connection timed out). Closed ports fail silently. <code>&&</code> is a logical AND operator. The command after <code>&&</code> runs only if the TCP connection attempt succeeded (exit status <code>0</code>). <code>echo "Open port: {}"</code> prints the result to your terminal exclusively when a port successfully accepts the connection.</p>

```Bash
ghost5@breachlab:~$ seq 1 65535 | xargs -P 250 -I {} bash -c '(echo > /dev/tcp/127.0.0.1/{}) 2>/dev/null && echo "Open port: {}"'
Open port: 22
Open port: 30003
Open port: 30101
Open port: 30100
Open port: 31339
Open port: 34890
Open port: 37818
Open port: 41310
Open port: 41311
Open port: 41337
Open port: 49213
```

<p class="mb-3">Now that we have the output, we loop through each of the ports to attempt getting the flag needed.</p>

```Bash
ghost5@breachlab:~$ for p in 30003 30100 30101 31339 34890 37818 41310 41311 41337 49213; do echo "=== Testing Port $p ==="; nc -w 1 127.0.0.1 $p; done
=== Testing Port 30003 ===
=== Testing Port 30100 ===

  GHOST PROTOCOL — CHANNEL A
  ─────────────────────────────────────

  This channel is informational only.

  Authentication token: GHOST
  Secure channel: port 30101

  Send the token to receive your credential.

=== Testing Port 30101 ===
AUTHENTICATE: === Testing Port 31339 ===
Ghost Graduation Gatekeeper
===========================
Submit three shards in one line, pipe-separated, no spaces:
  SHARD1:<val>|SHARD2:<val>|SHARD3:<val>

> === Testing Port 34890 ===
=== Testing Port 37818 ===
=== Testing Port 41310 ===
ghost credential-broker v1.2
usage: RETRIEVE <current-token>
=== Testing Port 41311 ===
=== Testing Port 41337 ===

  [ CLASSIFIED — GHOST TRACK BONUS ]
  ───────────────────────────────────────────

  You found the signal.

  The official brief listed 22 levels.
  You kept looking past the brief.

  ───────────────────────────────────────────

  OPERATIVE KAEL — STATUS: ACTIVE

  Last known location: PHANTOM network.
  Final message before going dark:

  "The machines you trust every day
   are not what they appear to be.

   Docker. Kubernetes. GitHub Actions.

   The real breach starts in the pipeline."

  ───────────────────────────────────────────

  NEXT TRACK: PHANTOM
  Status: LIVE — 30 levels of Linux privesc.
  See breachlab.org for the brief.

  ───────────────────────────────────────────
  breachlab.org  ·  Ghost Track  ·  Bonus Level

=== Testing Port 49213 ===
```

<p class="mb-3">With the latest information we have, we use <code>nc localhost [PORT_NUMBER]</code> to follow the hints and retrieve the flag.</p>

```Bash
ghost5@breachlab:~$ nc localhost 30100

  GHOST PROTOCOL — CHANNEL A
  ─────────────────────────────────────

  This channel is informational only.

  Authentication token: GHOST
  Secure channel: port 30101

  Send the token to receive your credential.

nc localhost 30101
ghost5@breachlab:~$ nc localhost 30101
AUTHENTICATE: GHOST

  Credential: P0rts_N3v3r_L13
```

<p class="mb-5"><strong>Password:</strong> P0rts_N3v3r_L13</p>
<br />


<p class="mb-2"><strong>Level 6: Ghost In The Machine</strong> | Credential extraction. Environment variables are how secrets leak into process lists, crash logs, and CI pipelines every single day. Use the password that you captured on the previous level, then: <code>ssh ghost6@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. We run <code>env</code> to list all current environment variables.</p>

```Bash
ghost6@breachlab:~$ env
SHELL=/bin/bash
METRICS_ENABLED=false
REGION=eu-central-1
LOG_LEVEL=minimal
HISTSIZE=1000
API_DIGEST=M252X0wzNGtzXzN2M3J5dGgxbmc=
TRACE_SALT=bW9uaXRvcmluZ19rZXlfZGVsdGE3
PWD=/home/ghost6
LOGNAME=ghost6
MAX_RETRIES=3
NODE_ID=ghost-analyst-07
RUNTIME_TOKEN=c3lzdGVtX3Rva2VuX2dhbW1hX3Yz
MOTD_SHOWN=pam
HOME=/home/ghost6
LANG=C.UTF-8
LS_COLORS=rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.webp=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:
SSH_CONNECTION=172.19.0.2 55676 172.19.0.3 22
DEPLOY_TAG=v2.1.4
CACHE_TTL=300
LESSCLOSE=/usr/bin/lesspipe %s %s
TERM=xterm-256color
HEALTH_INTERVAL=30
LESSOPEN=| /usr/bin/lesspipe %s
USER=ghost6
SHLVL=1
DB_POOL_SIZE=10
AVAILABILITY_ZONE=eu-central-1a
APP_VERSION=2.14.7
INSTANCE_TYPE=t3.micro
SSH_CLIENT=172.19.0.2 55676 22
SERVICE_PORT=8443
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
HISTFILESIZE=2000
RUNTIME_ENV=production
CACHE_SEED=bm90X2FfcmVhbF9jcmVkZW50aWFs
SSH_TTY=/dev/pts/1
BUILD_ID=a3f7b2c1
SESSION_HASH=d4e5f6a7b8
_=/usr/bin/env
ghost6@breachlab:~$ echo "M252X0wzNGtzXzN2M3J5dGgxbmc=" | base64 -d
3nv_L34ks_3v3ryth1ng
```

<p class="mb-3">Notice that <code>API_DIGEST</code> looks like a secret. Decoding it reveals the password required.</p>
<p class="mb-5"><strong>Password:</strong> 3nv_L34ks_3v3ryth1ng</p>
<br />


<p class="mb-2"><strong>Level 7: Lost In Translation</strong> | Malware analysis. Real-world payloads are almost always encoded two or three times deep to evade simple detection. Use the password that you captured on the previous level, then: <code>ssh ghost7@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. List out the files in the current directory.</p>

```Bash
ghost7@breachlab:~$ ls
transmission.dat
ghost7@breachlab:~$ cat transmission.dat
00000000: 5244 4e6a 4d47 517a 587a 4279 5830 5178  RDNjMGQzXzByX0Qx
00000010: 4d77 3d3d 0a                             Mw==.
ghost7@breachlab:~$ xxd -r transmission.dat
RDNjMGQzXzByX0QxMw==
ghost7@breachlab:~$ base64 -d RDNjMGQzXzByX0QxMw==
base64: 'RDNjMGQzXzByX0QxMw==': No such file or directory
ghost7@breachlab:~$ echo "RDNjMGQzXzByX0QxMw==" | base64 -d
D3c0d3_0r_D13
```

<p class="mb-3">When we read <code>transmission.dat</code>, we see a hex dump. Using <code>xxd -r</code> to convert the hex text back into actual binary data now results in a Base64 encoded string. So we pipe the output into <code>base64 -d</code> to decode it. A one-liner that works faster is this:</p>

```Bash
ghost7@breachlab:~$ cat transmission.dat | xxd -r | base64 -d
D3c0d3_0r_D13
```

<p class="mb-5"><strong>Password:</strong> D3c0d3_0r_D13</p>
<br />


<p class="mb-2"><strong>Level 8: Something's Running</strong> | Fileless malware analysis and live incident response. This is what an IR engineer does at 3am when a box is already compromised and disk forensics is too slow. Use the password that you captured on the previous level, then: <code>ssh ghost8@204.168.229.209 -p 2222</code>.</p>
<p class="mb-3"><strong>Steps:</strong> SSH to the given IP address and login. Then run <code>ps aux | grep ghost8</code> to list processes related to the current user.</p>

```Bash
ghost8@breachlab:~$ ps aux | grep ghost8
root          23  0.0  0.0   7040  2464 ?        S    Aug09   0:00 runuser -u ghost8 -p -- python3 /usr/local/bin/level8-daemon.py
root          25  0.0  0.0   7040  2464 ?        S    Aug09   0:00 runuser -u ghost8 -- python3 /usr/local/bin/level8-daemon.py
ghost8        39  0.0  0.0  13544  2360 ?        S    Aug09   0:00 python3 /usr/local/bin/level8-daemon.py
ghost8        40  0.0  0.0  13544  2316 ?        S    Aug09   0:00 python3 /usr/local/bin/level8-daemon.py
root     2349631  0.0  0.0  16976 10920 ?        Ss   06:02   0:00 sshd: ghost8 [priv]
ghost8   2349654  0.0  0.0  17280  8280 ?        S    06:02   0:00 sshd: ghost8@pts/1
ghost8   2349655  0.0  0.0   5048  4124 pts/1    Ss   06:02   0:00 -bash
ghost8   2350282  0.0  0.0   7484  3316 pts/1    R+   06:03   0:00 ps aux
ghost8   2350283  0.0  0.0   4024  2268 pts/1    S+   06:03   0:00 grep --color=auto ghost8
ghost8   2630946  0.0  0.0  13568  2336 ?        S    Aug10   0:00 python3 /usr/local/bin/level8-daemon.py
```

<p class="mb-3">Every process has its own folder in <code>/proc</code> named after its PID. Inside that folder, the <code>environ</code> file contains the environment variables that specific process is using. Specific to the current context, we narrow our focus to processes running Python. Read each of them until we get the password we need.</p>

```Bash
ghost8@breachlab:~$ strings /proc/40/environ
HOSTNAME=breachlab
PWD=/
HOME=/root
SHLVL=1
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
DEBIAN_FRONTEND=noninteractive
_=/usr/bin/env
ANALYST_KEY=Pr0c_T3lls_4ll
```

<p class="mb-5"><strong>Password:</strong> Pr0c_T3lls_4ll</p>
<br />


<p class="mb-2"><strong>Level 9: Core Dump</strong> Use the password that you captured on the previous level, then: <code>ssh ghost9@204.168.229.209 -p 2222</code>.</p>
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