---
title: "Discovering Hard-Coded Credentials on KOMDIGI's Website"
date: '2026-06-05'
excerpt: 'Received a Certificate of Appreciation from KOMDIGI-CSIRT.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/komdigi-csirt_logo.webp" alt="KOMDIGI-CSIRT Logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Indonesian Government</div>
<h1 class="writeup-title">Discovering Hard-Coded Credentials on KOMDIGI's Website</h1>
<div class="writeup-date">June 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>

<p class="lead mb-4">KOMDIGI-CSIRT, which stands for CSIRT Kementrian Komunikasi dan Digital Republik Indonesia (Computer Security Incident Response Team of the Ministry of Communication and Digital Affairs of the Republic of Indonesia), runs an official <a href="https://csirt.komdigi.go.id/leaderboard" target="_blank" rel="noopener noreferrer">Vulnerability Disclosure Program (VDP) here</a>. Successful researchers are recognized with a Certificate of Appreciation and a spot on their public leaderboard, where rankings are determined by individual points collected.</p>

<div class="text-center">
<a href="https://csirt.komdigi.go.id/leaderboard#:~:text=Aar***on%20Amr***an%20Bi***%20Ami***in" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/csirtkomdigivitesecretkey/Sertifikat_Apresiasi_CSIRT-KOMDIGI_AaronAmran.png" alt="KOMDIGI CSIRT VDP Certificate" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">Lately, I noticed that many of my Indonesian connections on LinkedIn who actively hunt for bugs have been posting certificates earned by discovering and submitting valid vulnerabilities to KOMDIGI-CSIRT. Spurred by this, I decided to try my hand at it. During registration, I noticed that certain profile fields strictly required Indonesian-specific information, such as local phone formats and cities. Since I didn't possess these, I skipped what I could and selected placeholder options for the rest, just enough to successfully provision a valid account.</p>

<p class="lead mb-4">My first round of enumerating and inspecting subdomains didn't yield immediate results. The perimeter looked fairly secure, so I decided to slow down and inspect the subdomains in closer detail. Eventually, I stumbled across a subdomain protected by a Cloudflare Turnstile human verification step. Initially, I didn't think much of it, but I dove into the browser's DevTools anyway to map out how the site behaved. I then pulled up the FindSomething browser extension to check for any exposed secrets or interesting patterns.</p>

<img src="/assets/ethicalhacking/csirtkomdigivitesecretkey/findsomething_sigmonkomdigi.png" alt="KOMDIGI-CSIRT 1" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">To my surprise, the tool instantly flagged an environment variable: <code>VITE_TURNSTILE_SECRET_KEY: REDACTED</code>. Realizing this could be significant, I copied the key and ran a global search across the source files in DevTools. Sure enough, the secret key was hardcoded directly into the client-side JavaScript.</p>

<img src="/assets/ethicalhacking/csirtkomdigivitesecretkey/viteturnstilesecretkeyexposed.png" alt="KOMDIGI-CSIRT 2" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">At this point, I wanted to ensure this would actually qualify as a valid vulnerability, so I did some quick research. <a href="https://developers.cloudflare.com/turnstile/get-started/#:~:text=Protect%20your%20secret%20keys.%20Never%20expose%20secret%20keys%20in%20client%2Dside%20code." target="_blank" rel="noopener noreferrer">Cloudflare’s official documentation explicitly warns against exposing secret keys in client-side code.</a> To understand why, we have to look at how Turnstile protects forms from bots: a front-end JavaScript widget challenges the visitor's browser and generates a token. The backend server is then supposed to securely transmit this token to Cloudflare to confirm its validity. The secret key is a private credential reserved strictly for that server-side validation. Exposing it defeats the integrity of the challenge.</p>

<p class="lead mb-4">With the official documentation validating my instincts, I packaged my findings and reported the flaw to KOMDIGI-CSIRT on 8 May 2026 at 9:00 AM. Less than two weeks later, I checked back on the status of my submission. The report was processed by the KOMDIGI helpdesk on 19 May 2026 at 2:40 PM, and was marked as valid just ten minutes later. Finally, on 4 June 2026, I received my official PDF certificate.</p>


<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>