---
title: "OnlineTri's Missing Content Security Policy (CSP) Directives"
date: '2026-09-22'
excerpt: "Listed in OnlineTri's Responsible Disclosure Hall of Fame."
prog: 'VDP'
org: 'OnlineTri'
---


<div class="writeup-header">
<img src="/assets/logo/onlinetrilogo.webp" alt="OnlineTri Logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">OnlineTri</div>
<h1 class="writeup-title">OnlineTri's Missing Content Security Policy (CSP) Directives</h1>
<div class="writeup-date">September 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>

<p class="lead mb-4">Triathlon is an endurance multisport race that combines swimming, cycling, and running in sequential order. If you are living in a French-speaking country and are interested in triathlon, you may have heard of <a href="https://onlinetri.com/" target="_blank" rel="noopener noreferer">OnlineTri</a> which is the leading French-language online platform and community dedicated to triathlon and has been active since 2002. OnlineTri was co-founded at the end of 2002 by Thierry Sourbier and Rodolphe Debureau. It also runs a <a href="https://onlinetri.com/halloffame.php" target="_blank" rel="noopener noreferrer">Vulnerability Disclosure Program (VDP) on its site</a>. People who discover security vulnerabilities may report them to Thierry directly using the contact email provided. Considering how Thierry accepts a wide range of reports (including security hardening practices and not exclusively exploitable security vulnerabilities), I actually think the site is quite well-hardened.</p>

<div class="text-center">
<a href="https://onlinetri.com/halloffame.php#:~:text=Aaron%20Amran%20Bin%20Amiruddin" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="./images/onlinetri_halloffame.png" alt="OnlineTri VDP HoF" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">Despite publishing this blog post on 22 September 2026, I actually discovered the missing Content Security Policy (CSP) directives on 6 May 2026. I discovered the existence of this responsible disclosure program because a random person posted their win on LinkedIn which appeared on my feed, and I figured, why not add a bit more to my own digital footprint?</p>

<p class="lead mb-4">As I am writing this on 22 September 2026, I honestly cannot remember the exact steps I took, but I roughly recall doing the usual reconnaissance phase and scrolling through the website functionalities. Realising that OnlineTri also accepts security hardening recommendations as well, I decided to focus on that approach instead.</p>

<p class="lead mb-4">I used <a href="https://csp-evaluator.withgoogle.com/" target="_blank" rel="noopener noreferer">Google's CSP Evaluator</a> and pasted OnlineTri's website URL. The CSP Evaluator fetches the website's response headers behind the scenes and analyses them for missing or insecurely configured directives that could leave the web application vulnerable to Cross-Site Scripting (XSS) and other injection-based attacks.</p>

![ONLINETRI 1](/images/onlinetri_cspevaluator1.png)

<p class="lead mb-4">After I clicking 'Check CSP' and waiting for a few seconds, the tool displayed the results. As shown, the <code>object-src</code> and <code>script-src</code> were missing.</p>

![ONLINETRI 2](/images/onlinetri_cspevaluator2.png)

<p class="lead mb-4">To further verify the lack of enforcement, I executed the following safe-for-testing code in the browser console.</p>

```JavaScript
// Create a fake "malicious" element to see if the browser blocks it
const testTrigger = document.createElement('img');
testTrigger.src = "x";
testTrigger.setAttribute('onerror', "alert(document.cookie); console.log('XSS triggered due to missing CSP directives')");
document.body.appendChild(testTrigger);
```

<p class="lead mb-4">Because no <code>script-src</code> was defined, the browser allowed the execution of the inline event handler without restriction.</p>

![ONLINETRI 3](/images/onlinetri_consoletestxss.png)

![ONLINETRI 4](/images/onlinetri_consolelog.png)

<p class="lead mb-4">Now let us talk about the impact. Without these CSP directives, the web application solely relies on output encoding to prevent XSS attacks. If an injection vulnerability were to be discovered in the future, there would be no secondary layer of defense to block the execution of malicious scripts or the exfiltration of sensitive data.</p>

<p class="lead mb-4">I wrote a complete email report detailing the steps I took and the possible suggested remediations, and sent it to Thierry on 6 May 2026. He first replied to my email on 18 September 2026, and updated the VDP acknowledgment page on 21 September 2026 to hyper-link my name to my LinkedIn profile.</p>


<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>