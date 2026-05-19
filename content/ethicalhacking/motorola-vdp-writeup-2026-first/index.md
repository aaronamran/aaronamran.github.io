---
title: 'Motorola Solutions Pre-Authentication PII Leak'
date: '2026-05-19'
excerpt: 'Motorola Solutions Security Hall of Fame 2026 Member.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/motorolalogo.webp" alt="Motorola logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Motorola Solutions</div>
<h1 class="writeup-title">Motorola Solutions Pre-Authentication PII Leak</h1>
<div class="writeup-date">May 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>

<p class="lead mb-4">I could have written a detailed blog post explaining exactly how I found this vulnerability, but because I strictly follow the rules, I became lazy. You will understand why as you read on. Motorola Solutions hosts an <a href="https://www.motorolasolutions.com/en_us/about/security-vulnerability.html" target="_blank" rel="noopener noreferrer">official Responsible Vulnerability Disclosure Program here</a>.</p>

<div class="text-center">
<a href="https://www.motorolasolutions.com/en_us/about/security-vulnerability/hall-of-fame.html#:~:text=Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/motorolavdpfirst/motorola_halloffame2026.png" alt="Motorola Hall of Fame 2026" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">As usual, after an hour of reconnaissance, I found a few interesting things worth further investigation. However, one of them immediately caught my eye. Feel free to zoom into the screenshot below and test yourself to see if you can find it. As a disclaimer, this specific vulnerability isn't guaranteed to exist in other companies because it heavily depends on their unique configuration. This is exactly why actual, hands-on testing is required.</p>

<img src="/assets/ethicalhacking/motorolavdpfirst/motorolasolutionssupport_homepage.png" alt="Motorola Solutions Support" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">If you can spot the massive giveaway hinting at the vulnerability in the screenshot above, you have sharp eyes and have clearly spent time hunting in the real world, rather than spending most of your time in some fictional (and intentionally vulnerable) lab environment.</p>

<p class="lead mb-4">Once I identified the security flaw and successfully exploited it, I reported all the necessary details to their cybersecurity team on 6 February 2026 at 9:58 AM. I distinctly remember rushing to submit that email because I had a work meeting scheduled at 10:00 AM. If you thought I was going to attend the meeting first and submit my disclosure report later, sorry, but no. Finding vulnerabilities is highly addictive to me; I need to get them out of my system before my mind can clear up space for anything else. Later that same day, at 11:11 AM, I received a formal acknowledgement email from the Motorola Solutions Security Operations Center team confirming my submission had been received.</p>

<img src="/assets/ethicalhacking/motorolavdpfirst/motorola_soc_emailreply.png" alt="Motorola SOC Email Reply" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">After that, everything went completely quiet. I didn't receive any further emails or updates. Because of the radio silence, I assumed my vulnerability hadn't been accepted, so I never bothered to check Motorola's Security Hall of Fame to see if my name would ever appear.</p>

<p class="lead mb-4">Then, out of nowhere on the evening of 19 May 2026, I stumbled upon Raunak Gupta's celebratory LinkedIn post about his name being listed in Motorola's Hall of Fame. As I glanced at it, my eyes immediately caught a name that looked remarkably familiar. Wait a minute... it was actually me! I had no idea I was listed in the 2026 Hall of Fame. Had Raunak not shared his achievement on LinkedIn, and had it not popped up on my feed, I would still be completely in the dark. Fate works in mysterious ways.</p>

<div class="text-center">
<a href="https://www.linkedin.com/posts/raunak-gupta-772408255_motorola-solutions-hall-of-fame-check-it-share-7462198428454793216-DU_t?utm_source=share&utm_medium=member_desktop&rcm=ACoAACst-FMBpVNOybTXkpx4s-C2bfoDFQZx9mM" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/motorolavdpfirst/motorolahof_linkedinpost.png" alt="LinkedIn Post" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">Ultimately, the main reason I am not diving deep into the technical exploits that leaked tons of user PII on Motorola's website is that doing so requires explicit permission for full public disclosure, as stated in the excerpt of their VDP guidelines below.</p>

<img src="/assets/ethicalhacking/motorolavdpfirst/motorola_halloffame_guidelines.png" alt="Motorola SOC Email Reply" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Given that they didn't bother updating me after their initial acknowledgement, I highly doubt they would reply to any subsequent emails requesting disclosure approval.</p>


<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>