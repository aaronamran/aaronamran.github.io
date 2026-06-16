---
title: 'Web Attack Analysis'
date: '2026-06-15'
excerpt: 'Practice Web Attack Analysis in multiple lab exercises.'
prog: 'Hackviser Security Operations Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Web Attack Analysis</h1>
<div class="writeup-date">June 2026 · Security Operations Labs</div>
</div>
</div>
<p class="lead mb-4">Practice web attack analysis in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Wazuh - SQL Injection Analysis</strong></h5>
<p class="mb-3">SQL injection is one of the most common and dangerous vulnerabilities in web applications. It occurs when user inputs are directly incorporated into SQL queries, allowing attackers to execute unauthorized queries against the database.

MITRE ATT&CK: T1190 - Exploit Public-Facing Application

An attacker is exploiting a web application's search functionality to access sensitive user information in the database.

Analyze the Wazuh logs and identify the name and version of the tool (user-agent) used to carry out the SQL injection attack.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image1.png" alt="Web Attack Analysis 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>sqlmap</code>, and click the details pop-up button of the first source and search for <code>ua</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image2.png" alt="Web Attack Analysis 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> sqlmap/1.7</p>
<br />


<h5 class="mb-2"><strong>2. Wazuh - Cross-site Scripting (XSS) Analysis</strong></h5>
<p class="mb-3">Cross-Site Scripting (XSS) is one of the most common security vulnerabilities in web applications. It allows an attacker to inject malicious JavaScript code into a web page and execute it in other users' browsers. In Reflected XSS, the malicious code is sent to the server via URL parameters and reflected back to the user in the response.

MITRE ATT&CK: T1059.007 - Command and Scripting Interpreter: JavaScript

An attacker is sending various XSS payloads to input fields on the web application's search and profile pages. The WAF detects these attempts and logs them with the [XSS_DETECTED] tag.

Analyze the Wazuh logs and identify the port number of the server where the attacker sent the stolen cookie information.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image3.png" alt="Web Attack Analysis 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>xss</code>, and click the details pop-up button of the last source and search for the keyword <code>document.cookie</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image4.png" alt="Web Attack Analysis 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 8080</p>
<br />


<h5 class="mb-2"><strong>3. Wazuh - IDOR Analysis</strong></h5>
<p class="mb-3">IDOR (Insecure Direct Object Reference) is a critical security vulnerability that occurs when web applications lack proper authorization controls. An authenticated user can access other users' data by manipulating object references (such as user IDs) in the URL. Listed under "Broken Access Control" in the OWASP Top 10, this vulnerability is particularly common in REST APIs.

MITRE ATT&CK: T1530 - Data from Cloud Storage / Access Control Bypass

An authenticated attacker is systematically changing the ID parameter in API endpoints to access other users' data. The WAF detects this pattern and generates alerts with the [AUTHZ_ALERT] tag.

Analyze the Wazuh logs and identify the account ID of the user who performed the IDOR attack.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image5.png" alt="Web Attack Analysis 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>AUTHZ_ALERT</code>, and click the details pop-up button of the first source and search for the keyword <code>AUTHZ_ALERT</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image6.png" alt="Web Attack Analysis 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 7</p>
<br />


<h5 class="mb-2"><strong>4. Wazuh - Command Injection Analysis</strong></h5>
<p class="mb-3">Command injection is a critical security vulnerability that occurs when web applications pass user inputs directly to operating system commands. An attacker can inject malicious commands into the HTTP request body to execute unauthorized OS commands on the server.

MITRE ATT&CK: T1059.004 - Command and Scripting Interpreter: Unix Shell

An attacker is attempting command injection through the host parameter of the /api/ping endpoint.

Analyze the Wazuh logs and identify the port number the attacker attempted to establish a reverse shell connection to.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image7.png" alt="Web Attack Analysis 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>ping</code>, and click the details pop-up button of the second source and search for the keyword <code>ping</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image8.png" alt="Web Attack Analysis 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 4444</p>
<br />


<h5 class="mb-2"><strong>5. Wazuh - Path Traversal Analysis</strong></h5>
<p class="mb-3">Path traversal (directory traversal) is a security vulnerability that occurs when web applications fail to properly validate user inputs. Attackers can access sensitive system files outside the web root directory by using ../ sequences in file paths.

MITRE ATT&CK: T1190 - Exploit Public-Facing Application

An attacker is exploiting a web application's file download function to access critical files on the server.

Analyze the Wazuh logs and identify the full path of the most critical system file the attacker accessed using the path traversal method.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image9.png" alt="Web Attack Analysis 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>"T1190" and "CRITICAL"</code>, and click the details pop-up button of the last source and search for the keyword <code>CRITICAL</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/webattackanalysis/webattackanalysis_hackviser_image10.png" alt="Web Attack Analysis 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> /etc/shadow</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>