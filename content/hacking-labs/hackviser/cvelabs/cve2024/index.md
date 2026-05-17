---
title: 'CVE 2024'
date: '2026-05-04'
excerpt: 'CVE-2024-3400, CVE-2024-2044, CVE-2024-23897, CVE-2024-27348'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2024</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h5 class="mb-2">1. Palo Alto Networks PAN-OS GlobalProtect Remote Code Execution (CVE-2024-3400)</h5>
<p class="mb-3"><strong>Palo Alto Networks PAN-OS software contains a critical command injection vulnerability in the GlobalProtect feature. In specific versions of PAN-OS 10.2, 11.0, and 11.1, an unauthenticated remote attacker can exploit a vulnerability in the way the SESSID cookie is handled. By using path traversal and injecting shell commands into the telemetry logs, an attacker can execute arbitrary code with root privileges on the firewall. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside the file?</strong></p>
<p class="mb-3">We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-44228</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<!-- <img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image1.png" alt="CVE-2021-44228 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. Apparently an error in exploit execution occured.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image2.png" alt="CVE-2021-44228 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To solve this problem, we need to enter <code>set SRVHOST [local_IP]</code>. Then run <code>exploit</code> again. A command shell will open and we can query the contents of secret.txt</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image3.png" alt="CVE-2021-44228 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" /> -->
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h5 class="mb-2">2. pgAdmin 4 Session Deserialization Remote Code Execution (CVE-2024-2044)</h5>
<p class="mb-3"><strong>pgAdmin 4 is the most popular open-source management tool for PostgreSQL databases. This laboratory demonstrates a critical Remote Code Execution vulnerability (CVE-2024-2044) in pgAdmin **4 versions prior to 8.4. The vulnerability exists in the session management mechanism. It allows an attacker with valid credentials to deserialize arbitrary objects by modifying the session cookie. The administrator forgot to change the default credentials: admin@local.dev / admin123. Using these credentials, exploit the vulnerability to read the /secret.txt file.</strong></p>
<!-- <p class="mb-3">We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-3129</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-3129/cvelabs_cve-2021-3129_image1.png" alt="CVE-2021-3129 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-3129/cvelabs_cve-2021-3129_image2.png" alt="CVE-2021-3129 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" /> -->
<p class="mb-5"><strong>Answer:</strong> /p>
<br />

<h5 class="mb-2">3. Jenkins Arbitrary File Read (CVE-2024-23897)</h5>
<p class="mb-3"><strong>Jenkins is the world's most widely used open-source automation server that manages Continuous Integration (CI) and Continuous Delivery (CD) flows in software development processes. This laboratory demonstrates a critical vulnerability (CVE-2024-23897) in Jenkins versions up to 2.441. The vulnerability exists in the built-in Command Line Interface (CLI) parser. It allows unauthenticated attackers to read arbitrary files on the server by leveraging the "@" character argument expansion feature. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside?</strong></p>
<!-- <p class="mb-3">First we need to perform a simple Nmap scan to identify which ports are open on the target machine.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image1.png" alt="CVE-2021-42013 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then we use Metasploit via <code>msfconsole</code>. Run <code>search CVE-2021-42013</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image2.png" alt="CVE-2021-42013 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>, <code>set RPORT 80</code>, <code>set SSL false</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. Once the Meterpreter session open and we simply run <code>shell</code> and then <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image3.png" alt="CVE-2021-42013 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" /> -->
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h5 class="mb-2">4. Apache HugeGraph Gremlin Remote Code Execution (CVE-2024-27348)</h5>
<p class="mb-3"><strong>Apache HugeGraph is a popular open-source graph database designed for managing and analyzing large-scale data with high performance. It supports the Gremlin query language for complex graph traversals. This laboratory features the critical CVE-2024-27348 vulnerability found in Apache HugeGraph Server versions prior to 1.3.0. The vulnerability exists in the Gremlin query execution engine, where sandbox restrictions can be bypassed. An unauthenticated remote attacker can send specially crafted Gremlin queries via the REST API to execute arbitrary Java code on the server (RCE). This allows the attacker to take full control of the database server. Note: Ensure that the payload selected during exploitation matches the target system architecture (x64). Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside?</strong></p>
<!-- <p class="mb-3">We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-43798</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-43798/cvelabs_cve-2021-43798_image1.png" alt="CVE-2021-43798 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set FILEPATH /secret.txt</code> and <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. The exploit will download the targeted file and save it in the given directory path.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-43798/cvelabs_cve-2021-43798_image2.png" alt="CVE-2021-43798 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Once we read the download file from the target machine, we obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-43798/cvelabs_cve-2021-43798_image3.png" alt="CVE-2021-43798 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" /> -->
<p class="mb-5"><strong>Answer:</strong> </p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>