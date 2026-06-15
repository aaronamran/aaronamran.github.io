---
title: 'Threat Investigation'
date: '2026-06-15'
excerpt: 'Practice Threat Investigation in multiple lab exercises.'
prog: 'Hackviser Security Operations Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/threatinvestigation/threatinvestigation_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Threat Investigation</h1>
<div class="writeup-date">June 2026 · Security Operations Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Threat Investigation in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Phishing Email Analysis</strong></h5>
<p class="mb-3">An exported XML file from a corporate mail server is provided. This file contains 30 emails from an employee's inbox.

One of the emails is a phishing attempt. Identify the actual mail server from which this fraudulent email was sent.

What is the hostname of the actual originating mail server that sent the phishing email?

</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/threatinvestigation/threatinvestigation_hackviser_image1.png" alt="Threat Investigation 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>lsass.exe</code>, and click the details pop-up button of the first source and search for <code>LSASS</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/threatinvestigation/threatinvestigation_hackviser_image2.png" alt="Threat Investigation 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>2. VirusTotal - Signature Hunting Analysis</strong></h5>
<p class="mb-3">Malware analysts use a method called "Import Hash" (Imphash) to detect malware from the same family, even if they have different compilations. This value represents the hash of the Windows libraries and functions (Import Table) called by an executable file (PE). Even if the file size changes without altering the malicious code's functionality, the imphash usually remains constant.

Analyze the malware with the SHA-256 hash provided on VirusTotal and find the "Imphash" value of the file.</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/threatinvestigation/threatinvestigation_hackviser_image3.png" alt="Threat Investigation 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>backdoor.php</code>, and click the details pop-up button of the source and search for the keyword <code>SHA-256</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/threatinvestigation/threatinvestigation_hackviser_image4.png" alt="Threat Investigation 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> </p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>