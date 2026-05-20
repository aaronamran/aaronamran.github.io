---
title: 'United Nations Information Security Hall of Fame Earned the Hard Way'
date: '2026-05-20'
excerpt: 'United Nations Information Security Hall of Fame 2026.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/unitednationslogo.png" alt="UN logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">United Nations</div>
<h1 class="writeup-title">United Nations Information Security Hall of Fame Earned the Hard Way</h1>
<div class="writeup-date">May 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>

<p class="lead mb-4">This could have been a short, straightforward blog post, but the United Nations Information Security team is incredibly strict when it comes to accepting reported vulnerabilities for responsible disclosure and Hall of Fame qualifications. Because of that, I’m going to include my actual journey of attempting to report multiple vulnerabilities. I first stumbled upon the existence of the <a href="https://unite.un.org/en/un-information-security-hall-fame" target="_blank" rel="noopener noreferrer">United Nations Information Security Hall of Fame</a> back in roughly October 2024.</p>

<div class="text-center">
<a href="https://unite.un.org/en/un-information-security-hall-fame#:~:text=Aaron%20Amran%20Bin%20Amiruddin%0AReported%20Security%20misconfiguration%20on%20gis.unocha.org%0A3%20March%202026" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/unitednationsvdp/unitednations_infosec_halloffame.png" alt="UN Infosec Hall of Fame" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<div class="text-center">
<a href="https://unite.un.org/en/ict-security/hall-fame#:~:text=Aaron%20Amran%20Bin%20Amiruddin%0AReported%20Security%20misconfiguration%20on%20gis.unocha.org%0A3%20March%202026" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/unitednationsvdp/unitednations_infosec_halloffame1.png" alt="UN Infosec Hall of Fame" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">I remember taking some time after Christmas 2025 to try and get my name onto the UN's Information Security Hall of Fame. Starting off with reconnaissance, I did some research and identified several domains belonging to the UN. Then, I enumerated their subdomains and manually checked them in a browser to see what they would reveal. Suddenly, I came across a subdomain belonging to unctad.org that triggered my instincts, telling me that something was off. I share the unredacted screenshots below which I used for my report to the UN.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/solrreleaseadminui.png" alt="Apache Solr Admin UI" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">As you can see on the bottom right of the Apache Solr screenshot above, it indicates that security was disabled for this server.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/solrreleaselogging.png" alt="Apache Solr Log4j2" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/unitednationsvdp/solrreleasesecurity.png" alt="Apache Solr Security" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Clicking on the security tab, as seen in the next screenshot, proves that my instincts were right.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/solrreleasecoreadmin.png" alt="Apache Solr Core Admin" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/unitednationsvdp/solrreleasejavaproperties.png" alt="Apache Solr Java Properties" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/unitednationsvdp/solrreleasethreaddump.png" alt="Apache Solr Thread Dump" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Similar unauthenticated public access to these Apache Solr admin panels was found for pre, qa, and dev, which represent different stages of the IT lifecycle. If you still do not think the severity is critical, take a look at the screenshot below.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/solrreleaseunloadcore.png" alt="Apache Solr Unload Core" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">By going to the Core Admin tab and clicking on a core, we can Unload, Rename, Swap, or Reload it. What are the implications, you ask? Anyone with malicious intent could have caused someone in UNCTAD's ICT Department to get fired. There was absolutely no security in place to prevent public access, meaning people with bad intentions could have easily deleted the database. I reported this finding to the UN on 30 December 2025 at 5:41 AM.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/oictinfosec_firstemail.png" alt="OICT Infosec 1st Email" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">They replied with the email shown above on 30 December 2025 at 9:53 PM. I won't deny that I was eagerly waiting for the good news of being listed on their Hall of Fame for this critical-level vulnerability. After around two weeks of not receiving any updates, I noticed that the subdomains for the Apache Solr admin panels all suddenly returned an HTTP 404 Not Found error. Quickly, I emailed the UN Information Security team on 16 January 2026 at 10:48 AM to check on the status, since the subdomains could no longer be accessed publicly. However, I never received a reply from them, even up until now.</p>

<p class="lead mb-4">Honestly, I felt scammed. I had spent many hours on this finding and reported a critical vulnerability without tampering with their databases. However, seeing other names listed on the UN Information Security Hall of Fame reminded me that they were not simply scamming ethical hackers for free vulnerability reports. So, I decided not to give up just yet.</p>

<p class="lead mb-4">I decided to try again with a lower-impact vulnerability, which was a publicly accessible XML-RPC endpoint leading to Server-Side Request Forgery (SSRF). I reported this on 31 January 2026 at 11:37 AM, but the UN Information Security team rejected the submission. Okay, so now I could roughly gauge the kind of vulnerabilities they were willing to accept. Still, I could not give up, because when I want something, I always know I will get it. I continued my vulnerability hunt for days and weeks.</p>

