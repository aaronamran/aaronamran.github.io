---
title: 'Reconnaissance'
category: 'Offensive Cybersecurity'
---


<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Knowledge</div>
<h1 class="writeup-title"><strong>Reconnaissance</strong></h1>
</div>
</div>

<br />


## 1. Understanding Your Target {#ch1-understanding-your-target}

<br />

### 1.1 Target Scope {#ch1.1-target-scope}

<p class="lead mb-4">Read the program's rules carefully, not just the asset list, but the fine print.</p>
<li>What is out of scope?</li>
<li>What vulnerability types do they exclude?</li>
<li>What are the rules of engagement?</li>
<br />

<p class="lead mb-4">Do a quick research about the company.</p>
<li>What is their main business purpose? (Translates to type of technology stack they might use)</li>
<li>How big is the company? (Larger companies tend to have bigger surface areas for targeting, but might also have more secure digital assets)</li>
<li>Where is the company located? Check the location on Google Maps.</li>
<li>Is the company currently facing business financial loss? (Financial loss might mean a chance of weaker security funding)</li>
<li>Check if the company has social media accounts (LinkedIn, Facebook, X, Instagram, YouTube)</li>
<li>Check if the company has official code repository accounts (GitHub, GitLab). See what repositories are publicly available.</li>
<li>Who works at the company? (Understand the types of roles the current employees are having by checking on LinkedIn)</li>
<li>What job openings does the company currently have?</li>
<li>If they are looking to hire software developers or infrastructure engineers, what technology stack did they specifically mention? A company that hires people for internal purposes instead of being a Managed Services Provider (MSP) tends to indirectly leak their technology stack in the job postings.</li>
<br />

<p class="lead mb-4">Browse like a normal user.</p>
<li>Visit the homepage of the company.</li>
<li>Use Wappalyzer to see what technology stack they are currently using.</li>
<li>Understand what other pages or routes the company websites have.</li>
<li>If the company allows registering a user account, use a burner testing email to register. Once logged in, compare the differences in accessible features between a pre-auth user and post-auth user.</li>
<br />

<p class="lead mb-4">Check for company acquisitions or separate offices. Every acquisition counts as an extended attack surface, unless explicitly excluded from the target scope. Here are some recommended tools:</p>
<li><a href="https://en.wikipedia.org/wiki/" target="_blank" rel="noopener noreferer">Wikipedia</a> (unsurprisingly)</li>
<li><a href="https://chatgpt.com/g/g-3GwxLih5t-arcanum-acquisition-and-recon-bot" target="_blank" rel="noopener noreferer">Arcanum</a> by Jason Haddix</li>
<br />

<p class="lead mb-4">The information collected can be fed to an LLM to craft a convincing phishing email.</p>
<br />


## 2 Attack Surface Expansion {#ch2-attack-surface-expansion}

<br />

### 2.1 ASN > CIDRs > IPs {#ch2.1-asn-cidrs-ips}


### 2.2 TLS/SSL Certificates {#ch2.2-tls-ssl-certificates}


### 2.3 Automation {#ch2.3-automation}






## 3 Network and Services {#ch3-network-and-services}

shodan, fofa, censys

<br />




## 4 Subdomains {#ch4-subdomains}

### 4.1 More About Subdomains {#ch4.1-more-about-subdomains}


### 4.2 Virtual Hosting vs. Subdomain Enumeration {#4.2-virtual-hosting-vs-subdomain-enumeration}




## 5 Information Disclosure {#ch5-information-disclosure}

### 5.1 Sensitive Documents 

google dorking, bing, baidu

### 5.2 JavaScript Recon 

code repositories

client-side javascript

browser extensions




<br />




<p class="mb-4">Reference:</p>
<li><a href="https://medium.com/@NeM0x00/the-art-of-knowing-everything-before-you-hack-anything-part-1-14fad1e575f3" target="blank" referer="noopener noreferer">https://medium.com/@NeM0x00/the-art-of-knowing-everything-before-you-hack-anything-part-1-14fad1e575f3</a></li>
<li><a href="https://medium.com/@NeM0x00/the-art-of-knowing-everything-before-you-hack-anything-part-2-adba92f68281" target="blank" referer="noopener noreferer">https://medium.com/@NeM0x00/the-art-of-knowing-everything-before-you-hack-anything-part-2-adba92f68281</a></li>
<li><a href="https://freedium-mirror.cfd/medium.com/@kosanamharish232242/the-recon-playbook-every-hacker-uses-but-no-one-talks-about-b-4c4e0477fa5d" target="blank" referer="noopener noreferer">https://freedium-mirror.cfd/medium.com/@kosanamharish232242/the-recon-playbook-every-hacker-uses-but-no-one-talks-about-b-4c4e0477fa5d</a></li>
<li><a href="https://freedium-mirror.cfd/cybersecuritywriteups.com/recon-playbook-practical-guide-for-bug-bounty-hunters-2025-d13f6f014221" target="blank" referer="noopener noreferer">https://freedium-mirror.cfd/cybersecuritywriteups.com/recon-playbook-practical-guide-for-bug-bounty-hunters-2025-d13f6f014221</a></li>


<br />


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">August 2026</p>
</section>
<br />
<div class="writeup-nav">
</div>

</div>


