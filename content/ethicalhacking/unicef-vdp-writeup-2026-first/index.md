---
title: 'Unauthenticated Uploads in UNICEF''s ArcGIS FeatureServer'
date: '2026-01-10'
excerpt: 'Public recognition via the UNICEF Information Security Hall of Fame.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/uniceflogo.png" alt="UNICEF logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">United Nations International Children's Emergency Fund (UNICEF)</div>
<h1 class="writeup-title">Unauthenticated Uploads in UNICEF's ArcGIS FeatureServer</h1>
<div class="writeup-date">January 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>
<p class="lead mb-4">As I've gotten older, I've realized that I stay engaged only when I'm working on problems that demand a high level of intellectual challenge. While I could easily spend my free time doing something relaxing, I consistently choose the opposite, drawn to difficult problems that push my thinking and provide the mental stimulation I look forward to. This blog documents that search for challenge. In October 2025, while browsing various Vulnerability Disclosure Programs in my spare time, I struggled to settle on a target, much like choosing a meal in a crowded food court. Eventually, <a href="https://www.unicef.org/digitalimpact/unicef-information-security-hall-fame" target="_blank" rel="noopener noreferrer">UNICEF's VDP</a> stood out. After reviewing the testing scope, I decided to focus there. If I found something, great. If not, I would simply move on.</a></p>

<div class="text-center">
<a href="https://www.unicef.org/digitalimpact/unicef-information-security-hall-fame#:~:text=Aaron%20Amran%20Bin%20Amiruddin" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/unicefarcgis/unicefinfosechalloffame.png" alt="UNICEF VDP" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">One thing I learned from my past experiences and reconnaissance efforts is that many large organizations dealing with societal data tend to rely on some form of geographical mapping systems, whether for internal use or public-facing services. UNICEF is no exception.</p>
<p class="lead mb-4">My reconnaissance phase targeting UNICEF's digital assets began with the usual Google dorks and subdomain enumeration on 28 October 2025 at around 3:00 PM. Leaked passwords? Leaked Social Security numbers or other sensitive credentials? None were publicly available. This was interesting, because it meant the challenge was starting to become real.</p>
<p class="lead mb-4">At that point, my perspective shifted. I asked myself: If I can't extract data from them, can I give them unwanted or malicious data instead? This led me to think about file upload functionalities, especially in places where the average user should not be allowed to upload anything. This is where geographical mapping systems entered the picture.</p>
<p class="lead mb-4">To set the context, many organizations use ArcGIS, a geographic information system designed for working with maps and spatial data. Suspecting that UNICEF might be using ArcGIS as well, I crafted a Google dork specifically targeting their ArcGIS upload endpoints via FeatureServer.</p>

<div class="text-center mb-4">
<div style="display:inline-block; text-align:left; position:relative;">
<pre><code id="dorkCode">site:*.unicef.* inurl:"/rest/services" intext:ArcGIS intext:upload</code></pre>
<div id="dorkCopied" style="position:absolute; right:90px; top:50%; transform:translateY(-50%); display:none; background:#28a745; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.85rem;">Copied!</div>
</div>
</div>

<img src="/assets/ethicalhacking/unicefarcgis/dorkresults1.png" alt="UNICEF ArcGIS Dork Results" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">The results were promising. I identified several ArcGIS FeatureServer endpoints that potentially allowed unauthenticated data uploads. I began reviewing each result to determine whether unauthenticated uploads were actually permitted. For explanation purposes, I will use the first result from the image above.</p>

<img src="/assets/ethicalhacking/unicefarcgis/appendblz.png" alt="UNICEF ArcGIS FeatureServer" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">From the URL <code>https://redacted.unicef.org/redacted/append</code>, I replaced <code>append</code> with <code>uploads</code> to check whether unauthenticated uploads were even allowed in the first place.</p>

<img src="/assets/ethicalhacking/unicefarcgis/cannotupload.png" alt="UNICEF ArcGIS Cannot Upload" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">A 403 error was returned. This suggested that UNICEF was aware of this risk and had properly restricted unauthenticated uploads on their ArcGIS FeatureServer endpoints. At this point, a change in strategy was necessary. My guiding principle is that for large organizations, it is nearly impossible to secure every single data source and service. The sheer scale makes mistakes inevitable somewhere. With that in mind, I crafted a new Google dork. By now, it was already around 7:00 PM.</p> 

