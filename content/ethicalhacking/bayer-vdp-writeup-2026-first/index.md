---
title: "Remote Code Execution and Authentication Bypass in Bayer"
date: '2026-06-12'
excerpt: "Listed in Bayer's Coordinated Vulnerability Disclosure (CVD) Hall of Fame."
prog: 'VDP'
---


<div class="writeup-header">
<img src="/assets/logo/bayerlogo.webp" alt="KOMDIGI-CSIRT Logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Bayer</div>
<h1 class="writeup-title">Remote Code Execution and Authentication Bypass in Bayer</h1>
<div class="writeup-date">June 2026 &mdash; Vulnerability Disclosure Program</div>
</div>
</div>

<p class="lead mb-4">On 26 January 2026, I was bored and decided to use Google dorking to search for more responsible disclosure programs to participate in. I found many programs, bookmarked them, and chose one to investigate. Apparently, fate had something in store for me, because the organization I selected was Bayer. For readers who are unfamiliar, Bayer is a German multinational pharmaceutical and life sciences company, and one of the largest pharmaceutical companies in the world.</p>

<p class="lead mb-4">This discovery felt personal. Back in 2017, during my first year in Germany for my German language course at IIK Berlin and later tertiary education at TH Brandenburg, I lived in Berlin with some friends. For several months, we stayed in an apartment where we would pass by Bayer's office in Berlin Mitte every day after language classes. Who would have thought that nine years later, in 2026, I would successfully gain access to Bayer's internal development environment through a critical vulnerability?</p>

<div class="text-center">
    <a href="https://www.bayer.com/en/cybersecurity-hall-of-fame#:~:text=Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
        <img src="/assets/ethicalhacking/bayerdevrce/bayer_cvd_halloffame2026.png" alt="Bayer CVD Hall of Fame" class="img-fluid rounded mb-4" style="max-width:720px; width:auto; display:block;" width="720" height="405" loading="lazy" decoding="async">
    </a>
</div>

<p class="lead mb-4">As usual, I began with subdomain enumeration. Recently, I tend to start directly with subdomain enumeration during reconnaissance, and only move to Google dorking or other techniques if nothing interesting appears. The tool I used returned 14,442 subdomains. That is a large number, but not all subdomains are valid live hosts. Proper filtering and validation are essential.</p>
<p class="lead mb-4">After a few hours of manual inspection and filtering, I found a subdomain that looked interesting. I had the Wappalyzer Chrome extension installed, and it identified the subdomain as running on React and NextJS. That immediately caught my attention. A few months earlier, the well known React2Shell vulnerability, CVE-2025-55182, had been discovered and gained significant attention in the cybersecurity community. I searched online for React2Shell checker tools and simply pasted the subdomain URL into one of them.</p>
<p class="lead mb-4">To my surprise, the tool reported that the subdomain was vulnerable to React2Shell. I immediately launched my Kali Linux virtual machine to verify whether this was a true positive.</p>

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_react2shell_unamea_1.png" alt="Bayer Dev React2Shell Vulnerability 1" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_react2shell_unamea_2.png" alt="Bayer Dev React2Shell Vulnerability 2" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
    
<p class="lead mb-4">The output confirmed that the vulnerable web application was running on a Linux system and that it had access to the <code>uname -a</code> command. This strongly suggested that the vulnerability was exploitable and allowed arbitrary command execution. I then executed another command, <code>whoami</code>, to determine the current user.</p>

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_react2shell_whoami_1.png" alt="Bayer Dev React2Shell Vulnerability 3" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_react2shell_whoami_2.png" alt="Bayer Dev React2Shell Vulnerability 4" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">To my shock, the result showed that the application was running as <code>root</code>. This is a critical finding. Running as <code>root</code> means full system privileges. At that moment, I knew I had identified a critical vulnerability. To avoid causing any disruption or damage, I immediately stopped further command execution.</p> 

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_signin_modal.png" alt="Bayer Dev Default Page Load" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Returning to the web application interface, the default page displayed a sign in modal that appeared automatically on page load. Clicking Sign in redirected me to a login page intended for Bayer employees.</p>