<p class="lead mb-4">Suddenly, I came across a subdomain belonging to the UN Global Compact. I noticed a <code>/s/</code> in its URL, which I knew was a telltale sign to test for a Salesforce misconfiguration. I tested it using a publicly available exploit, successfully leaked Personally Identifiable Information (PII), and reported my findings to UN Information Security. They replied with the following email.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/oictinfosec_secondemail.png" alt="OICT Infosec 2nd Email" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Seriously? The UN Global Compact is not under the UN Secretariat? So, apparently, the only target scope they triage is the UN Secretariat. Considering that I had already exploited this vulnerability and leaked PII, I couldn't just let it go. I decided to find the person-in-charge at the UN Global Compact. After discussing it with Gemini, I decided to directly contact Anand Nair, the Head of Digital and IT at the UN Global Compact, on LinkedIn. However, I did not receive a reply. I then emailed the UN Global Compact's Integrity team on 27 February 2026 at 10:05 PM, explaining my intentions and asking for a secure communication channel. On 28 February 2026 at 2:55 AM, Courtney Moran, the Senior Manager of Integrity at the UN Global Compact, replied to my email.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/unglobalcompact_firstemail.png" alt="UN Global Compact 1st Email" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">After receiving her email, I misinterpreted it and assumed Anand would reach out to me in a separate email to provide a secure channel, such as a PGP public key for encrypted communication. Because of this, I waited a few days. But alas, no email arrived. When I reread the message, it turned out they expected me to reply directly to their email to explain my findings. I did so on 3 March 2026 at 11:50 AM. The next day, on 4 March 2026 at 6:28 AM, Anand replied with the following email.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/unglobalcompact_secondemail.png" alt="UN Global Compact 2nd Email" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">It was a massive relief to safely and ethically report an exploited vulnerability on an out-of-scope target without having to face legal repercussions. But despite all this, our main mission was not yet accomplished. We still needed to find a unique vulnerability on actual UN Secretariat digital assets to secure a spot in their Information Security Hall of Fame. I needed a new strategy. Since I do not work there and do not know anyone at the UN, I had to approach this with systematic research and reconnaissance. I began researching what the UN Secretariat actually consists of and which offices its members belong to. Here is the <a href="https://www.un.org/en/about-us/secretariat" target="_blank" rel="noopener noreferrer" style="display:inline-block;">UN's own link about the Secretariat</a>, <a href="https://www.unonline.org/sites/un2.un.org/files/un_system_chart.pdf" target="_blank" rel="noopener noreferrer" style="display:inline-block;">the United Nation system chart</a>, and an <a href="https://www.uninnovation.network/un-entities/un-secretariat-dgacm" target="_blank" rel="noopener noreferrer" style="display:inline-block;">unverified list of Secretariat members from uninnovation.network</a>.</p>

<p class="lead mb-4">From the information gathered, I identified a proper list of target domains and enumerated their subdomains. I bookmarked several important findings, but I felt exhausted after spending months just trying to achieve a single entry in the UN Information Security Hall of Fame. Consequently, I changed my approach and relied on Google Dorking. It seems almost every ethical hacker wants to find Cross-Site Scripting (XSS), so I knew that even if I found an XSS vulnerability, there was a high chance it would be rejected as a duplicate. Then I remembered something. If I had previously found a misconfigured ArcGIS FeatureServer for UNICEF, I could possibly find a similar vulnerability within the UN's core digital assets. I used the Google Dork <code>site:*.unocha.org inurl:rest inurl:services</code>, and out came a bunch of promising results.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/unocha_restservices_googledork.png" alt="UNOCHA Google Dork Results" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I will not bore you with the proof-of-concept details for this, as you can read about the exact same approach I used in my <a href="/ethicalhacking/unicef-vdp-writeup-2026-first/" target="_blank" rel="noopener noreferrer" style="display:inline-block;">"Unauthenticated Uploads in UNICEF's ArcGIS FeatureServer" blog post</a>.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/sdn_sudan_featureserver_uploaditem_true.png" alt="UNOCHA Upload Malicious Item PoC" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I prepared my encrypted email report and sent it to the UN on 9 March 2026 at 1:50 PM. Later that night, at 11:43 PM, just as I was about to go to sleep, I received the following email from the UN.</p>

<img src="/assets/ethicalhacking/unitednationsvdp/oictinfosec_thirdemail.png" alt="OICT Infosec 3rd Email" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">The email instantly boosted my hope levels from 0% to 50%. After that, the UN Information Security team did not send any further email updates, so my hope remained at a cautious 50%. Then, on 20 May 2026, I randomly decided to check back on the <a href="https://unite.un.org/en/un-information-security-hall-fame" target="_blank" rel="noopener noreferrer">United Nations Information Security Hall of Fame</a> and noticed my name listed right there. Finally! I can officially move the United Nations to my hacked list and move on mentally to other organizations.</p>


<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>