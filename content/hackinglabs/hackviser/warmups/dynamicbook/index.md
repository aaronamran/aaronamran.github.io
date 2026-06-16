---
title: 'Dynamic Book'
date: '2026-03-01'
excerpt: 'Practice exploiting vulnerabilities in a machine running a misconfigured rsync service to gain access and perform privilege escalation attacks.'
prog: 'Hackviser Warmup Stage 3 -  2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_logo.png" alt="Dynamic Book logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Dynamic Book</h1>
<div class="writeup-date">March 2026 &middot; Warmup Stage 3</div>
</div>
</div>
<p class="lead mb-4">Rsync is a Linux-based service for synchronizing files and directories from one source to another quickly and efficiently. It is ideal for transferring files between both local and remote systems. It is recommended to practice exploiting vulnerabilities in a machine running a misconfigured rsync service to gain access and perform privilege escalation attacks.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which service is running on port 873?</p>
<p class="mb-3">Run <code>nmap -sC -sV -A [target IP]</code> to identify the service running on port 873.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image1.png" alt="Dynamic Book Image 1" class="img-fluid mb-3" />
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image2.png" alt="Dynamic Book Image 2" class="img-fluid mb-3" />
<p class="mb-5"><strong>Answer:</strong> rsync</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What is the purpose of this rsync server?</p>
<p class="mb-3">We can find this by using <code>rsync [target IP]::</code> to list the available modules and their descriptions.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image3.png" alt="Dynamic Book Image 3" class="img-fluid mb-3" />
<p class="mb-5"><strong>Answer:</strong> Backup server</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is the path to the configuration file of the rsync service?</p>
<p class="mb-3">We need to access the contents of <code>/etc/rsyncd.conf</code> to find the configuration details. We can use <code>rsync [target IP]::root</code> to view the root folder shared as we discovered in the previous task.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image4.png" alt="Dynamic Book Image 4" class="img-fluid mb-3" />
<p class="mb-3">Let's download the config file mentioned by using <code>rsync [target IP]::root/rsyncd.conf .</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image5.png" alt="Dynamic Book Image 5" class="img-fluid mb-3" />
<p class="mb-5"><strong>Answer:</strong> /etc/rsyncd.conf</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What uid value is the rsync service configured with?</p>
<p class="mb-3">We can find this by examining the <code>rsyncd.conf</code> file we just downloaded.</p>
<p class="mb-5"><strong>Answer:</strong> 1001</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> Which user owns the uid value for which the rsync service is configured?</p>
<p class="mb-3">Since we have access to the root folder, we can download the <code>/etc/passwd</code> file to find the user associated with the uid 1001 by using <code>rsync [target IP]::root/etc/passwd .</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image6.png" alt="Dynamic Book Image 6" class="img-fluid mb-3" />
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image7.png" alt="Dynamic Book Image 7" class="img-fluid mb-3" />
<p class="mb-5"><strong>Answer:</strong> sasha</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> According to the information in the backup log file, which username was used by the person who tried to connect to SSH with the wrong username?</p>
<p class="mb-3">The root folder also contains the backup directory, which includes the log files. By examining these logs, we can identify the username used in the failed SSH attempt. We can start off with <code>rsync [target IP]::root/backup/ .</code> to check what are its contents, then download the log file once it is discovered.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image8.png" alt="Dynamic Book Image 8" class="img-fluid mb-3" />
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image9.png" alt="Dynamic Book Image 9" class="img-fluid mb-3" />
<p class="mb-3">From the log file, the incorrect username is sasja.</p>
<p class="mb-5"><strong>Answer:</strong> sasja</p>
<br />

<p class="mb-2"><strong>Question 7:</strong> What is the first and last name of the passenger flying from Miami to Las Vegas?</p>
<p class="mb-3">In the backups directory, we can access the database directory. Checking the contents of the database directory and attempting to download the SQL backup file results in an error due to lack of permissions. Our next plan is to escalate privileges. Considering that the rsync runs under the privileges of sasha, we need to test if we can upload files to sasha's home directory.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image10.png" alt="Dynamic Book Image 10" class="img-fluid mb-3" />
<p class="mb-3">Since we are allowed to upload files, our next plan is to generate a ssh file and upload it to gain access to the commands. On our local machine, run <code>ssh-keygen -t rsa</code>. For the prompts such as name and password, just press Enter to leave it empty. Then we need to copy the contents of the id_rsa.pub keys into a file named authorised_keys by using <code>cat /root/.ssh/id_rsa.pub > /root/.ssh/authorized_keys</code>. Then we upload the .ssh folder in the root directory to the target server with <code>rsync -r /root/.ssh/ [target IP]::root/home/sasha/</code></p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image11.png" alt="Dynamic Book Image 11" class="img-fluid mb-3" />
<p class="mb-3">Now we can use SSH to connect to the target server as sasha and access the commands.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image12.png" alt="Dynamic Book Image 12" class="img-fluid mb-3" />
<p class="mb-3">Once we gain access, run <code>sudo -l</code> to list the commands that can be run with sudo privileges.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image13.png" alt="Dynamic Book Image 13" class="img-fluid mb-3" />
<p class="mb-3">We found that the LD_PRELOAD environment variable was set. We also found that we are authorised to run an application called sys_helper with sudo privileges. LD_PRELOAD environment variable allows us to dynamically add a library file while running an application and make that application run this library file as well. Now let's write a simple application for privilege escalation in C programming language, compile it and output it as a library object. Let's create an exploit.c file and copy the following code into it.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image14.png" alt="Dynamic Book Image 14" class="img-fluid mb-3" />
<p class="mb-3">Compile the code in the exploit.c file and output the library object named preload.so to the /tmp directory by running <code>gcc -fPIC -shared -nostartfiles -o /tmp/preload.so exploit.c</code>. Ignore the warnings that appear during compilation. Next, let's escalate privileges to root with <code>sudo LD_PRELOAD=/tmp/preload.so /usr/local/bin/sys_helper</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image15.png" alt="Dynamic Book Image 15" class="img-fluid mb-3" />
<p class="mb-3">Now that we are root, we can access all files and commands on the system. Navigate to <code>/backups/database</code> and filter for Las Vegas (LAS) or MIA (Miami). Then use the flight number obtained to find passenger information flying from Miami to Las Vegas.</p>
<img src="/assets/hackinglabs/hackviser/warmups/dynamicbook/dynamicbook_hackviser_image16.png" alt="Dynamic Book Image 16" class="img-fluid mb-3" />
<p class="mb-5"><strong>Answer:</strong> Gabie Norton</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>