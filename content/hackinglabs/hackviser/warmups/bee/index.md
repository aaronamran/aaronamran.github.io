---
title: 'Bee'
date: '2026-02-18'
excerpt: 'Practice how to discover and exploit SQL Injection and File Upload vulnerabilities.'
prog: 'Hackviser Warmup Stage 2  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Bee</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 2</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing how to exploit the SQL Injection vulnerability, which causes database exploits, and the File Upload vulnerability, which causes malicious files to be uploaded to the server.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which port(s) are open?</p>
<p class="mb-3">Run a Nmap scan on the target IP using <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image1.png" alt="Bee Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 80, 3306</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> Which domain did you add to the hosts file to login to the site?</p>
<p class="mb-3">Since port 80 is open, we can access the web server using a browser.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image2.png" alt="Bee Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Clicking Login shows the following. To access the login page, we need to add an entry to the hosts file of our machine.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image3.png" alt="Bee Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Use the command <code>echo "[target IP] dashboard.innovifyai.hackviser" >> /etc/hosts</code>, then use <code>cat /etc/hosts</code> to verify the entry.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image4.png" alt="Bee Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> dashboard.innovifyai.hackviser</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> With which vulnerability did you bypass the login panel?</p>
<p class="mb-3">Now that the login page is accessible, try using SQL injection payloads such as <code>', ", # or --</code> in the password field. However the following error message is displayed.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image5.png" alt="Bee Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now let's try SQL Injection payloads in the email field. However, we cannot write and send these payloads to the email field, as it only accepts email. The reason for this is that the related input is given type as HTML attribute. We can change this. In order to write what we want in the email field, we need to right click on the page, click inspect page, find the relevant input tag and delete the type="email" attribute.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image6.png" alt="Bee Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">An SQL injection vulnerability is detected as seen below.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image7.png" alt="Bee Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> SQL injection</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What is the name and extension of the page containing user settings in the panel that you accessed by bypassing login?</p>
<p class="mb-3">Knowing that SQL injection is possible, we can use the payload <code>' or 1=1#</code> in the email field which was modified to bypass the login, which successfully bypasses the login panel and allows us to access the admin panel.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image8.png" alt="Bee Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">The SQL code that runs when login on the backend side, as we gave at the very beginning of this article, is probably as follows.</p>
<p class="mb-3"><code>$sql = "SELECT * FROM users WHERE username = ".$_POST['username']." AND password = ".$_POST['password'].";</code></p>
<p class="mb-3">Now let's see what happens when we place the payload we sent into this code.</p>
<p class="mb-3"><code>$sql = "SELECT * FROM users WHERE username ''or 1=1#' AND password ='test';</code></p>
<p class="mb-3">When we examine the possible backend code after adding our SQL Injection payload, we see that this query always returns <code>TRUE</code>. Because the expression <code>or 1=1</code> always returns <code>TRUE</code>. And because of the <code>#</code> character we use in the sequel, the rest of the query is put in the commentline. Therefore, password checking is disabled.</p>
<p class="mb-3">Back to this task, after some browsing around, it is discovered that the page containing the user settings is <code>settings.php</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image9.png" alt="Bee Image 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async"> 
<p class="mb-5"><strong>Answer:</strong> settings.php</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the id of the user you get shell on the machine with file upload vulnerability?</p>
<p class="mb-3">From <code>settings.php</code> page, we see there is a photo upload area. This feature could be exploited to upload a malicious file and gain shell access. For testing purposes, simply uploading a text file instead of an image can help verify the functionality.</p>
<p class="mb-3">We can create a simple webshell that allows us to execute commands on the server with the following payload: <code>&lt;?php system($_GET['cmd']); ?&gt;</code></p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image10.png" alt="Bee Image 10" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">From the upload file feature, browse and select our webshell.php file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image11.png" alt="Bee Image 11" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now that the webshell has been uploaded, navigate to <code>http://dashboard.innovifyai.hackviser/uploads/webshell.php?cmd=id</code> to see the user ID of the webshell.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image12.png" alt="Bee Image 12" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 33</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> What is the MySQL password?</p>
<p class="mb-3">To find the MySQL password, we can utilize the webshell we uploaded earlier. By executing the command <code>cat ../db_connect.php</code>, we obtain the following output.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image13.png" alt="Bee Image 13" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">However, it does not show us the password directly. A trick to view the password is to press <code>Ctrl + U</code> to view the page source.</p>
<img src="/assets/hackinglabs/hackviser/warmups/bee/bee_hackviser_image14.png" alt="Bee Image 14" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">From the output, we can see that the MySQL password is <code>Root.123!hackviser</code>.</p>
<p class="mb-5"><strong>Answer:</strong> Root.123!hackviser</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>