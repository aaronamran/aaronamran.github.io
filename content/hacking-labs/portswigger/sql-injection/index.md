---
title: 'SQL Injection'
date: '2026-03-01'
excerpt: 'Practice SQL Injection (SQLi) attacks in multiple lab exercises.'
prog: 'PortSwigger Web Security Academy - August 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">PortSwigger</div>
<h1 class="writeup-title">SQL Injection</h1>
<div class="writeup-date">August 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice SQL Injection attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. SQL injection vulnerability in WHERE clause allowing retrieval of hidden data</strong></h5>
<p class="mb-3">This lab contains a SQL injection vulnerability in the product category filter. When the user selects a category, the application carries out a SQL query like the following:

```SQL
SELECT * FROM products WHERE category = 'Gifts' AND released = 1
```

To solve the lab, perform a SQL injection attack that causes the application to display one or more unreleased products.</p>
<p class="mb-3">We see the following page.</p>

![SQL Injection 1](/images/sqli_portswigger_image1.png)

<p class="mb-3">Intercept and modify the request that sets the product category filter. Give the value <code>'+OR+1=1--</code> and submit the request. The response now  contains unreleased products.</p>

![SQL Injection 2](/images/sqli_portswigger_image2.png)

<p class="mb-5"><strong>Answer:</strong> '+OR+1=1--</p>
<br />


<h5 class="mb-2"><strong>2. SQL injection vulnerability allowing login bypass</strong></h5>
<p class="mb-3">This lab contains a SQL injection vulnerability in the login function. To solve the lab, perform a SQL injection attack that logs in to the application as the <code>administrator</code> user.</p>
<p class="mb-3">We click on 'My Account' and are given the following login form. Using the login credentials <code>administrator</code>:</code>password</code> does not work.</p>

![SQL Injection 3](/images/sqli_portswigger_image3.png)

<p class="mb-3">Intercepting and modifying the request in Burp Suite and modifying the <code>username</code> parameter by giving it the value <code>administrator'--</code> works.</p> 

![SQL Injection 4](/images/sqli_portswigger_image4.png)

<p class="mb-5"><strong>Answer:</strong> '--</p>
<br />


<h5 class="mb-2"><strong>3. SQL injection attack, querying the database type and version on Oracle</strong></h5>
<p class="mb-3">This lab contains a SQL injection vulnerability in the product category filter. You can use a UNION attack to retrieve the results from an injected query. To solve the lab, display the database version string.</p>
<p class="mb-3">Hint: On Oracle databases, every <code>SELECT</code> statement must specify a table to select <code>FROM</code>. If your <code>UNION SELECT</code> attack does not query from a table, you will still need to include the <code>FROM</code> keyword followed by a valid table name.
There is a built-in table on Oracle called <code>dual</code> which you can use for this purpose. For example: <code>UNION SELECT 'abc' FROM dual</code></p>
<p class="mb-3">In the given web application, we click on a category. Notice the parameter <code>category</code> in the URL.</p>

![SQL Injection 5](/images/sqli_portswigger_image5.png)

<p class="mb-3">Intercept and modify the request in Burp Suite to determine the number of columns that are being returned by the query and which columns contain text data. Trying <code>' order by 1 --</code> and <code>' order by 2 --</code> returns HTTP 200 OK, while <code>' order by 3 --</code> returns HTTP 500 Internal Server Error, which means the column does not exist. Next, we need to determine the data types of the columns by using <code>' UNION SELECT 'a', 'a' from DUAL--</code>, which becomes <code>'+UNION+SELECT+'a',+'a'+from+DUAL--</code> when we URL encode it. <code>DUAL</code> is a special table in Oracle used for evaluating expressions or calling functions. It belongs to the schema of the user <code>SYS</code> and is accessible to all the users. The last step is modifying the <code>category</code> parameter by giving it the value <code>Accessories'+UNION+SELECT+BANNER,+NULL+FROM+v$version--</code> to obtain the database type and version.</p> 

![SQL Injection 6](/images/sqli_portswigger_image6.png)

<p class="mb-5"><strong>Answer:</strong> '+UNION+SELECT+BANNER,+NULL+FROM+v$version--</p>
<br />







<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">August 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>