<img src="/assets/ethicalhacking/bayerdevrce/bayer_signin_screen.png" alt="Bayer Dev Sign In Page" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Since I am not an employee, I obviously had no valid credentials. I returned to the previous page and tried clicking Cancel on the sign in modal, but it did not work. I remained stuck behind the modal.</p>

<p class="lead mb-4">Then I had a simple idea. What if I bypassed the sign in modal entirely by modifying the URL? The current URL was <code>redacted.bayer.com/tenants</code>. I removed the <code>/tenants</code> portion to see what would happen. The application redirected me to what appeared to be the main homepage, although the URL still contained <code>/tenants</code>. Despite that, the sign in modal was no longer blocking my access.</p>

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_signin_modal_bypassed_homepage.png" alt="Bayer Dev Sign In Modal Bypassed Homepage" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">I explored the page and clicked Select on the Bayer Test tenant. The dashboard for that tenant loaded successfully.</p>

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_bayer_tenant_dashboard.png" alt="Bayer Dev Tenant Dashboard" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">At this point, I had full access to Bayer's internal dashboard for the test tenant without authentication. I carefully explored the available functionalities to understand the scope of access. I discovered that I could view and modify device settings, which is a serious security concern.</p>

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_organisations.png" alt="Bayer Dev Organizations" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Under the Organizations tab, I could create a new organization, edit existing ones, and even delete them. These privileges should be strictly restricted to authorized personnel. However, due to the authentication bypass, I could access these features without proper authorization. The DSO tab displayed DSO cycles.</p>

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_dso_cycles.png" alt="Bayer Dev DSO Cycles" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">The Talent tab revealed names and email addresses of employees associated with the project. This was a significant privacy issue. In my screenshots, I redacted all employee names and email addresses, except for the CEO's name, since that information is publicly available.</p>

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_tenant_defaultpeople.png" alt="Bayer Dev Talent" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
    
<p class="lead mb-4">The Assets tab displayed a list of all assets within the tenant. The combination of remote command execution as root and unauthenticated access to internal administrative functionality made this an extremely severe finding.</p>

<img src="/assets/ethicalhacking/bayerdevrce/dsocockpit_assets.png" alt="Bayer Dev Assets" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">In my experience, vulnerability research is strangely unpredictable. Some days require intense effort and concentration to find even a minor issue. Other days, you unexpectedly discover a critical vulnerability almost by accident. In this case, it took me less than six hours from the moment I decided to start hunting on Bayer, to gaining root command execution in their internal development environment, and finally writing a responsible disclosure email to their cybersecurity team.</p>

<p class="lead mb-4">The next day, I received a confirmation email from Bayer's cybersecurity team. Given the critical severity of the issue, it was not surprising that they quickly acknowledged the report and escalated it to the appropriate team for remediation.</p>

<img src="/assets/ethicalhacking/bayerdevrce/cvd_email_reply_1.png" alt="Bayer Dev CVD Email Reply 1" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Several weeks later, on Friday evening, 13 February 2026, I received another email informing me that the vulnerability had been fixed. They also offered to include my name on Bayer's Coordinated Vulnerability Disclosure Hall of Fame page. I gladly accepted and provided the required details.</p>

<img src="/assets/ethicalhacking/bayerdevrce/cvd_email_reply_2.png" alt="Bayer Dev CVD Email Reply 2" class="img-fluid rounded mb-4" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="lead mb-4">Once <a href="https://www.bayer.com/en/cybersecurity-hall-of-fame#:~:text=Aaron%20Amran%20Bin%20Amiruddin%20(%40aaronamran)" target="_blank" rel="noopener noreferrer" style="display:inline-block;">Bayer publicly acknowledged my contribution</a>, I finalized and published this blog post on 12 June 2026, following a long wait for the official listing.</p>


<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>