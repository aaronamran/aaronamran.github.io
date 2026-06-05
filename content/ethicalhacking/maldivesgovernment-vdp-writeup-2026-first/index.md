---
title: 'The Republic of Maldives Ministry of Defence Laravel Debug Leak'
date: '2026-05-25'
excerpt: 'Ranked 13 on National Cyber Security Agency (NCSA) of Maldives Bug Bounty Hall of Fame Leaderboards.'
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/ncsamaldiveslogo.png" alt="NCSA Maldives Logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">The Republic of Maldives Government</div>
<h1 class="writeup-title">The Republic of Maldives Ministry of Defence Laravel Debug Leak</h1>
<div class="writeup-date">May 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>

<p class="lead mb-4">The National Cyber Security Agency (NCSA) of Maldives hosts what they officially call a <a href="https://hub.ncsa.gov.mv/resources/bug-bounty-program" target="_blank" rel="noopener noreferrer">Bug Bounty Program here</a>. Personally, I would argue it aligns more closely with a Vulnerability Disclosure Program (VDP), given the lack of financial rewards. However, successful researchers are recognized with a Certificate of Appreciation and a spot on their public leaderboards, where points dictate your rank.</p>

<div class="text-center">
<a href="https://hub.ncsa.gov.mv/verify-certificate/c6ff78de-a9a7-4109-b0ca-5089166e5f1d" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
<img src="/assets/ethicalhacking/maldivesministryofdefence/ncsabugbounty_certificateofappreciation.png" alt="NCSA Bug Bounty Certificate" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
</a>
</div>

<p class="lead mb-4">Below is a snapshot of how the official NCSA Bug Bounty Hall of Fame leaderboards look as of May 24, 2026.</p>

<img src="/assets/ethicalhacking/maldivesministryofdefence/ncsabugbounty_hof_leaderboards1.png" alt="NCSA Bug Bounty Leaderboards 1" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/maldivesministryofdefence/ncsabugbounty_hof_leaderboards2.png" alt="NCSA Bug Bounty Leaderboards 2" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">If it wasn't for a random connection on LinkedIn posting their certificate of achievement, I would have never known this responsible disclosure program even existed. So, to that anonymous peer: thank you! Fired up by the discovery, I enabled my VPN and kicked off my usual methodology: subdomain enumeration. From there, I manually reviewed each discovered subdomain inside a Chrome browser. My goal at this early stage wasn't to throw automated tools at the targets, but rather to get an initial feel for the technology stacks in scope and to map out rough expectations for the attack surface.</p>

<p class="lead mb-4">Eventually, I stumbled across the official website for The Maldives' Ministry of Defence (defence.gov.mv). On first glance, nothing seemed out of the ordinary. I scrolled through the pages, clicked around the interface, checked the Wappalyzer browser extension, and explored Chrome Developer Tools looking for any interesting anomalies.</p>

<img src="/assets/ethicalhacking/maldivesministryofdefence/ministrydefence_mv_homepage.png" alt="Maldives Ministry of Defence Homepage" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Then, I noticed a search bar sitting in the top right corner of the screen. Whenever I see a search input, my immediate instinct is to test for Client-Side Injection vulnerabilities, specifically HTML Injection and Cross-Site Scripting (XSS). To test how the application handled raw HTML rendering, I submitted a simple, classic payload: <code>&lt;u&gt;test&lt;/u&gt;</code>.</p>

<img src="/assets/ethicalhacking/maldivesministryofdefence/htmlinjection_searchfield.png" alt="Search Field" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Instead of a standard search results page or a clean "No results found" message, I immediately triggered a catastrophic backend error. The application crashed, rendering a full Laravel Debug mode interface. This happened because the payload inadvertently intersected with a critical Database Exception.</p>

<img src="/assets/ethicalhacking/maldivesministryofdefence/stacktrace1.png" alt="Stack Trace 1" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/maldivesministryofdefence/stacktrace2.png" alt="Stack Trace 2" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<img src="/assets/ethicalhacking/maldivesministryofdefence/stacktrace3.png" alt="Stack Trace 3" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">As revealed in the screenshots, <code>App Debug</code> was explicitly set to <code>true</code>, and the <code>App Env</code> was configured as <code>local</code>. Despite the configuration indicating a "local" environment, this system was completely exposed and publicly accessible from anywhere on the internet without restriction.</p>

<img src="/assets/ethicalhacking/maldivesministryofdefence/stacktrace4.png" alt="Stack Trace 4" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Rather than handling the error gracefully, the server returned a comprehensive, interactive stack trace powered by the Flare/Ignition error handler. This exposed highly sensitive infrastructure details, providing a textbook example of Information Disclosure. It explicitly leaked the SQL error <code>SQLSTATE[42S22]: Column not found: 1054 Unknown column 'title' in 'where clause'</code>, revealed the precise mapping of the server's local file structure, calling out specific paths such as <code>/app/Livewire/SiteSearchComponent.php</code> and the raw SQL query being executed is visible: <code>select count(*) as aggregate from articles where title LIKE ? or content LIKE ?</code>. Because the application's underlying database schema was missing the title column in the articles table, my input broke the query logic entirely, dumping the internal state of the framework directly to the browser.</p>

<p class="lead mb-4">To secure the application against this level of exposure, the developers need to update the production environment file (.env) by setting <code>APP_DEBUG=false</code> and <code>APP_ENV=production</code>. This completely disables Laravel's interactive debugging interface on the public internet. Finally, the application should be configured to use generic, user-friendly custom error pages (like a standard "500 Server Error" page) for any unhandled exceptions. This ensures that internal database queries, application logic, and local server file paths are safely hidden from public view.</p>

<p class="lead mb-4">I submitted this finding on the morning of May 5, 2026. On May 24, 2026, I received an email from the NCSA Admin Team confirming that the vulnerability had been remediated and the case was officially closed. Since this was my first successful finding, they sent another email requesting my enrollment consent to officially participate in the Bug Bounty Program and display my handle on the public leaderboard. After registering my details, I was thrilled to see my name officially listed among the contributors.</p>



<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>