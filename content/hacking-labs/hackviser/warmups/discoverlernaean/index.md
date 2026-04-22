---
title: 'Discover Lernaean'
date: '2026-02-16'
excerpt: 'Practice how to discover and exploit security vulnerabilities on web servers and SSH protocols.'
prog: 'Hackviser Warmup Stage 2  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Discover Lernaean</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 2</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing how to discover and exploit security vulnerabilities on web servers and SSH protocols and teaching how to perform directory scanning on Apache and SSH services, brute-force attacks and how to chain exploit common application vulnerabilities.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which port(s) are open?</p>
<p class="mb-3">Run a Nmap scan on the target IP using <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image1.png" alt="Discover Lernaean Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 22, 80</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What is the version of the service running on port 80?</p>
<p class="mb-5"><strong>Answer:</strong> Apache httpd 2.4.56 ((Debian))</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is the name of the directory you found using the directory scanner tool?</p>
<p class="mb-3">Use a directory scanning tool like Gobuster to scan for directories on the web server. Run <code>gobuster dir -u [target IP] -t 50 -w /usr/share/seclists/Discovery/Web-Content/directory-list-1.0.txt</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image2.png" alt="Discover Lernaean Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">The directory found is <code>/filemanager</code>. Opening it in the browser displays the following.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image3.png" alt="Discover Lernaean Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> /filemanager</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What's the username:password you use to login to filemanager?</p>
<p class="mb-3">To find the login credentials, we have to do a Google search for default credentials of the filemanager application.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image4.png" alt="Discover Lernaean Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Opening the GitHub repository of Tiny File Manager by prasathmani and reading the README file, we can find the default credentials for the application.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image5.png" alt="Discover Lernaean Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> user:12345</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the last username added to the computer?</p>
<p class="mb-3">Now that we are logged in, we can see the available files of the web server.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image6.png" alt="Discover Lernaean Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Navigate to <code>/etc/passwd</code>, and scroll to the bottom to find the last user added.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image7.png" alt="Discover Lernaean Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> rock</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> What is the password of user rock?</p>
<p class="mb-3">To find the password of user rock and knowing that the web server has port 22 open, we can bruteforce the SSH login using Hydra.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image8.png" alt="Discover Lernaean Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 7777777</p>
<br />

<p class="mb-2"><strong>Question 7:</strong> What is the first command executed by user rock?</p>
<p class="mb-3">After successfully logging in to the server via SSH using <code>ssh rock@[target IP]</code>, the history of commands can be checked using <code>history</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/discoverlernaean/discoverlernaean_hackviser_image9.png" alt="Discover Lernaean Image 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> cat .bash_history</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>