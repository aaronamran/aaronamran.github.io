---
title: "RedTiger's Hackit"
date: '2026-05-31'
excerpt: 'Test knowledge in PHP / SQL security.'
prog: "RedTiger's Hackit"
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">RedTiger's</div>
<h1 class="writeup-title">Hackit</h1>
<div class="writeup-date">May 2026</div>
</div>
</div>
<p class="lead mb-4">This is a walkthrough of the <a href="https://redtiger.labs.overthewire.org/" target="_blank" referrerpolicy="no-referrer">RedTiger's Hackit challenges on OverTheWire</a>.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Level 1:</strong> Simple SQL-Injection</p>
<p class="mb-3">We see the following page. Notice the URL parameter <code>cat=1</code> which we will be targeting.</p>
<img src="/assets/hackinglabs/overthewire/redtigershackit/redtigershackit_overthewire_image1.png" alt="Hackit 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We start off with determining the database structure by enumerating the columns with <code>ORDER BY</code>. We start off using the payload <code>?cat=1 order by 2</code>, then increase until we reach <code>?cat=1 order by 5</code>, which we will receive a result saying "This category does not exist!".</p>
<img src="/assets/hackinglabs/overthewire/redtigershackit/redtigershackit_overthewire_image2.png" alt="Hackit 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">This means we now know the database has 4 columns, which helps us in crafting a successful <code>UNION</code> injection. Next, we need to know where the web page actually displays those columns on the screen so we know where our stolen data will appear. We use this payload <code>?cat=0 union select 1,2,3,4 from level1_users</code>. We change category ID from <code>1</code> to <code>0</code>. Since category 0 does not exist, the original query returns zero results. This forces the web application to clear the screen and display only the results of our injected <code>UNION</code> statement. Upon page load, the numbers 3 and 4 appear on the screen, while 1 and 2 are hidden. This proves that columns 3 and 4 are reflective injection points. Anything we select in those positions will be rendered directly to the web page.</p>
<img src="/assets/hackinglabs/overthewire/redtigershackit/redtigershackit_overthewire_image3.png" alt="Hackit 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Now we can retrieve the credentials by replacing our placeholder numbers 3 and 4 with the actual database columns we want to read from <code>level1_users</code>. We use this payload: <code>?cat=0 union select 1,2,username,password from level1_users</code>.</p>
<img src="/assets/hackinglabs/overthewire/redtigershackit/redtigershackit_overthewire_image4.png" alt="Hackit 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Login Username:</strong> Hornoxe</p>
<p class="mb-5"><strong>Login Password:</strong> thatwaseasy</p>
<p class="mb-5"><strong>Flag:</strong> 27cbddc803ecde822d87a7e8639f9315</p>
<p class="mb-5"><strong>Level 2 Password:</strong> passwords_will_change_over_time_let_us_do_a_shitty_rhyme</p>
<br />

<p class="mb-2"><strong>Level 2:</strong> Simple Login Bypass</p>
<p class="mb-3">We see the following page. We will be targeting both the Username and Password input fields.</p>
<img src="/assets/hackinglabs/overthewire/redtigershackit/redtigershackit_overthewire_image5.png" alt="Hackit 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We use the payload <code>a' or 1=1#</code> for both username and password. This grants us access and we get the flag and password for Level 3.</p>
<img src="/assets/hackinglabs/overthewire/redtigershackit/redtigershackit_overthewire_image6.png" alt="Hackit 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Flag:</strong> 1222e2d4ad5da677efb188550528bfaa</p>
<p class="mb-5"><strong>Level 3 Password:</strong> feed_the_cat_who_eats_your_bread</p>
<br />


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>