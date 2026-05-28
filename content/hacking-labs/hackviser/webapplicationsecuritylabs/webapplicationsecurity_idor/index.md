---
title: 'Insecure Direct Object Reference (IDOR)'
date: '2026-03-01'
excerpt: 'Practice Insecure Direct Object Reference (IDOR) attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Insecure Direct Object References (IDOR)</h1>
<div class="writeup-date">March 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice insecure direct object references (IDOR) attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Invoices</strong></h5>
<p class="mb-3">This lab contains an Insecure Direct Object References (IDOR) vulnerability that allows unauthorized access to other customers' invoices. To complete this lab, access other customers' invoices by changing the "invoice_id" value in the URL and find the invoice for the customer named "Emilia Rawne". What is the email address of the customer named Emilia Rawne?</p>
<p class="mb-3">Upon page load, we see the following functionality.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image1.png" alt="Web Application Security IDOR 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Viewing the invoice opens the PDF file. Notice the URL has the parameter <code>invoice_id=1001</code> which is vulnerable to IDOR attacks.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image2.png" alt="Web Application Security IDOR 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class=mb-3>After a while of manually decreasing and increasing the invoice ID parameter with a step of 1, we finally reach Emilia Rawne's invoice.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image3.png" alt="Web Application Security IDOR 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> rawneelia@securemail.hv</p>
<br />

<h5 class="mb-2"><strong>2. Ticket Sales</strong></h5>
<p class="mb-3">This lab contains an Insecure Direct Object References (IDOR) vulnerability that causes a product to be offered at a lower price. Your starting balance will not be enough to purchase tickets. To complete the lab, purchase tickets by manipulating the price sent to the server during ticket purchase. What is the order id that appears after the ticket is purchased?</p>
<p class="mb-3">The page shows a ticket purchase system.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image4.png" alt="Web Application Security IDOR 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To understand what parameters are used, just enter the number of tickets as 1 and click purchase. We will receive an error stating that our current money is not enough. Open DevTools, and copy the HTTP POST request sent for this transaction as fetch, and paste it in the console. Then adjust the parameters <code>amount=1</code> and <code>ticket_money=300</code>. Change the <code>ticket_money</code> value to 50 and press enter. This will send a new HTTP POST request.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image5.png" alt="Web Application Security IDOR 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class=mb-3>Then check the new request in Network tab and Preview the HTTP Response. It will display new information indicating the ticket purchase was successful.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image6.png" alt="Web Application Security IDOR 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 65274efc95282d0cc</p>
<br />

<h5 class="mb-2"><strong>3. Change Password</strong></h5>
<p class="mb-3">This lab contains an Insecure Direct Object References (IDOR) vulnerability that leads to unauthorized password change of other users. To complete the lab, change the password of user "admin" by exploiting the IDOR vulnerability in the password change endpoint and log in to his account. What is the phone number of user "admin"? (Answer Format: 000-000-0000)</p>
<p class="mb-3">We see a login page with credentials for a test account given.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image7.png" alt="Web Application Security IDOR 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Once we login as test, we change the password to test1. In the Network tab, we search for this HTTP POST request, copy as fetch, and paste it into the console. Notice there is a <code>password</code> parameter containing <code>test1</code> and a <code>user_id</code> parameter containing <code>2</code>. Usually admin accounts would be the first user created in a system, so their user ID would be a 1 or a 0. We put change the <code>user_id</code> parameter value to 1 and press enter.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image8.png" alt="Web Application Security IDOR 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class=mb-3>Now we logout as test user, and attempt a login as admin with password test1. This actually works, which proves our theory was right.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image9.png" alt="Web Application Security IDOR 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 876-987-8489</p>
<br />

<h5 class="mb-2"><strong>4. Money Transfer</strong></h5>
<p class="mb-3">This lab contains an Insecure Direct Object References (IDOR) vulnerability that allows you to transfer money from another user's account. To complete the lab, transfer money from user "User 2" to your own account ("User 1") by exploiting the IDOR vulnerability in the endpoint performing the money transfer. What is the transfer ID that appears when money arrives in the user account?</p>
<p class="mb-3">The page shows a money transfer web application.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image10.png" alt="Web Application Security IDOR 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Since we are logged in as User 1, we want to find a way to send money from User 2's account to our account. Our first step is to identify what parameters are involved in a financial transaction. So we attempt to send money of a feasible amount to ourselves. This will send a HTTP POST request which we need to find in Network tab, and we copy this as fetch and paste into the console. This allows us to see the parameters <code>transfer_amount=50&recipient_id=1&sender_id=1</code>. Now we update the parameters to <code>sender_id=2</code> and hit enter.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image11.png" alt="Web Application Security IDOR 11" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class=mb-3>In the Network tab, we look for a new HTTP response indicating our attempt was a success. When we open it in a new tab, we see the following success message being displayed with the transfer ID.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image12.png" alt="Web Application Security IDOR 12" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 5700343fbbd8f6f84</p>
<br />

<h5 class="mb-2"><strong>5. Update Account</strong></h5>
<p class="mb-3">This lab contains an Insecure Direct Object References (IDOR) vulnerability that leads to unauthorized modification of other users' account information. To complete the lab, identify the IDOR vulnerability in the endpoint where you can change the account information of user "Renee Misson". View other users' account information. What is the phone number of user "Renee Misson" (Answer Format: 000-000-0000)</p>
<p class="mb-3">We see a profile update page logged in as Nadia Rennocka.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image13.png" alt="Web Application Security IDOR 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Analysing the page GET request in the Network tab reveals that there is an <code>ID</code> parameter tied to the user's Cookie.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image14.png" alt="Web Application Security IDOR 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class=mb-3>Once we changed the <code>ID</code> value from 1 to 2 and refresh the page, we see that we are now logged in as Darill Deeprose.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image15.png" alt="Web Application Security IDOR 15" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class=mb-3>Increasing the <code>ID</code> by 1 again and refreshing the page now logs us in as Renee Misson, revealing her phone number.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_idor/idor_hackviser_image16.png" alt="Web Application Security IDOR 16" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 151-722-8569</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>