---
title: 'Discovering HTML Injection in Berkeley Lab''s Search Feature'
date: '2025-12-15'
excerpt: 'Public recognition via White Hats for Science program.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/lawrenceberkeleynationallablogo.png" alt="LBL logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Lawrence Berkeley National Laboratory (LBNL)</div>
<h1 class="writeup-title">Discovering HTML Injection in Berkeley Lab's Search Feature</h1>
<div class="writeup-date">December 2025 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>
<p class="lead mb-4">"If you already scored a valid submission in a VDP, why would you hunt for security flaws again?" The answer is simple. I want to make sure my wins are not the result of luck, but of skill.</p>
<p class="lead mb-4">This story is a continuation of my previous write-up about <a href="/ethicalhacking/lawrenceberkeleynationallab-vdp-writeup-2025-first.html" target="_blank" rel="noopener noreferrer">my first valid submission in Lawrence Berkeley National Laboratory's (LBNL) Vulnerability Disclosure Program</a>.</p>

<div class="text-center">
<a href="https://commons.lbl.gov/spaces/cpp/pages/197691423/White+Hats+for+Science#:~:text=2025%2D12%2D22%3A%20Thank%20you%20again%20to%20Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)%20%2D%20Sarawak%20Information%20Systems%20(SAINS)%20for%20identifying%20a%20potential%20web%20server%20issue." target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/lbnlhtml/whitehatsforsciencekudos2.png" alt="LBNL VDP" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">As a quick recap, LBNL's VDP is their implementation of the <a href="https://www.energy.gov/cio/articles/vulnerability-disclosure-policy" target="_blank" rel="noopener noreferrer">US Department of Energy's Vulnerability Disclosure Program</a>. Essentially, anyone from any country is allowed to hunt for security flaws on their public-facing systems and disclose them responsibly, as long as the program rules are followed. Doing so provides legal safe harbor and helps ensure that researchers are not prosecuted under the <a href="https://www.law.cornell.edu/uscode/text/18/1030" target="_blank" rel="noopener noreferrer">Computer Fraud and Abuse Act (CFAA)</a>. It sounds intimidating at first, almost as if the FBI is watching your every move, but over time, you get used to it.</p>
<p class="lead mb-4">In my previous story, I mentioned my rather simple methodology. I enumerate subdomains and manually test each one. I am fully aware that this approach is inefficient compared to automation. However, I have terrible luck with automated tools in Kali Linux, and I have also found that poorly configured automation tends to trigger WAFs and alert the target's Security Operations Center far more easily.</p>
<p class="lead mb-4">Over the weekend, I continued manually going through the remaining LBNL subdomains, all while listening to Final Fantasy soundtracks in the background. One of life's most underrated luxuries is not having to rush against deadlines, simply enjoying music and casually browsing the internet, in this case, US Government systems. Due to the VDP scope restrictions, I estimated that around 70 percent of the sites were dead ends and not worth pushing further.</p>
<p class="lead mb-4">After bookmarking many potential targets, I eventually reached roughly the 446th subdomain. At first glance, it was a typical LBNL website with standard sections such as About, What We Do, and News & Events. Nothing immediately stood out as a promising attack surface, except for one feature, the search function.</p>
<p class="lead mb-4">When testing for potential HTML injection or XSS vulnerabilities, I tend to avoid using the <code>&lt;b&gt;</code> element. Before other hackers grab their pitchforks, let me explain. With modern CSS frameworks, typography styles, and headings, <code>&lt;b&gt;</code> is often unreliable as a visual indicator. It is easy to confuse injected output with existing styles. Instead, I prefer using its cousin, the <code>&lt;u&gt;</code> element. It is simple, unambiguous, and if HTML injection succeeds, the underline is immediately visible.</p>

<img src="/assets/ethicalhacking/lbnlhtml/underlinesearch.png" alt="LBNL Underlined Search" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">The result was clear. HTML injection was working.</p> 

<img src="/assets/ethicalhacking/lbnlhtml/cloudflarecslblgov.png" alt="LBNL CloudFlare WAF Triggered" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Naturally, I decided to explore further by testing what was allowed and what was blocked. After approximately three hours of testing, repeatedly triggering Cloudflare's WAF, and inspecting responses using browser Developer Tools, I arrived at several conclusions. The following HTML elements were allowed: <code>&lt;svg&gt;</code>, <code>&lt;iframe&gt;</code>, <code>&lt;a&gt;</code>, <code>&lt;h1&gt;</code>, <code>&lt;div&gt;</code>, <code>&lt;u&gt;</code>, <code>&lt;img&gt;</code> and <code>&lt;textarea&gt;</code>. Anything related to JavaScript, however, was blocked by Cloudflare's WAF. This included <code>&lt;script&gt;</code>, <code>&lt;noscript&gt;</code>, <code>&lt;alert&gt;</code>, <code>&lt;onclick&gt;</code>, <code>&lt;button&gt;</code>, <code>javascript:</code>, inline styles, <code>document.write()</code>, and the <code>onload</code> event.</p>

