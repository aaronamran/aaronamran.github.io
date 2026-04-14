---
title: 'Berkeley Lab''s Exposed CR1000X Datalogger'
date: '2026-01-20'
excerpt: 'Public recognition via White Hats for Science program.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/lawrenceberkeleynationallablogo.png" alt="LBL logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Lawrence Berkeley National Laboratory (LBNL)</div>
<h1 class="writeup-title">Berkeley Lab's Exposed CR1000X Datalogger</h1>
<div class="writeup-date">January 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>
<p class="lead mb-4">As I am writing this on 22 January 2026 at 12:08 PM, I discovered something that I personally find mind-blowing for us cybersecurity folks. Curious to know what it is? That will come later at the end of this blog.</p>
<p class="lead mb-4">For now, back to the main topic. This blog is a write-up of my successful attempt to discover my third officially valid vulnerability (and hopefully a fourth in the future) for <a href="https://commons.lbl.gov/spaces/cpp/pages/197691423/White+Hats+for+Science" target="_blank" referrerpolicy="noreferrer">Lawrence Berkeley National Laboratory's (LBNL) Vulnerability Disclosure Program.</a></p>

<div class="text-center">
<a href="https://commons.lbl.gov/spaces/cpp/pages/197691423/White+Hats+for+Science#:~:text=2026%2D01%2D21%3A%20Thank%20you%2C%20Aaron%20Amran%E2%80%94identification%20of%20an%20exposed%20device%20contributes%20positively%20to%20science%E2%80%94your%20vigilance%20enhances%20security!" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/lbnlcr1000x/whitehatsforsciencekudos3.png" alt="LBNL VDP" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">About two weeks ago, I realised that my existing methodology for enumerating subdomains and discovering hidden attack surfaces was suboptimal. Because of that, I decided to try a newer and more effective recon tool created by <a href="https://github.com/rix4uni" target="_blank" referrerpolicy="noreferrer">Bhagirath Saxena (rix4uni)</a>. I've already dropped the biggest hint by mentioning the tool creator and his GitHub, but I won't name the tool directly. I prefer readers to self-discover it, as I strongly believe people learn best when they put in their own effort.</p>
<p class="lead mb-4">Using this recon tool on Kali Linux, I enumerated a large set of subdomains, stored them in a text file, and manually opened them one by one to inspect the responses. Many ethical hackers would immediately pipe results into tools like httpx, Nuclei, or similar automation. While those tools are extremely powerful, I personally get better results through manual inspection. My belief is simple:
Tools focus heavily on status codes and signatures, but when you manually and visually inspect subdomains, combined with intuition and experience, you often notice things that automation misses.</p>
<p class="lead mb-4">After a lengthy session of bookmarking multiple interesting targets, I went through each bookmarked URL, testing for misconfigurations, XSS, and other common vulnerabilities. Eventually, I landed on a particularly interesting page.</p>

<img src="/assets/ethicalhacking/lbnlcr1000x/cr1000x_status_homepage.png" alt="LBNL CR1000X Datalogger Status Homepage" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">My first thought was information disclosure. However, for this type of vulnerability to be valid, it typically needs to expose sensitive data such as Personally Identifiable Information (PII), credentials, internal server or system configuration details. In this case, the page only displayed system status information. While not highly sensitive, it could still help an attacker understand the system's configuration and operational state. I initially assumed this would not be impactful enough and would likely result in an invalid submission.</p> 
<p class="lead mb-4">While reviewing the page, I noticed I was currently on the Status tab. There were other tabs available as well: Data, Files, and Utilities. I clicked on Files, and a Sign-In prompt immediately appeared.</p>

<img src="/assets/ethicalhacking/lbnlcr1000x/cr1000x_signin.png" alt="LBNL CR1000X Datalogger Sign-In Prompt" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I tested common default credential pairs like admin:admin, admin:password, and any other possible credential pairs that I could think of. None of them worked. At that point, I clicked Cancel, assuming the attempt was over.</p>

