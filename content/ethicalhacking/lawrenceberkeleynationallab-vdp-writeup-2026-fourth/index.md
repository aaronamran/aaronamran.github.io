---
title: 'Berkeley Lab''s Invalid Calendar Date Leads to Denial-of-Service (DoS)'
date: '2026-01-28'
excerpt: 'Acknowledged by the Berkeley Lab Cybersecurity Team.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/lawrenceberkeleynationallablogo.png" alt="LBL logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Lawrence Berkeley National Laboratory (LBNL)</div>
<h1 class="writeup-title">Berkeley Lab's Invalid Calendar Date Leads to Denial-of-Service (DoS)</h1>
<div class="writeup-date">January 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>
<p class="lead mb-4">This write-up details my purely accidental discovery of a vulnerability that could lead to a denial-of-service (DoS) condition due to an invalid calendar date.</p>
<p class="lead mb-4">I came across the following web page during one of my reconnaissance activities:</p>
<img src="/assets/ethicalhacking/lbnlcalendardos/buds_homepage.png" alt="LBNL BUDS Homepage" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">When I clicked on the "Current" button, it updated the page to include a date parameter as seen in the URL below:</p>
<img src="/assets/ethicalhacking/lbnlcalendardos/current_date.png" alt="LBNL Current Date" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">   

<p class="lead mb-4">Immediately, I thought of testing the date parameter for XSS or at least HTML injection. However, I received the following error.</p>
<img src="/assets/ethicalhacking/lbnlcalendardos/http_status_500.png" alt="LBNL HTTP 500 Error" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Then a random idea came to mind. What if the software only expects valid dates? What will happen if I input an invalid date?</p>
<p class="lead mb-4">I tried inputting "0000-00-00" as the date parameter, which is an invalid date. To my surprise, the server responded with a HTTP 502 Bad Gateway response, indicating a potential denial-of-service (DoS) vulnerability. I immediately panicked and stopped my testing, because I remembered that DoS is prohibited in responsible disclosure programs.</p>
<p class="lead mb-4">I was not sure if this behavior was purely dependent on the current session, so I tested with a VPN access to change my IP address, and tested in an incognito window to confirm the behavior. I opened the target URL and it still showed HTTP 502 Bad Gateway.</p>
<p class="lead mb-4">After a lengthy discussion with Gemini, I decided to report the issue responsibly, because this is considered application level DoS, not network level DoS which is prohibited. I suspected that this is an input validation or backend-error handling issue related to unexpected date values. A possible mitigation could involve implementing proper input validation and graceful error handling for date parameters.</p>

<img src="/assets/ethicalhacking/lbnlcalendardos/jayemailreply.png" alt="Email reply from Jay at LBNL" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Jay replied promptly, acknowledging the issue and thanking me for my responsible disclosure. However, this time my name was not listed in the White Hats for Science Kudos section, probably because they forgot to add it. Despite this, I think it is alright, considering I have already received multiple acknowledgments in the past.</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">January 2026</p>
</section>

<div class="writeup-nav">
</div>

</div>