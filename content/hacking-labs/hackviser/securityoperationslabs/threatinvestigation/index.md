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
<p class="mb-3"><strong>Steps: </strong>The complete XML file can be accessed <a href="https://storage.hackviser.com/file/hackviser-prod/labs/files/phishing_email_analysis.xml" target="_blank" rel="noopener noreferrer">here</a>.</p>
<p class="mb-3">Based on the phishing email analysis, the phishing email is Email ID 13 ("Action Required: Corporate Account Verification").</p>

```xml
<email id="13">
    <headers>
        <header name="Return-Path"><bounces+j.carter=novacore.hv@sendgrid.hv></header>
        <header name="Received">from mx.novacore.hv (mx.novacore.hv [192.168.1.1]) by internal.mail.novacore.hv with ESMTPS id ab12cd34; Wed, 25 Feb 2026 14:22:19 +0300</header>
        <header name="Received">from mail-pf1-f201.google.com (mail-pf1-f201.google.com [209.85.210.201]) by mx.novacore.hv with ESMTPS id ef56gh78; Wed, 25 Feb 2026 14:22:17 +0300</header>
        <header name="Received">from smtp.sendgrid.hv (smtp.sendgrid.hv [167.89.115.45]) by mail-pf1-f201.google.com with ESMTPS id ij90kl12; Wed, 25 Feb 2026 03:22:14 -0800</header>
        <header name="Received">from mail-out.phantomlink.hv (mail-out.phantomlink.hv [185.234.72.19]) by smtp.sendgrid.hv with ESMTP id mn34op56; Wed, 25 Feb 2026 03:22:11 -0800</header>
        <header name="From">"IT Helpdesk" <helpdesk@novacore.hv></header>
        <header name="To">j.carter@novacore.hv</header>
        <header name="Reply-To">support-desk@aborana.hv</header>
        <header name="Subject">Action Required: Corporate Account Verification</header>
        <header name="Date">Wed, 25 Feb 2026 11:21:00 +0000</header>
        <header name="Message-ID"><xk7732qqm@mail-out.phantomlink.hv></header>
        <header name="X-Mailer">PHPMailer 6.5.0</header>
        <header name="Authentication-Results">mx.novacore.hv; spf=fail (domain novacore.hv does not designate 185.234.72.19 as permitted sender) smtp.mailfrom=sendgrid.hv; dkim=fail header.d=novacore.hv</header>
        <header name="Content-Type">text/html; charset="UTF-8"</header>
        </headers>
    <body> Dear Employee, As part of our annual security compliance audit, all corporate accounts must be re-verified within the next 24 hours. This is a mandatory process required by our information security policy. Please click the link below to verify your corporate credentials: https://novacore-verify.phantomlink.hv/auth/login?uid=j.carter If you do not complete this verification by February 26, 2026, your account access will be temporarily suspended pending manual review. Regards, IT Helpdesk NovaCore Systems </body>
</email>
```
<p class="mb-3">We can see the following line as proof:</p>

```xml
<header name="Authentication-Results">mx.novacore.hv; spf=fail (domain novacore.hv does not designate 185.234.72.19 as permitted sender) smtp.mailfrom=sendgrid.hv; dkim=fail header.d=novacore.hv</header>
```

<p class="mb-3">Tracing the routing history using the <code>Received</code> headers reveals the original, external server that handed off the email to SendGrid:</p>

```xml
<header name="Received">from mail-out.phantomlink.hv (mail-out.phantomlink.hv [185.234.72.19]) by smtp.sendgrid.hv with ESMTP id mn34op56; Wed, 25 Feb 2026 03:22:11 -0800</header>
```

<p class="mb-5"><strong>Answer:</strong> mail-out.phantomlink.hv</p>
<br />


<h5 class="mb-2"><strong>2. VirusTotal - Signature Hunting Analysis</strong></h5>
<p class="mb-3">Malware analysts use a method called "Import Hash" (Imphash) to detect malware from the same family, even if they have different compilations. This value represents the hash of the Windows libraries and functions (Import Table) called by an executable file (PE). Even if the file size changes without altering the malicious code's functionality, the imphash usually remains constant.

Analyze the malware with the SHA-256 hash provided on VirusTotal and find the "Imphash" value of the file.</p>
<p class="mb-3"><strong>Steps: </strong>We are given the following hash.</p>

```txt
24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c
```

<p class="mb-3">When we search for <a href="https://www.virustotal.com/gui/file/24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c/detection" target="_blank" rel="noopener noreferrer">the given hash on VirusTotal</a>, we see the following:</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/threatinvestigation/threatinvestigation_hackviser_image1.png" alt="Threat Investigation 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Clicking on the DETAILS tab gives us the Imphash needed.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/threatinvestigation/threatinvestigation_hackviser_image2.png" alt="Threat Investigation 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 9ecee117164e0b870a53dd187cdd7174</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>