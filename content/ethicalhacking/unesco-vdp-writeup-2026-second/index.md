---
title: 'UNESCO''s Unprotected Power Supply in Ecuador'
date: '2026-03-20'
excerpt: 'Public recognition via the UNESCO Cybersecurity Hall of Fame.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/unescologo.png" alt="UNESCO logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">United Nations Educational, Scientific and Cultural Organization (UNESCO)</div>
<h1 class="writeup-title">UNESCO's Unprotected Power Supply in Ecuador</h1>
<div class="writeup-date">March 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>
<p class="lead mb-4">This was my second attempt at reporting a vulnerability to UNESCO, following <a href="./unesco-vdp-writeup-2026-first.html">my previous article</a>. My goal this time was to identify a more critical finding for their vulnerability disclosure program, so I shifted my strategy from web application testing to reconnaissance of their open network ports.</p>

<div class="text-center">
<a href="https://www.unesco.org/en/vulnerability-disclosure#:~:text=Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/unescopowersupply/unesco_halloffame_aaron_powersupply.png" alt="UNESCO VDP" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">On the morning of 28 January 2026, I began auditing UNESCO's network infrastructure using Shodan. I searched for <code>org:unesco</code> and navigated to the "Ports" section to review the facet analysis of their internet-connected devices. Preferring a manual approach to vulnerability hunting, I personally inspected the open ports and their associated hosts.</p>

<img src="/assets/ethicalhacking/unescopowersupply/unesco_shodan_facet_analysis_ports.png" alt="UNESCO Shodan Ports" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">One specific port caught my eye because I had never encountered it before: port 502. Opening the Shodan page for this port revealed that it belonged to a device in Ecuador using the Modbus protocol, which is commonly used for industrial control systems. Further details for port 443 showed that the device was running Venus OS by Victron Energy.</p>

<img src="/assets/ethicalhacking/unescopowersupply/check_port_502_1.png" alt="UNESCO Shodan Port 502" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/unescopowersupply/check_port_502_2.png" alt="UNESCO Shodan Port 502" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/unescopowersupply/check_port_502_3.png" alt="UNESCO Shodan Port 502" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">When I tried to open port 502 in a web browser, it did not respond like a typical web page. This was expected, as Modbus is not a web-based protocol. I then tried to open port 443, which revealed a web-based interface for a Remote Console on a Local Area Network.</p>

<img src="/assets/ethicalhacking/unescopowersupply/remote_console_lan.png" alt="UNESCO Remote Console LAN" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">My instincts told me this was a significant finding. The fact that it was accessible over the internet posed a serious security risk, especially since hotkeys for remote control were readily available. To confirm the severity, I opened the Chrome DevTools and reloaded the page to check the HTTP response status.</p>

<img src="/assets/ethicalhacking/unescopowersupply/remote_console_lan_consolelog_noauth.png" alt="UNESCO Remote Console LAN DevTools" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">To my surprise, the DevTools Console states <b>No Auth required</b> and <b>Authentication OK</b>. Recognizing the gravity of this finding, I stopped my interaction immediately and reported it via email to UNESCO's Digital Security team.</p>

<p class="lead mb-4">I did some Google searches and read some related documentation to better understand the implications of this discovery.</p>

<img src="/assets/ethicalhacking/unescopowersupply/victron_energy_intro.png" alt="Victron Energy ESS Introduction" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/unescopowersupply/ess_external_control_googlesearch.png" alt="Victron Energy ESS External Control Google Search" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/unescopowersupply/victron_energy_ess_intro.png" alt="Victron Energy ESS External Control Victron Docs" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/unescopowersupply/victron_energy_ess_modes.png" alt="Victron Energy ESS Modes" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/unescopowersupply/victron_energy_remote_vrm_console.png" alt="Victron Energy ESS Remote VRM Console" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I also used Gemini to clarify what I was looking at, and here are Gemini's responses:</p>

<img src="/assets/ethicalhacking/unescopowersupply/gemini_analysis1.png" alt="Gemini Q&A" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/unescopowersupply/gemini_analysis2.png" alt="Gemini Q&A" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/unescopowersupply/gemini_analysis3.png" alt="Gemini Q&A" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Through this research, I discovered that the device is a remote console for a power supply unit. This means an attacker could potentially gain control over the power supply, causing a power outage or damaging connected equipment. This is a critical vulnerability with severe potential consequences for UNESCO's operations.</p>

<p class="lead mb-4">I waited until 26 February 2026 to receive confirmation from the Digital Security team. It felt like winning the lottery because I had achieved my goal of discovering a critical vulnerability to be added to my personal records.</p>

<img src="/assets/ethicalhacking/unescopowersupply/unesco_email_reply.png" alt="UNESCO VDP Confirmation" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I confirmed the fix was successful with a screenshot proof and sent the team the necessary details for my listing in their <a href="https://www.unesco.org/en/vulnerability-disclosure#:~:text=Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)">Cybersecurity Hall of Fame</a>.</p>

<img src="/assets/ethicalhacking/unescopowersupply/venus_gx_fixed.png" alt="Venus GX Fixed" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">



<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>

</div>