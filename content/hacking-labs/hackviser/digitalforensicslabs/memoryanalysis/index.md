---
title: 'Memory Analysis'
date: '2026-06-14'
excerpt: 'Practice Memory Analysis in multiple lab exercises.'
prog: 'Hackviser Digital Forensics Labs  -  June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Memory Analysis</h1>
<div class="writeup-date">June 2026 · Digital Forensics Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Memory Analysis in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Detect Process</strong></h5>
<p class="mb-3">This lab contains a memory dump from a computer. It is possible to detect and analyze processes running on an operating system through memory analysis.

To complete the lab, examine the running processes and find the process named "hvagent.exe".

What is the Process Identification Number (PID) of the process named "hvagent.exe" ?</p>
<p class="mb-3"><strong>Steps: </strong>If volatility3 is not installed in our Linux machine, use each of the following commands to clone the GitHub repository, change directory and confirm the main execution script works.</p>

```bash
git clone https://github.com/volatilityfoundation/volatility3.git
cd volatility3
python3 vol.py -h
```

<p class="mb-3">To cleanly extract the target process information along with the table headers while suppressing the framework's real-time progress text, we execute the following command:</p>

```bash
user@linux:~/volatility3$ python3 vol.py -q -f [directory/detect_process/1.dmp] windows.pslist | grep -E "PID|hvagent.exe"
PID     PPID    ImageFileName   Offset(V)       Threads Handles SessionId       Wow64   CreateTime      ExitTime        File output
876     512     hvagent.exe     0x9084ce67d300  6       -       1       False   2024-01-04 04:05:04.000000 UTC  N/A     Disabled
```

<p class="mb-5"><strong>Answer:</strong> 876</p>
<br />


<h5 class="mb-2"><strong>2. Network Connections</strong></h5>
<p class="mb-3">This lab includes a memory dump of a computer. With memory analysis it is possible to find the network connections that processes perform on an operating system.

To complete the lab, list the network connections and find the IP address to which the process named "update.exe" is connected.

What is the IP address that the process named "update.exe" connects to?</p>
<p class="mb-3"><strong>Steps: </strong>To discover network communication mappings back to running processes within the memory dump without rendering real-time progress text, we execute the <code>windows.netscan</code> plugin filtered for our target executable:</p>

```bash
user@linux:~/volatility3$ python3 vol.py -q -f [directory/network_connections/network_connections.dmp] windows.netscan | grep -E "ForeignAddr|update.exe"
Offset  Proto   LocalAddr       LocalPort       ForeignAddr     ForeignPort     State   PID     Owner   Created
0x9084ce9826c0  TCPv4   10.0.0.11       50011   104.118.115.114 1337    SYN_SENT        632     update.exe      2024-01-04 04:01:17.000000 UTC
```

<p class="mb-5"><strong>Answer:</strong> 104.118.115.114</p>
<br />


<h5 class="mb-2"><strong>3. Browser History</strong></h5>
<p class="mb-3">This lab includes a memory dump of a computer. With memory analysis it is possible to take a dump of a running process.

To complete the lab, take a dump of the process created by the Microsoft Edge browser and analyze it.

What is the domain name of the suspicious web page visited in Microsoft Edge?

Answer Format: *****website.com</p>
<p class="mb-3"><strong>Steps: </strong>First, we utilize the <code>windows.pslist</code> plugin to identify the primary parent process ID (PID) belonging to active instances of <code>msedge.exe</code>. Upon locating the active parent PID (7044), we pass it to the <code>windows.memmap</code> plugin to carve out its private memory space structures into localized address descriptor fragments:</p>

