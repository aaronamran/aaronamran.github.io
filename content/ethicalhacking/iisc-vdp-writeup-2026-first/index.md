---
title: "Discovering Access Keys to Databases of Indian Institute of Science (IISc)"
date: '2026-09-17'
excerpt: "Acknowledged in IISc's Responsible Vulnerability Disclosure Programme Hall of Fame."
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/iisclogo.webp" alt="IISc Logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Indian Institute of Science (IISc)</div>
<h1 class="writeup-title">Discovering Access Keys to Databases of Indian Institute of Science (IISc)</h1>
<div class="writeup-date">September 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>

<p class="lead mb-4">The Indian Institute of Science (IISc) is (let me read from Google search) a public research university for higher education and research in science, engineering, design and management and is located in Bengaluru, Karnataka. The Information Security Office of IISc runs an official <a href="https://rvdp-iso.iisc.ac.in/responsible-vulnerability-disclosure-policy/" target="_blank" rel="noopener noreferrer">Vulnerability Disclosure Program (VDP) here</a>. Anyone who discovers a vulnerability and reports it to the office will have their name and email published in the Hall of Fame once it is triaged as valid.</p>

<div class="text-center">
<a href="https://rvdp-iso.iisc.ac.in/hall-of-fame/#:~:text=Aaron%20Amran%20Bin%20Amiruddin" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="./images/iisc_vdp_hof.png" alt="IISc VDP HoF" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">It was sometime in August and September 2026 that I realised my momentum for VDP bug hunting and CVE vulnerability hunting had taken a somewhat noticeable decline, due to a mix of taking on more responsibilities in my full-time role, starting more hands-on hacking labs such as Hack The Box, Hackviser, CyberWarFare Labs, and also slowly preparing myself for major Penetration Testing certifications such as TCM Security Practical Network Penetration Tester (PNPT), Hack The Box Certified Penetration Testing Specialist (CPTS) and of course the well-known Offensive Security Certified Professional (OSCP).</p>

<p class="lead mb-4">Anyways, back to the main topic of this blog. I was scrolling on my LinkedIn feed one day in August, when I saw a random guy sharing his win for the IISc VDP. At this point in time, I did not realise that India had IISc, because I thought India only had IIT (which everyone knows about). So I thought IISc was a specific research center based in India (which it kind of is). Realising that at this point in time my momentum was slowing down, I decided to search more about this VDP, understand the scope, and start off with subdomain enumeration.</p>

<p class="lead mb-4">After enumerating the subdomains, I used my 'caveman' method of validating which of the subdomains are alive or dead, simply by opening many of them in a web browser. This approach is a wide but shallow approach (checking many subdomains and aiming for easy-to-find vulnerabilities), unlike most professional bug hunters who use the narrow but deep approach (going in deeply on one target) because they have the skills and knowledge in identifying gadgets and chaining them to achieve high severity vulnerabilities (which I am honestly currently lacking).</p>

<p class="lead mb-4">From my brief surface-level findings, I came across two vulnerable subdomains, both of them having hardcoded access tokens for databases and for APIs. For the first subdomain, my FindSomething browser extension discovered a <code>PUBLIC_SANITY_WRITE_TOKEN</code>.</p>

![IISC 1](/images/iisc_publicsanitywritetoken1.png)

<p class="lead mb-4">I copied the token and did a global search in the Sources tab of the browser DevTools. There I saw the hardcoded token, proving that it is indeed not a false positive.</p>

![IISC 2](/images/iisc_publicsanitywritetoken2.png)

<p class="lead mb-4">Since I had never seen this token before, I did some research. Here is a brief summary to understand it: Exposing a <code>PUBLIC_SANITY_WRITE_TOKEN</code> in client-side JavaScript is a critical security vulnerability categorized as an Improper Control of Generation of Code and Metadata (CWE-615 / CWE-200) via hardcoded secrets. How can an attacker exploit this? An attacker opens your website, hits F12 to open the Developer Tools, and searches the compiled JavaScript for your Sanity project ID or token. Once found, they can run a script from their own terminal to manipulate your database:</p>

```console
curl -X POST https://sanity.io \
  -H "Authorization: Bearer LEAKED_PUBLIC_SANITY_WRITE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mutations": [
      {
        "delete": {
          "query": "*[_type == \"post\"]"
        }
      }
    ]
  }'
```

<p class="lead mb-4">That definitely does not sound good, especially when the PoC above demonstrates that we can delete things in the database. Moving on, the vulnerability I reported in the next subdomain was discovered using the same 'lazy' approach. The subdomain also has the hardcoded Bearer token in the client-side JavaScript.</p>

![IISC 3](/images/iisc_bearertoken1.png)

![IISC 4](/images/iisc_bearertoken2.png)

<p class="lead mb-4">The PoC to simulate an unauthorized direct API request using an exposed token would look roughly like this:</p>

```console
curl -X GET "https://api.airtable.com/v0/YOUR_APP_ID/Events?maxRecords=10" \
     -H "Authorization: Bearer YOUR_HARDCODED_TOKEN_HERE" \
     -H "Content-Type: application/json"
```

<p class="lead mb-4">Even though the HTTP method used in the PoC is <code>GET</code>, think about what would happen if we used methods such as <code>POST</code>, <code>PUT</code> / <code>PATCH</code> and <code>DELETE</code>.</p>

<p class="lead mb-4">I then wrote a complete email detailing the steps I took and my suggested remediations, and sent it to the contact email address provided on 23 August 2026. I received the initial reply on 24 August 2026, and they emailed me saying they added my name to the VDP Hall of Fame on 10 September 2026.</p>


<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>