<div class="text-center mb-4">
<div style="display:inline-block; text-align:left; position:relative;">
<pre><code id="dorkCode">site:*.unicef.* inurl:"/FeatureServer/uploads" </code></pre>
<div id="dorkCopied" style="position:absolute; right:90px; top:50%; transform:translateY(-50%); display:none; background:#28a745; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.85rem;">Copied!</div>
</div>
</div>


<img src="/assets/ethicalhacking/unicefarcgis/dorkresults2.png" alt="UNICEF ArcGIS Dork Results" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">This time, the result was clear. A single unsecured endpoint surfaced immediately. I clicked the first relevant and vulnerable link, which led me to the following page.</p>

<img src="/assets/ethicalhacking/unicefarcgis/uploadsendpoint.png" alt="UNICEF ArcGIS Upload Endpoint" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Take a close look at the image. Throughout this write-up, I've been discussing unauthenticated uploads, but did you notice that unauthenticated deletes were also possible? Without logging in as any user, I could delete geographical data remotely, from the comfort of my home, while eating a bag of chips. To further validate the upload capability, I tested it using a Proof-of-Concept (PoC) text file and filled in the item description to see whether the process would be blocked midway.</p>

<img src="/assets/ethicalhacking/unicefarcgis/uploaditem.png" alt="UNICEF ArcGIS Upload Item" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/unicefarcgis/browsefile.png" alt="UNICEF ArcGIS Browse File" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">A successful upload resulted in a response containing the message "Committed: true". The item ID generated during this process is important and should be noted.</p>

<img src="/assets/ethicalhacking/unicefarcgis/ethicalhack.png" alt="UNICEF ArcGIS Successful Upload" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">To verify that the upload was successful, I opened the item ID in a new browser tab to confirm that the file was indeed present on UNICEF's ArcGIS server.</p>

<img src="/assets/ethicalhacking/unicefarcgis/proofhack.png" alt="UNICEF ArcGIS Verify Upload" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">As an additional note, appending <code>?f=pjson</code> to the end of the URL displays the item's details in JSON format.</p>

<img src="/assets/ethicalhacking/unicefarcgis/jsonethicalhack.png" alt="UNICEF ArcGIS JSON Format" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Once the main PoC testing was complete, I returned to delete the uploaded item. The server responded with: <code>{"success": true}</code></p>

<img src="/assets/ethicalhacking/unicefarcgis/deleteitem.png" alt="UNICEF ArcGIS Delete Item" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I then prepared an 11-page PDF report containing detailed findings and screenshots, which I submitted via email to infosecurity@unicef.org at 10:15 PM. The next morning, I checked my email as soon as I woke up, hoping for a response. There was none. I got ready for work and continued with my day as usual. Days turned into weeks, and weeks into months, without any reply. During that time, I continued hunting for security flaws in other organizations' digital assets during my free time. Then, on 23 December 2025 at 11:58 PM, I finally received the following email:</p>

<img src="/assets/ethicalhacking/unicefarcgis/unicefinfosecemailreply.png" alt="UNICEF InfoSec Email Reply" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Either Santa Claus had been unusually generous in the year 2025, or I had been patient long enough to forget about the report and email entirely. Regardless, it was a pleasant surprise to finally receive a response after such a long wait. By 8 January 2026, I found myself wondering when the update regarding the UNICEF Information Security Hall of Fame would arrive. Driven by curiosity, I checked the website and found <a href="https://www.unicef.org/digitalimpact/unicef-information-security-hall-fame#:~:text=Aaron%20Amran%20Bin%20Amiruddin" target="_blank" rel="noopener noreferrer">my name listed there</a>. It turns out the email never came because they had already gone ahead and made it official. I was busy looking for an invitation to a party I was already attending.</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="./lawrenceberkeleynationallab-vdp-writeup-2026-third.html">next hack</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">January 2026</p>
</section>

<div class="writeup-nav">
</div>

</div>