<img src="/assets/ethicalhacking/lbnlcr1000x/cr1000x_file_control.png" alt="LBNL CR1000X Datalogger File Control" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">To my surprise, I was not redirected to an HTTP 401 Unauthorized page. Instead, the File Control page remained fully accessible. This immediately triggered my curiosity. I repeated the same process for the Data and Utilities tabs, and observed the exact same behaviour.</p>

<p class="lead mb-4">The Data tab did not expose anything particularly interesting. However, the Utilities tab was a different story. It displayed functionality that appeared capable of modifying device settings. At this point, my unverified but reasonable assumption was that the authentication prompt was merely cosmetic, and that proper access control was not being enforced on the backend. In other words, an attacker could simply dismiss the login prompt and still gain access to potentially sensitive device functionality.</p>

<img src="/assets/ethicalhacking/lbnlcr1000x/cr1000x_utilities.png" alt="LBNL CR1000X Datalogger Utilities" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">To better understand the real-world impact of this exposure, I researched what the CR1000X actually is. The following information and images are taken from Campbell Scientific's official website.</p>

<img src="/assets/ethicalhacking/lbnlcr1000x/cr1000x_product_image.png" alt="LBNL CR1000X Datalogger Product Image" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/lbnlcr1000x/cr1000x_product_details.png" alt="LBNL CR1000X Datalogger Product Details" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Now this is interesting, the CR1000X is a rugged, high-precision datalogger designed for extreme environments. It is capable of operating for years on a single battery, often paired with a solar panel. At that moment, I was genuinely relieved that I did not attempt to alter any settings to demonstrate impact. Doing so could have disrupted critical research operations and potentially affected real people's careers.</p>

<p class="lead mb-4">I sent a detailed and responsible report to the Berkeley Lab Cybersecurity Team. A few hours later, I received a reply from Jay Krous. At the time, I did not realise who he was. Later, out of curiosity, I Googled his name, only to discover that he is the Head of Cybersecurity at Berkeley Lab.</p>

<img src="/assets/ethicalhacking/lbnlcr1000x/thirdvulnemailreply.png" alt="LBNL CR1000X Email Reply" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">While Googling Jay Krous, I noticed another search result titled: 'How Berkeley Lab Helped Develop One of the World's Most ...' so naturally I clicked on it.</p>

<a href="https://labpartnering.org/success-stories/0ea93456-f4fa-4b00-a083-8eea524eea36?labs%5B%5D=lbnl" target="_blank" referrerpolicy="noreferrer"><img src="/assets/ethicalhacking/lbnlcr1000x/berkeleylab_zeek.png" alt="Berkeley Lab Zeek" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async"></a>

<p class="lead mb-4">Berkeley Lab played a key role in developing Zeek. Yes, that Zeek. Zeek is a powerful network analysis framework widely used for security monitoring and network traffic analysis. If you've ever used educational platforms like TryHackMe, chances are you've encountered Zeek at some point.</p>

<p class="lead mb-4">Realising that I had responsibly disclosed a vulnerability to the same institution that helped create one of the most influential tools in modern network security was genuinely mind-blowing.</p>

<p class="lead mb-4">After <a href="https://commons.lbl.gov/spaces/cpp/pages/197691423/White+Hats+for+Science#:~:text=2026%2D01%2D21%3A%20Thank%20you%2C%20Aaron%20Amran%E2%80%94identification%20of%20an%20exposed%20device%20contributes%20positively%20to%20science%E2%80%94your%20vigilance%20enhances%20security!" target="_blank" rel="noopener noreferrer" style="display:inline-block;">Berkeley Lab Cybersecurity acknowledged my contribution in the White Hats for Science Kudos section</a>, this blog is finally published on 24 January 2026.</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="./lawrenceberkeleynationallab-vdp-writeup-2026-fourth.html">next hack</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">January 2026</p>
</section>

<div class="writeup-nav">
</div>

</div>