```bash
user@linux:~/volatility3$ python3 vol.py -q -f [directory/browser_analysis/browser_analysis.dmp] -o ./edge_dumps windows.memmap --pid 7044 --dump
5496    512     msedge.exe      0x9084cf2b9080  0       -       1       False   2024-01-04 02:29:41.000000 UTC  2024-01-04 02:30:00.000000 UTC  Disabled
4768    1820    msedge.exe      0x9084cfb39080  0       -       1       False   2024-01-04 13:26:02.000000 UTC  2024-01-04 13:27:03.000000 UTC  Disabled
7044    512     msedge.exe      0x9084d2d67340  54      -       1       False   2024-01-04 13:27:04.000000 UTC  N/A     Disabled
7568    7044    msedge.exe      0x9084d1fce080  8       -       1       False   2024-01-04 13:27:05.000000 UTC  N/A     Disabled
7868    7044    msedge.exe      0x9084cf8460c0  15      -       1       False   2024-01-04 13:27:06.000000 UTC  N/A     Disabled
4796    7044    msedge.exe      0x9084c9ab7080  16      -       1       False   2024-01-04 13:27:06.000000 UTC  N/A     Disabled
4908    7044    msedge.exe      0x9084cf5b3080  9       -       1       False   2024-01-04 13:27:06.000000 UTC  N/A     Disabled
3084    7044    msedge.exe      0x9084ce6df0c0  8       -       1       False   2024-01-04 13:27:50.000000 UTC  N/A     Disabled
8056    7044    msedge.exe      0x9084cfc53340  12      -       1       False   2024-01-04 13:28:06.000000 UTC  N/A     Disabled
6728    7044    msedge.exe      0x9084cf3ad080  20      -       1       False   2024-01-04 13:34:05.000000 UTC  N/A     Disabled
```

<p class="mb-3">PIDs 5496 and 4768 have an exit timestamp listed in the tenth column (<code>2024-01-04 02:30:00</code> and <code>13:27:03</code>). This means they are dead/terminated processes.
PID 7044 is the browser's main parent process. We know this because almost every other running <code>msedge.exe</code> instance lists <code>7044</code> as its parent process (PPID, the second column). It also holds the highest thread count (54 threads) and has no exit time (N/A).
Since the parent process manages the primary orchestrations and holds historical references in memory, PID 7044 is our prime target to dump.</p>
<p class="mb-3">Then we need to create a folder to store <code>edge_dumps</code>.</p>

```bash
mkdir -p edge_dumps
```

<p class="mb-3">Now we can carve the memory space of PID 7044 into a separate file. This step will take a while.</p>

```bash
python3 vol.py -q -f [directory/browser_analysis/browser_analysis.dmp] -o ./edge_dumps windows.memmap --pid 7044 --dump
```

<p class="mb-3">Once the previous step is completed, we can now extract the suspicious domain name. The command used and its output is seen below:</p>

```bash
user@linux:~/volatility3$ strings edge_dumps/pid.7044.* | grep -Ei '[a-zA-Z0-9.-]+website\.com' | sort -u
 0uswebsite.com
#suspiciouswebsite.com
*.]suspiciouswebsite.com,*
;<@uspiciouswebsite.com/
@uswebsite.com
Puswebsite.com
careerwebsite.com/distrib_pages/jobs.cfm?
http://[*.]suspiciouswebsite.com,*
http://bing.com/search?q=suspiciouswebsite.com&FORM=ANAB01&PC=U531
http://suspiciouswebsite.com/
https://suspiciousmalwarewebsite.com/
https://suspiciouswebsite.com/
https://suspiciouswebsite.com:443,*
https://www.bing.com/search?pglt=2083&q=suspiciouswebsite.com&cvid=b1349b97dc30470ca570f00465b75817&gs_lcrp=EgZjaHJvbWUyBggAEEUYOjIGCAEQABhAMgYIAhAuGEAyBggDEEUYOTIGCAQQABhAMgYIBRAAGEAyBggGEC4YQDIGCAcQABhAMgYICBAAGECoAgCwAgA&FORM=ANSPA1&PC=U531
https://www.bing.com/search?q=suspiciouswebsite.com&FORM=ANCMS9&PC=U531
https://www.bing.com/search?q=suspiciouswebsite.com&gs_lcrp=EgZjaHJvbWUyBggAEEUYOjIGCAEQRRg5qAIAsAIA&FORM=ANCMS9&PC=U531
https://www.google.comA75B4218EF2F85DBDE766CEDCF974) anonymous]om http://suspiciouswebsite.com]
https://www.google.comA7C43FA83C5044434D6AF78BCFF34) anonymous]om http://suspiciouswebsite.com]
https://www.google.comE99692A3EF75FC5A87541D0FC13F3) derived from http://suspiciouswebsite.com]
iciouswebsite.com/
suspiciouswebsite.com
suspiciouswebsite.com:443,*
suspiciouswebsite.comsuspiciouswebsite.com
suspiciouswebsite.comy
ternally: (A8F217BB9E04BDCE94917F05E43A8E61) derived from http://suspiciouswebsite.com]
ttp://suspiciouswebsite.com/
uspiciouswebsite.com
uspiciouswebsite.com/
uswebsite.com
```

<p class="mb-5"><strong>Answer:</strong> suspiciouswebsite.com</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>