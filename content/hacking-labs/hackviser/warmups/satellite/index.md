---
title: 'Satellite'
date: '2026-03-20'
excerpt: 'Practice scanning a WordPress website to identify security vulnerabilities and gain access to the system through these vulnerabilities.'
prog: 'Hackviser Warmup Stage 2  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/satellite/satellite_hackviser_logo.png" alt="Satellite logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Satellite</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 2</div>
</div>
</div>
<p class="lead mb-4">WordPress is a popular content management system where users can easily create, edit and manage websites. It is recommended to practice scanning a WordPress website to identify security vulnerabilities and gain access to the system through these vulnerabilities.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the website domain name?</p>
<img src="/assets/hackinglabs/hackviser/warmups/satellite/satellite_hackviser_image1.png" alt="Satellite Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> beyondbound.hv</p>

<p class="mb-2"><strong>Question 2:</strong> Which CMS software is being used?</p>
<p class="mb-5"><strong>Answer:</strong> WordPress</p>

<p class="mb-2"><strong>Question 3:</strong> Which tool can be used for WordPress security scanning?</p>
<p class="mb-5"><strong>Answer:</strong> WPScan</p>

<p class="mb-2"><strong>Question 4:</strong> Which plugin is used on the target website?</p>
<p class="mb-3">To use WPScan to scan the target website, we will use <code>wpscan --enumerate p --url beyondbound.hv --plugins-detection aggressive</code>.</p>	
<img src="/assets/hackinglabs/hackviser/warmups/satellite/satellite_hackviser_image2.png" alt="Satellite Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> wp-file-manager</p>

<p class="mb-2"><strong>Question 5:</strong> What is the version of the plugin used?</p>
<p class="mb-3">Scrolling down on the WPScan output, we can see the version of the plugin.</p>
<img src="/assets/hackinglabs/hackviser/warmups/satellite/satellite_hackviser_image3.png" alt="Satellite Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 6.0</p>

<p class="mb-2"><strong>Question 6:</strong> What is the name of the satellite of unknown status?</p>
<p class="mb-3">To obtain the information required, we need to hack into the target server. We will use <code>msfconsole -q</code> to check for an available exploit in Metasploit Framework.</p>
<img src="/assets/hackinglabs/hackviser/warmups/satellite/satellite_hackviser_image4.png" alt="Satellite Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We can see that there is an available exploit for the wp-file-manager plugin version 6.0, which is the version used on the target website. We will use this exploit to gain access to the target server.</p>
<img src="/assets/hackinglabs/hackviser/warmups/satellite/satellite_hackviser_image5.png" alt="Satellite Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We need to use <code>show options</code> and <code>set RHOSTS beyondbound.hv</code> and <code>set LHOSTS [local IP]</code>. Then we can check and run the exploit. After running the exploit, we can see that we have successfully gained access to the target server. We can then use the <code>ls</code> command to list the files in the current directory.</p>
<img src="/assets/hackinglabs/hackviser/warmups/satellite/satellite_hackviser_image6.png" alt="Satellite Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">After some exploring, we found a file named <code>satellites-2023.csv</code>. Use the <code>cat satellites-2023.csv</code> command to read the contents of the file.</p>
<p class="mb-5"><strong>Answer:</strong> Defender-X</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/superprocess.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>