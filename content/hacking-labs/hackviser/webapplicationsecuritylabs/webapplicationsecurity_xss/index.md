---
title: 'Cross-Site Scripting (XSS)'
date: '2026-03-01'
excerpt: 'Practice Cross-Site Scripting (XSS) attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/xss_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Cross-Site Scripting (XSS)</h1>
<div class="writeup-date">March 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Cross-Site Scripting (XSS) attacks in multiple lab exercises.</p>

<h5 class="mb-2">1. Reflected XSS</h5>
<p class="mb-3"><strong>This lab is an example of a Reflected XSS (Cross-Site Scripting) vulnerability. To complete it, you must run a malicious script on the website using the search box on the website. Find a way to trigger XSS via search box.</strong></p>
<p class="mb-3">This lab challenge is straightforward. Try entering the following payload in the search box: <code>&lt;script&gt;alert("Reflected XSS")&lt;/script&gt;</code></p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/reflectedxss_hackviser_image1.png" alt="Web Application Security XSS 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">You should see an alert box with the message "Reflected XSS". This indicates that the script was executed successfully, confirming the presence of the vulnerability.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/reflectedxss_hackviser_image2.png" alt="Web Application Security XSS 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> &lt;script&gt;alert("Reflected XSS")&lt;/script&gt;</p>

<h5 class="mb-2">2. Stored XSS</h5>
<p class="mb-3"><strong>This lab is an example of a Stored XSS (Cross-Site Scripting) vulnerability. The messages you send from the chat screen on the website are saved to the database without being filtered by the server. Find a way to trigger the XSS vulnerability in all users by sending a message.</strong></p>
<p class="mb-3">First we need to login with the given credentials.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_hackviser_image1.png" alt="Web Application Security XSS 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We try entering the following payload in the chat box: <code>&lt;u&gt;XSS here!&lt;script&gt;alert(&quot;Stored XSS&quot;)&lt;/script&gt;&lt;/u&gt;</code></p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_hackviser_image2.png" alt="Web Application Security XSS 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">You should see an alert box with the message "Stored XSS". This indicates that the script was executed successfully, confirming the presence of the vulnerability.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_hackviser_image3.png" alt="Web Application Security XSS 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> &lt;u&gt;XSS here!&lt;script&gt;alert("Stored XSS")&lt;/script&gt;&lt;/u&gt;</p>

<h5 class="mb-2">3. DOM-Based XSS</h5>
<p class="mb-3"><strong>This lab is an example of a DOM-Based XSS (Cross-Site Scripting) vulnerability. A look at the JavaScript code of the calculation form on the website shows that the "height" and "base" parameters received with the URL are written between the "&lt;script&gt;" tags without filtering. Find a way to trigger the XSS vulnerability without disrupting the operation of the website.</strong></p>
<p class="mb-3">The website shows a triangle area calculator. We initially test with height value of 3 and base value of 4.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/dombasedxss_hackviser_image1.png" alt="Web Application Security XSS 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We try entering the height value of 3 and use the following payload in the base input field: <code>4&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</code>. Notice the new information appearing in the output area.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/dombasedxss_hackviser_image2.png" alt="Web Application Security XSS 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Viewing the page source code allows us to analyze how the input is being processed and identify the vulnerability. Notice how the input is directly inserted into the DOM without proper sanitization.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/dombasedxss_hackviser_image3.png" alt="Web Application Security XSS 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We use the following payload to trigger the DOM-Based XSS vulnerability: <code>4; alert("DOM-Based XSS"); //</code>. The variable assignment <code>var base = 4;</code> completes the first statement by assigning 4 to base. But the semicolon acts as a statement terminator, allowing us to inject our own JavaScript code. So we directly include the payload <code>alert("DOM-Based XSS")</code> with it and use the JavaScript comment <code>//</code> to prevent any syntax errors.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/dombasedxss_hackviser_image4.png" alt="Web Application Security XSS 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 4; alert("DOM-Based XSS"); //</p>

<h5 class="mb-2">4. Reflected XSS via HTML Attribute Manipulation</h5>
<p class="mb-3"><strong>This lab is an example that requires the Reflected XSS vulnerability to be triggered from within an HTML Attribute. To complete the lab, the parameter "q" in the URL must be given a payload that escapes through the HTML Attribute "value". Find a way to trigger the XSS vulnerability without disrupting the functioning of the website.</strong></p>
<p class="mb-3">The website shows a search form. We test out with the payload <code>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</code> to see what will happen.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/reflectedxss_htmlmanipulation_hackviser_image1.png" alt="Web Application Security XSS 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Apparently our payload does not trigger because it is being encoded server-side before placing it into the HTML.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/reflectedxss_htmlmanipulation_hackviser_image2.png" alt="Web Application Security XSS 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Let's view the page source code to analyze how the input is being processed. Notice how the payload is placed inside the existing HTML attribute called <code>value="..."</code>. The payload ends up being treated as a literal text.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/reflectedxss_htmlmanipulation_hackviser_image3.png" alt="Web Application Security XSS 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To bypass this, we need to escape from the HTML attribute context. We can use this aggressive payload <code>" autofocus onfocus="alert(document.domain)</code>. <code>autofocus</code> tells the browser to immediately put the cursor inside this search box as soon as the page loads. <code>onfocus</code> triggers the JavaScript the moment the box gets focus. As a result, the alert fires instantly without the user touching anything.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/reflectedxss_htmlmanipulation_hackviser_image4.png" alt="Web Application Security XSS 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> " autofocus onfocus="alert(document.domain)</p>

