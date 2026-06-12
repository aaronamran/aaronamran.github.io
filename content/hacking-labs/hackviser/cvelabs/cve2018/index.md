---
title: 'CVE 2018'
date: '2026-05-04'
excerpt: 'CVE-2018-7600, CVE-2018-12613'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2018</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2">1. Drupalgeddon2 Remote Code Execution (CVE-2018-7600)</h4>
<p class="mb-3">Drupal is a popular open-source content management system. In versions of Drupal prior to 7.58, 8.3.9, 8.4.6, and 8.5.1, a highly critical vulnerability known as Drupalgeddon2 (CVE-2018-7600) exists. This vulnerability is caused by insufficient input validation within the Drupal Form API (FAPI), which allows attackers to achieve Remote Code Execution without requiring authentication. Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2018-7600</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2018/cve-2018-7600/cvelabs_cve-2018-7600_image1.png" alt="CVE-2018-7600 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to spawn a standard system process to allow us to execute code on the target machine. Then we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2018/cve-2018-7600/cvelabs_cve-2018-7600_image2.png" alt="CVE-2018-7600 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Xenon</p>
<br />

<h4 class="mb-2">2. phpMyAdmin 4.8.0/4.8.1 Authenticated Remote Code Execution (CVE-2018-12613)</h4>
<p class="mb-3">phpMyAdmin is a popular open-source management tool used to administer MySQL and MariaDB databases. This laboratory contains the CVE-2018-12613 authenticated vulnerability found in phpMyAdmin versions 4.8.0 and 4.8.1. This vulnerability allows a low-privileged, authenticated user to exploit the local file inclusion (LFI) flaw to perform remote code execution attacks. The user can gain unauthorized access to specific files and directories, execute PHP code on the server, and potentially compromise the database and the overall system. The default username in phpMyAdmin is root and there is no password. What is the secret in the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2018-12613</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2018/cve-2018-12613/cvelabs_cve-2018-12613_image1.png" alt="CVE-2018-12613 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set TARGETURI /</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to spawn a standard system process to allow us to execute code on the target machine. Then we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2018/cve-2018-12613/cvelabs_cve-2018-12613_image2.png" alt="CVE-2018-12613 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Hydrogen</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>