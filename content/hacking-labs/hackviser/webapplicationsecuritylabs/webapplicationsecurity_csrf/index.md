---
title: 'Cross-Site Request Forgery (CSRF)'
date: '2026-06-03'
excerpt: 'Practice Cross-Site Request Forgery (CSRF) attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Cross-Site Request Forgery (CSRF)</h1>
<div class="writeup-date">June 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Cross-Site Request Forgery (CSRF) attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Change Password (CSRF)</strong></h5>
<p class="mb-3">This lab contains a CSRF vulnerability. To complete the lab, create a custom URL with the password change endpoint and submit the link via live support at the bottom right. The support staff will run the link you sent and the password will be changed. Login to the admin user's account with the new password. What is the e-mail address seen when logging into the admin user's account?</p>
<p class="mb-3">The web application shows a login page with test credentials.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_csrf/csrf_hackviser_image1.png" alt="Web Application CSRF 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We choose <code>test123</code> as the new password.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_csrf/csrf_hackviser_image2.png" alt="Web Application CSRF 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Notice that once we change the password, the URL shows the <code>new_password</code> parameter with value <code>test123</code>. We copy this entire URL and paste it into the chat which will be received by the admin user.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_csrf/csrf_hackviser_image3.png" alt="Web Application CSRF 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then we can logout. Attempting login as admin user with the new password we set is proven to be successful.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_csrf/csrf_hackviser_image4.png" alt="Web Application CSRF 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">This vulnerability occurs because the application processes sensitive state-changing actions using a predictable GET request without verifying the request's origin. As a result, when the authenticated admin opens the link, their browser automatically attaches their valid session cookies, allowing the server to process the malicious password change blindly.</p>
<p class="mb-5"><strong>Answer:</strong> stringman@securemail.hv</p>
<br />

<h5 class="mb-2"><strong>2. Money Transfer (CSRF)</strong></h5>
<p class="mb-3">This lab contains a CSRF vulnerability. To complete the lab, create a URL to transfer funds to your account and send the link via live support on the bottom right. The support staff will execute the link you sent and transfer money to your account unintentionally. What is the transfer ID that appears when money arrives in the user account?</p>
<p class="mb-3">We see a money transfer web application.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_csrf/csrf_hackviser_image5.png" alt="Web Application CSRF 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">First we attempt to send 50$ to admin. We need to open the Network tab to keep track of updated HTTP requests, since the current URL will not show the required parameters.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_csrf/csrf_hackviser_image6.png" alt="Web Application CSRF 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We paste the URL into the live support chat but change the value of <code>receiver</code> parameter to user. The transaction ID should appear.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_csrf/csrf_hackviser_image7.png" alt="Web Application CSRF 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> fe96d3dcee84e89cd</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>