<h5 class="mb-2">5. Stored XSS in Anchor Href Attribute HTML-Encoded</h5>
<p class="mb-3"><strong>This lab is an example that requires the Stored XSS vulnerability to be triggered from within an HTML Attribute. Find a way to trigger the XSS vulnerability without disrupting the functioning of the website.</strong></p>
<p class="mb-3">The website shows a news submission form. We notice that other submitted news appear at the bottom of the page. There are two input fields; the Title and the URL. For the Title input field, we use a random title such as <code>Click Me</code>, and the URL input field is where we will insert our payload. The payload we use is <code>javascript:alert(document.domain)</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_anchorhref_hackviser_image1.png" alt="Web Application Security XSS 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To understand why the XSS payload works, we need to understand the Anchor <code>href</code> sink. When an input lands inside <code>href</code>, we don't actually need to break out of it using double quotes (<code>"..."</code>). We can use the <code>javascript:</code> pseudo-protocol. Browsers recognize <code>javascript:</code> just like how they recognize <code>http:</code> or <code>https:</code>. Since our lab also mentions that HTML is being encoded, any payload with angle brackets (<code>&lt;...&gt;</code>) will not work.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_anchorhref_hackviser_image2.png" alt="Web Application Security XSS 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> javascript:alert(document.domain)</p>

<h5 class="mb-2">6. Manipulating Images with the HTML Href Attribute</h5>
<p class="mb-3"><strong>This lab is an example that requires the Reflected XSS vulnerability to be triggered from within an HTML Attribute. To complete the lab, the "art" parameter in the URL must be given a payload that escapes through the HTML Attribute "href". Find a way to trigger the XSS vulnerability without disrupting the functioning of the website.</strong></p>
<p class="mb-3">We see that the website is an art gallery showcasing famous artworks. Notice the <code>art</code> parameter in the URL.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/manipulateimages_href_hackviser_image1.png" alt="Web Application Security XSS 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/manipulateimages_href_hackviser_image2.png" alt="Web Application Security XSS 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We try entering the following payload in the URL: <code>javascript:alert(document.domain)</code>. Notice that the payload is not triggered and the image is not loaded because the payload landed as a literal file path in the <code>&lt;img src="..."&gt;</code>. </p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/manipulateimages_href_hackviser_image3.png" alt="Web Application Security XSS 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/manipulateimages_href_hackviser_image4.png" alt="Web Application Security XSS 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Therefore, we need to break out of this attribute and use an event handler that triggers when the image fails to load. For this we will use <code>x" onerror="alert(document.domain)</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/manipulateimages_href_hackviser_image5.png" alt="Web Application Security XSS 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">The reason we use this payload is because we need to intentionally trigger an error since image x does not exist. Since the image fails to load, the <code>onerror</code> event is triggered, executing our JavaScript payload.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/manipulateimages_href_hackviser_image6.png" alt="Web Application Security XSS 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> x" onerror="alert(document.domain)</p>

<h5 class="mb-2">7. Stored XSS via User Agent</h5>
<p class="mb-3"><strong>This lab is an example that requires the Stored XSS vulnerability to be triggered using the User Agent value in the HTTP request header and body. Find a way to trigger the XSS vulnerability without disrupting the functioning of the website.</strong></p>
<p class="mb-3">The website shows logs for last visited User-Agents. Since I am lazy to fire up BurpSuite, I use HackBar installed in Developer Tools. Click Load and we can see the HTTP Request headers on the right side.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_useragent_hackviser_image1.png" alt="Web Application Security XSS 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Checking the page HTML code reveals how the User-Agent value is being reflected.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_useragent_hackviser_image2.png" alt="Web Application Security XSS 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We try entering the following payload in the User-Agent header: <code>&lt;script&gt;alert("User Agent XSS")&lt;/script&gt;</code>. Notice that the payload triggers because the User-Agent value is being directly injected into the HTML without proper sanitization.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_useragent_hackviser_image3.png" alt="Web Application Security XSS 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> &lt;script&gt;alert("User Agent XSS")&lt;/script&gt;</p>

<h5 class="mb-2">8. Stored XSS Vulnerability via Image Upload-Induced</h5>
<p class="mb-3"><strong>This lab is an example that requires the Stored XSS vulnerability to be triggered by the uploaded photo file. Find a way to trigger the XSS vulnerability without disrupting the functioning of the website.</strong></p>
<p class="mb-3">We see a user profile page where we are allowed to upload a profile picture. By manipulating the image file, we can inject a malicious payload.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_imageupload_hackviser_image1.png" alt="Web Application Security XSS 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We try with an SVG image with the following payload:</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_imageupload_hackviser_image2.png" alt="Web Application Security XSS 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">However, SVG image uploads are not allowed. So we need to find another alternative.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_imageupload_hackviser_image3.png" alt="Web Application Security XSS 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We can use a normal image that has no malicious content. First we enable Burp Suite to intercept the request, then we upload the image. We send the POST request to Repeater and modify the filename parameter to the payload <code>&apos;&gt;&quot;&lt;img src=x onerror=alert(&quot;XSS&quot;)&gt;.jpg&apos;</code>.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_imageupload_hackviser_image4.png" alt="Web Application Security XSS 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">After sending the modified request, we can see that the payload is executed when the profile page is loaded. The alert box with the message "XSS" confirms that the XSS vulnerability was successfully triggered.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_xss/storedxss_imageupload_hackviser_image5.png" alt="Web Application Security XSS 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> &apos;&gt;&quot;&lt;img src=x onerror=alert(&quot;XSS&quot;)&gt;.jpg&apos;</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_sqli.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>