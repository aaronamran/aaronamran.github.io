---
title: 'CVE 2015'
date: '2026-05-04'
excerpt: 'CVE-2015-8562, CVE-2015-3306'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2015</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2"><strong>1. Joomla HTTP Header Remote Code Execution (CVE-2015-8562)</strong></h4>
<p class="mb-3">Joomla is a popular open-source content management system. In versions 1.5.0 through 3.4.5, a severe unauthenticated Remote Code Execution vulnerability (CVE-2015-8562) exists. The vulnerability is caused by insecure deserialization of session data via the HTTP User-Agent header. This allows attackers to execute arbitrary shell commands directly on the server without needing to log in. Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2015-8562</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set. Enter <code>set RHOSTS [target_IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2015/cve-2015-8562/cvelabs_cve-2015-8562_image1.png" alt="CVE-2015-8562 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to spawn a standard system process to allow us to execute code on the target machine. Then we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2015/cve-2015-8562/cvelabs_cve-2015-8562_image2.png" alt="CVE-2015-8562 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Anubis</p>
<br />

<h4 class="mb-2"><strong>2. ProFTPD 1.3.5 Remote Code Execution (CVE-2015-3306)</strong></h4>
<p class="mb-3">ProFTPD is a widely used open-source FTP server for file transfer. This laboratory contains the CVE-2015-3306 vulnerability found in ProFTPD version 1.3.5. This vulnerability allows attackers to perform remote code execution attacks, enabling the execution of arbitrary commands on the server and potentially taking control of the system. What is the secret in the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>Open Metasploit in terminal using <code>msfconsole</code>. Use either <code>search ProFTPD 1.3.5</code> or <code>search CVE-2015-3306</code>, as both will return the same results.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2015/cve-2015-3306/cvelabs_cve-2015-3306_image1.png" alt="CVE-2015-3306 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">It is important to set the target IP's in options, and also adjust the <code>SITEPATH</code> from <code>/var/www</code> to <code>/var/www/html</code> since the target machine uses Apache2 Debian.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2015/cve-2015-3306/cvelabs_cve-2015-3306_image2.png" alt="CVE-2015-3306 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we use the payload <code>payload/cmd/unix/reverse_netcat</code>, we can see it is quite unstable. Therefore we need to change to <code>payload/cmd/unix/reverse_perl</code>. Once we run <code>exploit</code>, a command shell session should open, which allows us to run commands on the target machine. Simply use <code>cat /secret.txt</code> to retrieve the solution to the task.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2015/cve-2015-3306/cvelabs_cve-2015-3306_image3.png" alt="CVE-2015-3306 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Tyrannosaurus</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>