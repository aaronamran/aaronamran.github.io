---
title: 'CVE 2019'
date: '2026-05-04'
excerpt: 'CVE-2019-16278, CVE-2019-9193, CVE-2019-15107'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2019</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2">1. Nostromo Web Server Remote Code Execution (CVE-2019-16278)</h4>
<p class="mb-3">Nostromo (<code>nhttpd</code>) is a minimalist, high-performance web server. In versions up to 1.9.6, a critical directory traversal vulnerability exists that leads to Remote Code Execution (RCE). The vulnerability is caused by a failure in the <code>http_verify</code> function, which incorrectly handles URL-encoded characters (like <code>%0d</code>). This allows attackers to bypass directory restrictions and execute arbitrary shell commands via the CGI execution process. Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2019-16278</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2019/cve-2019-16278/cvelabs_cve-2019-16278_image1.png" alt="CVE-2019-16278 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2019/cve-2019-16278/cvelabs_cve-2019-16278_image2.png" alt="CVE-2019-16278 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Dali</p>
<br />

<h4 class="mb-2">2. PostgreSQL COPY TO/FROM PROGRAM Authenticated Remote Code Execution (CVE-2019-9193)</h4>
<p class="mb-3">PostgreSQL is a powerful open-source relational database management system. This laboratory contains the CVE-2019-9193 vulnerability found in PostgreSQL versions 9.3 to 11.7. This vulnerability can be exploited by abusing the "<code>COPY TO/FROM PROGRAM</code>" function, allowing superusers and users in the 'pg_execute_server_program' group to execute arbitrary code in the context of the database's operating system user. This feature is enabled by default and allows execution of arbitrary operating system commands on Windows, Linux, and macOS. Note that third parties claim this is not an issue because PostgreSQL's functionality for 'COPY TO/FROM PROGRAM' is working as intended. However, it still holds potential for abuse by highly privileged users. In PostgreSQL, the default username is "postgres" and the password is "postgres." What is the secret in the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2019-9193</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2019/cve-2019-9193/cvelabs_cve-2019-9193_image1.png" alt="CVE-2019-9193 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2019/cve-2019-9193/cvelabs_cve-2019-9193_image2.png" alt="CVE-2019-9193 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Antares</p>
<br />

<h4 class="mb-2">3. Webmin <= 1.920 Remote Code Execution (CVE-2019-15107)</h4>
<p class="mb-3">Webmin is an open-source web-based system administration tool used for managing Unix-based systems. This laboratory contains the CVE-2019-15107 vulnerability found in Webmin version 1.920 and earlier. This vulnerability allows attackers to perform remote code execution attacks. Due to an error during user authentication, attackers can execute arbitrary commands on the Webmin server, potentially gaining control of the system. What is the secret in the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2019-15107</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2019/cve-2019-15107/cvelabs_cve-2019-15107_image1.png" alt="CVE-2019-15107 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2019/cve-2019-15107/cvelabs_cve-2019-15107_image2.png" alt="CVE-2019-15107 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Protego</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>