---
title: 'Query Gate'
date: '2026-02-12'
excerpt: 'Practice basics of MySQL and learning database fundamentals.'
prog: 'Hackviser Warmup Stage 1  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/querygate/querygate_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Query Gate</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 1</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing basics of MySQL and learning database fundamentals. MySQL is a relational database management system (RDBMS) that uses Structured Query Language (SQL) to manage and manipulate data. It's an open-source system widely used for web databases.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which port(s) are open?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/querygate/querygate_hackviser_image1.png" alt="Query Gate 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 3306</p>

<p class="mb-2"><strong>Question 2:</strong> What is the running service name?</p>
<p class="mb-5"><strong>Answer:</strong> mysql</p>

<p class="mb-2"><strong>Question 3:</strong> What is the most privileged username that we can use to connect to MySQL?</p>
<img src="/assets/hackinglabs/hackviser/warmups/querygate/querygate_hackviser_image2.png" alt="Query Gate 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> root</p>

<p class="mb-2"><strong>Question 4:</strong> Which parameter is used to specify the hostname in the command line tool to connect to MySQL running on the target machine?</p>
<p class="mb-3">If MySQL uses port 3306 by default, we do not need to use -P parameter to specify a port number when connecting.</p>
<p class="mb-5"><strong>Answer:</strong> -h</p>

<p class="mb-2"><strong>Question 5:</strong> How many databases are on the MySQL server you are connecting to?</p>
<p class="mb-3">Use <code>SHOW DATABASES;</code> to list available databases.</p>
<img src="/assets/hackinglabs/hackviser/warmups/querygate/querygate_hackviser_image3.png" alt="Query Gate 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 5</p>

<p class="mb-2"><strong>Question 6:</strong> Which command can we select a database?</p>
<p class="mb-5"><strong>Answer:</strong> USE</p>

<p class="mb-2"><strong>Question 7:</strong> What is the name of the table in the detective_inspector database?</p>
<p class="mb-3">Use <code>SHOW TABLES;</code> to list tables in the selected database.</p>
<p class="mb-5"><strong>Answer:</strong> hacker_list</p>

<p class="mb-2"><strong>Question 8:</strong> What's the nickname of the white-hat hacker?</p>
<p class="mb-3">Use <code>SELECT * FROM hacker_list;</code> to view the contents of the table.</p>
<img src="/assets/hackinglabs/hackviser/warmups/querygate/querygate_hackviser_image4.png" alt="Query Gate 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> h4ckv1s3r</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/hackviser/warmups/tiger.html">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>