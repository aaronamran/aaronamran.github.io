---
title: 'HackTrace'
date: '2026-07-01'
excerpt: 'Basic - Forensics'
prog: 'Hackviser Scenarios -  July 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">HackTrace</h1>
<div class="writeup-date">July 2026 &middot; Scenarios</div>
</div>
</div>
<p class="lead mb-4">As an employee of Intrusion Insight Inc., conduct a comprehensive analysis on a client's website server that has been attacked to identify security breaches, potential vulnerabilities, and the source of the attack.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the IP address of the attacker who targeted the website?</p>
<p class="mb-3">In the Linux terminal, we navigate to <code>/var/log/apache2/</code>. Reading <code>access.log</code> shows us the source IP address of the attacker.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/hacktrace/hacktrace_hackviser_image1.png" alt="HackTrace 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 10.0.0.41</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What tool did the attacker use for directory scanning?</p>
<p class="mb-3">We can also find this in the <code>access.log</code> file.</p>
<p class="mb-5"><strong>Answer:</strong> Gobuster</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What is the name of the file uploaded by the attacker to the system that allows remote computer access via the web?</p>
<p class="mb-3">Since we want to focus on the file being uploaded which uses a HTTP POST request, we need to filter the logs using the keyword 'POST'. This can be done using <code>cat access.log | grep POST</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/hacktrace/hacktrace_hackviser_image2.png" alt="HackTrace 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> shell.php</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> Which function in the software is responsible for the file upload vulnerability?</p>
<p class="mb-3">Knowing that web application code is stored in the <code>/var/www/html/</code> directory, we navigate to there and list out the contents.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/hacktrace/hacktrace_hackviser_image3.png" alt="HackTrace 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Here we notice the file named <code>upload.php</code> and reading it reveals the function name we need.</p>
<p class="mb-5"><strong>Answer:</strong> uploadFile</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> Which important file has the attacker stolen from the system by compressing it into a zip file?</p>
<p class="mb-3">In the directory we are currently in, notice there is a suspicious file named <code>xdfds.sh</code>. Reading it reveals some useful information we need.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/hacktrace/hacktrace_hackviser_image4.png" alt="HackTrace 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 2023-resumes.zip</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Which domain did the attacker use to upload the data they accessed?</p>
<p class="mb-3">We can also obtain the answer needed from the file read in the previous question.</p>
<p class="mb-5"><strong>Answer:</strong> dataprocessingframework.hv</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">July 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>