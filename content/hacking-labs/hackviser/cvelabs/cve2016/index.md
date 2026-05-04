---
title: 'CVE 2016'
date: '2026-05-04'
excerpt: 'CVE-2016-4010, CVE-2016-3088'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2016</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h5 class="mb-2">1. Magento REST API Remote Code Execution (CVE-2016-4010)</h5>
<p class="mb-3"><strong>Magento is a popular open-source e-commerce platform. In versions prior to 1.9.2.3, an unauthenticated Remote Code Execution (CVE-2016-4010) vulnerability exists due to insecure unserialization within the REST API. This vulnerability allows attackers to execute arbitrary shell commands directly on the server without needing to log in. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside the file?</strong></p>
<p class="mb-3">We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2016-4010</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set. Enter <code>set RHOSTS [target_IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2016/cve-2016-4010/cvelabs_cve-2016-4010_image1.png" alt="CVE-2016-4010 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to spawn a standard system process to allow us to execute code on the target machine. Then we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2016/cve-2016-4010/cvelabs_cve-2016-4010_image2.png" alt="CVE-2016-4010 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Deimos</p>
<br />

<h5 class="mb-2">2. Apache ActiveMQ Fileserver Remote Code Execution (CVE-2016-3088)</h5>
<p class="mb-3"><strong>Apache ActiveMQ is a popular open-source message broker written in Java that serves as a central point for managing communication between distributed applications. This laboratory features the CVE-2016-3088 vulnerability found in Apache ActiveMQ versions prior to 5.14.0. The vulnerability exists in the Fileserver web application, which allows remote users to upload files via HTTP PUT requests. Due to improper validation of file paths, an unauthenticated attacker can upload a malicious JSP file to the web server's directory and execute arbitrary code. This allows the attacker to run system-level commands and take full control of the message broker. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside?</strong></p>
<p class="mb-3">We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2016-3088</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set. Enter <code>set RHOSTS [target_IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2016/cve-2016-3088/cvelabs_cve-2016-3088_image1.png" alt="CVE-2016-3088 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to spawn a standard system process to allow us to execute code on the target machine. Then we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2016/cve-2016-3088/cvelabs_cve-2016-3088_image2.png" alt="CVE-2016-3088 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Prometheus</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>