<img src="/assets/ethicalhacking/lbnlhtml/iframesources.png" alt="LBNL Iframe Sources" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">While experimenting further, I discovered that <code>&lt;iframe&gt;</code> blocked embedding google.com, but allowed sources under lbl.gov. This behavior suggested that iframe restrictions were enforced through <code>X-Frame-Options: SAMEORIGIN</code> and/or a Content Security Policy <code>frame-ancestors</code> directive. At this point, it was almost lunchtime, and attempting to bypass Cloudflare's WAF through payload obfuscation to achieve reflected XSS did not seem worth the energy-to-reward ratio. As a result, I shifted my focus toward weaponizing the HTML injection as a phishing vector instead.</p>
<p class="lead mb-4">I spent more time crafting a phishing-style HTML sign-in form. The main challenge was that CSS was blocked, which forced me to rely purely on HTML for layout and presentation. After many iterations and reusing what I had learned from previous tests, I arrived at a final payload.</p>

<pre>https://redacted.lbl.gov/?s=%3C/span%3E%3Cspan%3E%3Csvg%20width=%221000%22%20height=%2235%22%3E%3C/svg%3E%3Ccenter%3E%3Cform%20action=%22/login-endpoint%22%20method=%22POST%22%20class=%22form-example%22%3E%3Cbr%3E%3Cbr%3E%3Ch1%3ESession%20Expired%3C/h1%3E%20%3Ch3%3EFor%20security%20purposes,%20please%20sign%20in%20again%20to%20continue%3C/h3%3E%3Cbr/%3E%3Cdiv%20class=%22form-example%22%3E%3Clabel%20for=%22email%22%3EEmail%20address:%3C/label%3E%20%3Cinput%20type=%22email%22%20name=%22email%22%20id=%22email%22%20required%20/%3E%3Cbr%3E%3C/div%3E%3Cbr/%3E%3Cdiv%20class=%22form-example%22%3E%3Clabel%20for=%22password%22%3EPassword:%3C/label%3E%20%3Cinput%20type=%22password%22%20name=%22password%22%20id=%22password%22%20required%20/%3E%3Cbr%3E%3C/div%3E%3Cbr%3E%3Cdiv%20class=%22form-example%22%3E%3Cinput%20type=%22submit%22%20value=%22Sign%20In%22%20/%3E%3C/div%3E%3Csvg%20width=%221000%22%20height=%221000%22%3E%3C/svg%3E%3C/form%3E%3C/center%3E
</pre>

<p class="lead mb-4">All of that code, combined with careful UI positioning, resulted in a phishing page that looked convincing enough for users who do not inspect page source code or the complete URL.</p>

<img src="/assets/ethicalhacking/lbnlhtml/phishingcentered.png" alt="LBNL Phishing Page Centered" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Once again, I drafted a detailed email to the Berkeley Lab Cybersecurity team, clearly explaining my methodology, findings, and the specific behaviors enforced by Cloudflare's WAF.</p>
<p class="lead mb-4">About an hour later, I received a reply from their cybersecurity team. They thanked me for the responsible disclosure and informed me that my name had once again been added to the <a href="https://commons.lbl.gov/spaces/cpp/pages/197691423/White+Hats+for+Science#:~:text=2025%2D12%2D22%3A%20Thank%20you%20again%20to%20Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)%20%2D%20Sarawak%20Information%20Systems%20(SAINS)%20for%20identifying%20a%20potential%20web%20server%20issue." target="_blank" rel="noopener noreferrer">White Hats for Science Kudos list</a>.</p>

<img src="/assets/ethicalhacking/lbnlhtml/secondemailreply.png" alt="LBNL Django Email Reply" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Another win right before Christmas? I will gladly take that. While I did not manage to trigger an XSS vulnerability this time, it still felt like a solid validation of my approach. Otherwise, it might have been a Merry XSSMas instead of the usual Merry Xmas.</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="./unicef-vdp-writeup-2026-first.html">next hack</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">December 2025</p>
</section>

<div class="writeup-nav">
</div>

</div>