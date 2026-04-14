---
title: 'Bandit'
date: '2026-01-01'
excerpt: 'Beginner wargame covering Linux CLI fundamentals  -  file permissions, SSH, redirects, and more.'
prog: 'OverTheWire Wargames'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">OverTheWire</div>
<h1 class="writeup-title">Bandit</h1>
<div class="writeup-date">March 2026</div>
</div>
</div>
<p class="lead mb-4">This is a full walkthrough of the <a href="https://overthewire.org/wargames/bandit/" target="_blank" referrerpolicy="no-referrer">Bandit challenges on OverTheWire</a>. Passwords for levels are not saved automatically. If you do not save them yourself, you will need to start over from bandit0. Passwords also occasionally change. It is recommended to take notes on how to solve each challenge. As levels get more challenging, detailed notes are useful to return to where you left off, reference for later problems, or help others after you’ve completed the challenge.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Level 0:</strong> The goal of this level is for you to log into the game using SSH. The host to which you need to connect is bandit.labs.overthewire.org, on port 2220. The username is bandit0 and the password is bandit0. Once logged in, go to the Level 1 page to find out how to beat Level 1.</p>
<p class="mb-3">Use the following command to connect to the server: <code>ssh bandit0@bandit.labs.overthewire.org -p 2220</code> and use the password <code>bandit0</code>.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image1.png" alt="Bandit Level 0" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> bandit0</p>

<p class="mb-2"><strong>Level 0 to Level 1:</strong> The password for the next level is stored in a file called readme located in the home directory. Use this password to log into bandit1 using SSH. Whenever you find a password for a level, use SSH (on port 2220) to log into that level and continue the game.</p>
<p class="mb-3">Use <code>ls -al</code> to list the files in the home directory, then use <code>cat readme</code> to view the contents of the readme file.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image2.png" alt="Bandit Level 0 to 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> ZjLjTmM6FvvyRnrb2rfNWOZOTa6ip5If</p>

<p class="mb-2"><strong>Level 1 to Level 2:</strong> The password for the next level is stored in a file called - located in the home directory.</p>
<p class="mb-3">Use <code>ls -al</code> to list the files in the home directory, then use <code>cat &lt; -</code> to view the contents of the file.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image3.png" alt="Bandit Level 1 to 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> 263JGJPfgU6LtdEvgfWU1XP5yac29mFx</p>

<p class="mb-2"><strong>Level 2 to Level 3:</strong> The password for the next level is stored in a file called --spaces in this filename-- located in the home directory.</p>
<p class="mb-3">Use <code>ls -al</code> to list the files in the home directory, then use <code>cat &lt; "--spaces in this filename--"</code> to view the contents of the file.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image4.png" alt="Bandit Level 2 to 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> MNk8KNH3Usiio41PRUEoDFPqfxLPlSmx</p>

<p class="mb-2"><strong>Level 3 to Level 4:</strong> The password for the next level is stored in a hidden file in the inhere directory..</p>
<p class="mb-3">Use <code>ls -al</code> to list the files in the home directory, then use <code>cd inhere</code> to navigate to the inhere directory and <code>ls -al</code> to list the hidden files. Use <code>cat &lt; "...Hiding-From-You"</code> to view the contents of the hidden file.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image5.png" alt="Bandit Level 3 to 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> 2WmrDFRmJIq3IPxneAaMGhap0pFhF3NJ</p>

<p class="mb-2"><strong>Level 4 to Level 5:</strong> The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.</p>
<p class="mb-3">Use <code>ls -al</code> to list the files in the home directory, then use <code>cd inhere</code> to navigate to the inhere directory and <code>ls -al</code> to list all the files. We can use <code>for x in {0..9}; do file ./-file0$x; done</code> to identify the file type. Then read the contents of the file which is human readable.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image6.png" alt="Bandit Level 4 to 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> 4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw</p>

<p class="mb-2"><strong>Level 5 to Level 6:</strong> The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties: human-readable, 1033 bytes in size, not executable</p>
<p class="mb-3">Use <code>ls -al</code> to list the files in the home directory, then use <code>cd inhere</code> to navigate to the inhere directory and <code>ls -al</code> to list all the files. Use <code>find -type f -size 1033c ! -executable</code> and <code>ls -laR | grep rw-r | grep 1033</code> to find the correct file. Then read the contents of the file which is human readable.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image7.png" alt="Bandit Level 5 to 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> HWasnPhtq9AVKe0dmk45nxy20cvUa6EG</p>

<p class="mb-2"><strong>Level 6 to Level 7:</strong> The password for the next level is stored somewhere on the server and has all of the following properties: owned by user bandit7, owned by group bandit6, 33 bytes in size</p>
<p class="mb-3">Use <code>find / -user bandit7 -group bandit6 -size 33c 2>/dev/null</code> to find the file containing the password, then read its contents.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image8.png" alt="Bandit Level 6 to 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj</p>

<p class="mb-2"><strong>Level 7 to Level 8:</strong> The password for the next level is stored in the file data.txt next to the word millionth.</p>
<p class="mb-3">Use <code>cat data.txt | grep millionth</code> to find the password.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image9.png" alt="Bandit Level 7 to 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc</p>

<p class="mb-2"><strong>Level 8 to Level 9:</strong> The password for the next level is stored in the file data.txt and is the only line of text that occurs only once.</p>
<p class="mb-3">Use <code>sort data.txt | uniq -u</code> to find the password.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image10.png" alt="Bandit Level 8 to 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> 4CKMh1JI91bUIZZPXDqGanal4xvAg0JM</p>

<p class="mb-2"><strong>Level 9 to Level 10:</strong> The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.</p>
<p class="mb-3">Use <code>strings data.txt | grep ===</code> to find the password.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image11.png" alt="Bandit Level 9 to 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey</p>

<p class="mb-2"><strong>Level 10 to Level 11:</strong> The password for the next level is stored in the file data.txt, which contains base64 encoded data.</p>
<p class="mb-3">Use <code>cat data.txt | base64 --decode</code> to decode the file and find the password.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image12.png" alt="Bandit Level 10 to 11" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr</p>

<p class="mb-2"><strong>Level 11 to Level 12:</strong> The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions.</p>
<p class="mb-3">Use <code>cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'</code> to decode the file and find the password.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image13.png" alt="Bandit Level 11 to 12" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> 7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4</p> 

<p class="mb-2"><strong>Level 12 to Level 13:</strong> The password for the next level is stored in the file data.txt, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work. Use mkdir with a hard to guess directory name. Or better, use the command “mktemp -d”. Then copy the datafile using cp, and rename it using mv (read the manpages!).</p>
<p class="mb-3">First navigate to <code>/tmp</code> and create a directory called tmpdir using <code>mkdir /tmpdir</code>. Then copy data.txt file from the home to the current directory which is <code>/tmp/tmpdir</code> using <code>cp ~/data.txt .</code>. We rename data.txt to hexdump_data. We can confirm that hexdump_data is truly a hexdump file by using <code>cat hexdump_data -n 3</code>. Then to revert hexdump_data to its actual file, we use <code>xxd -r hexdump_data compressed_data</code></p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image14.png" alt="Bandit Level 12 to 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We also noticed that hexdump_data is a gzip file, as stated by its magic number <code>1f8b</code> (for more information, refer to <a href="https://en.wikipedia.org/wiki/List_of_file_signatures#:~:text=1F%208B,GZIP%20compressed%20file" target="_blank" referrerpolicy="no-referrer">this list of file signatures</a>). So the next step is to rename compressed_data to compressed_data.gz and then decompress it using <code>gzip -d compressed_data.gz</code>. Now we use <code>xxd compressed_data</code> to view its contents.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image15.png" alt="Bandit Level 12 to 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We can see that the file is a bzip2 file, as stated by its magic number <code>425a</code>. So we rename compressed_data to compressed_data.bz2 and then decompress it using <code>bzip2 -d compressed_data.bz2</code>. Now we use <code>xxd compressed_data</code> to view its contents. This time we get another gzip file, so we repeat the steps of renaming the file to add its extension. When we use <code>cat compressed_data | head -n 5</code>, we see that it contains a file called data5.bin.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image16.png" alt="Bandit Level 12 to 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">It seems that we now have an archive file. We rename the file to add the .tar extension, and we use <code>tar -xf compressed_data.tar</code>. <code>ls</code> shows that data5.bin has been extracted. We repeat the steps again for data5.bin and now we get data6.bin, which then reveals data8.bin. Using <code>xxd data8.bin</code> shows that data8.bin is a Gzip file.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image17.png" alt="Bandit Level 12 to 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">So we rename data8.bin to add the .gz extension and then decompress it using <code>gzip -d data8.bin.gz</code>. Now we can read the contents of data8.bin to obtain the password.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image18.png" alt="Bandit Level 12 to 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn</p>


<p class="mb-2"><strong>Level 13 to Level 14:</strong> The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level. Look at the commands that logged you into previous bandit levels, and find out how to use the key for this level.</p>
<p class="mb-3">After logging into the server as bandit13 with the previous password, we list out the current directory contents and notice that there is a file called sshkey.private. We copy this to our local machine by using <code>scp -P 2220 bandit13@bandit.labs.overthewire.org:sshkey.private .</code></p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image19.png" alt="Bandit Level 13 to 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then we attempt to ssh to the server as bandit14 using the private key by running <code>ssh -i sshkey.private bandit14@bandit.labs.overthewire.org -p 2220</code> which then returns a message saying permissions 0640 for 'sshkey.private' are too open. So we use <code>chmod 700 sshkey.private</code> and reattempt SSH login to the server.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image20.png" alt="Bandit Level 13 to 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image21.png" alt="Bandit Level 13 to 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">After successful login, we read the contents of bandit14 located in <code>/etc/bandit_pass/</code>.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image22.png" alt="Bandit Level 13 to 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> MU4VWeTyJk8ROof1qqmcBPaLh7lDCPvS</p>

<p class="mb-2"><strong>Level 14 to Level 15:</strong> The password for the next level can be retrieved by submitting the password of the current level to port 30000 on localhost.</p>
<p class="mb-3">While logged in as bandit14, use <code>nc localhost 30000</code> and enter the password of the current level.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image23.png" alt="Bandit Level 14 to 15" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> 8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo</p>

<p class="mb-2"><strong>Level 15 to Level 16:</strong> The password for the next level can be retrieved by submitting the password of the current level to port 30001 on localhost using SSL/TLS encryption.</p>
<p class="mb-3">Helpful note: Getting “DONE”, “RENEGOTIATING” or “KEYUPDATE”? Read the “CONNECTED COMMANDS” section in the manpage.</p>
<p class="mb-3">After logging in as bandit15, use <code>openssl s_client -connect localhost:30001</code> and enter the password of the current level.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image24.png" alt="Bandit Level 15 to 16" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image25.png" alt="Bandit Level 15 to 16" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> kSkvUpMQ7lBYyCM4GBPvCvT1BfWRy0Dx</p>

<p class="mb-2"><strong>Level 16 to Level 17:</strong> The credentials for the next level can be retrieved by submitting the password of the current level to a port on localhost in the range 31000 to 32000. First find out which of these ports have a server listening on them. Then find out which of those speak SSL/TLS and which don’t. There is only 1 server that will give the next credentials, the others will simply send back to you whatever you send to it.</p>
<p class="mb-3">Helpful note: Getting “DONE”, “RENEGOTIATING” or “KEYUPDATE”? Read the “CONNECTED COMMANDS” section in the manpage.</p>
<p class="mb-3">Run <code>nmap -sV localhost -p 31000-32000</code> once logged in as bandit16. There are 2 ports with SSL services.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image26.png" alt="Bandit Level 16 to 17" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We will connect to port 31790 using <code>openssl s_client -ign_eof -connect localhost:31790</code> and input the password of the current level.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image27.png" alt="Bandit Level 16 to 17" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image28.png" alt="Bandit Level 16 to 17" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> (Private SSH key from the previous level)</p>

<p class="mb-2"><strong>Level 17 to Level 18:</strong> There are 2 files in the homedirectory: passwords.old and passwords.new. The password for the next level is in passwords.new and is the only line that has been changed between passwords.old and passwords.new.</p>
<p class="mb-3">NOTE: if you have solved this level and see ‘Byebye!’ when trying to log into bandit18, this is related to the next level, bandit19</p>
<p class="mb-3">To login as bandit17, paste the private SSH key from the previous level into a file and use it with <code>chmod 700 /path/to/private_key</code> and <code>ssh -i /path/to/private_key bandit17@bandit.labs.overthewire.org -p 2220</code></p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image29.png" alt="Bandit Level 17 to 18" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Then use <code>diff passwords.old passwords.new</code> to find the line that has been changed and read the password on that line. Since passwords.new is in second place, the new password is also printed in the second part.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image30.png" alt="Bandit Level 18 to 19" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> x2gLTTjFwMOhQ8oWNbMN362QKxfRqGlO</p>

<p class="mb-2"><strong>Level 18 to Level 19:</strong> The password for the next level is stored in a file readme in the homedirectory. Unfortunately, someone has modified .bashrc to log you out when you log in with SSH.</p>
<p class="mb-3">Our attempt to SSH as bandit18 will result in an immediate logout due to the modified .bashrc file.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image31.png" alt="Bandit Level 19 to 20" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image32.png" alt="Bandit Level 19 to 20" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">The solution is to use a different method to retrieve the password without triggering the logout. This can be achieved by executing a command through SSH. Let's try with <code>ssh bandit18@bandit.labs.overthewire.org -p 2220 ls</code> first.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image33.png" alt="Bandit Level 19 to 20" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Since the command is executed directly, it bypasses the .bashrc logout command. We use the same approach but with <code>cat readme</code> to read the password.</p>
<p class="mb-5"><strong>Password:</strong> cGWpMaKXVwDUNgPAVJbWYuGHVn9zl3j8</p>

<p class="mb-2"><strong>Level 19 to Level 20:</strong> To gain access to the next level, you should use the setuid binary in the homedirectory. Execute it without arguments to find out how to use it. The password for this level can be found in the usual place (/etc/bandit_pass), after you have used the setuid binary.</p>
<p class="mb-3">Check who is the owner of the setuid binary with <code>ls -al</code> and execute it as that user to retrieve the password by using <code>./bandit20-do [command]</code>.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image34.png" alt="Bandit Level 19 to 20" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> 0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO</p>

<p class="mb-2"><strong>Level 20 to Level 21:</strong> There is a setuid binary in the homedirectory that does the following: it makes a connection to localhost on the port you specify as a commandline argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21).</p>
<p class="mb-3">NOTE: Try connecting to your own network daemon to see if it works as you think</p>
<p class="mb-3">Use <code>echo -n '[previous password]' | nc -l -p 1234 &</code> to pipe the password into netcat. The <code>-n</code> flag is to prevent newline characters from being added. <code>&</code> is to let the process run in the background. When we run setuid binary with port 1234, it will connect to our netcat listener and retrieve the password.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image35.png" alt="Bandit Level 20 to 21" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> EeoULMCra2q0dSkYj561DX7s1CpBuOBt</p>

<p class="mb-2"><strong>Level 21 to Level 22:</strong> A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.</p>
<p class="mb-3">We will take a look in the /etc/cron.d/ directory. Since there is a cronjob_bandit22 file, read its contents to understand what command is being executed. The cronjob runs /usr/bin/cronjob_bandit22.sh every minute daily. Taking a look at the bash script reveals that it creates a file in the tmp folder and gives permissions to everyone. It then copies the input of the bandit22 password file into the newly created file. So we can obtain the password for the next level with <code>cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv</code>.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image36.png" alt="Bandit Level 21 to 22" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> tRae0UfB9v0UzbCdn9cY0gQnds9GF58Q</p>

<p class="mb-2"><strong>Level 22 to Level 23:</strong> A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.</p>
<p class="mb-3">NOTE: Looking at shell scripts written by other people is a very useful skill. The script for this level is intentionally made easy to read. If you are having problems understanding what it does, try executing it to see the debug information it prints.</p>
<p class="mb-3">Simmilar like the previous level, we need to read the contents of the shell script executed by the cronjob to understand how to obtain the password for the next level. The script introduces variables. The first variable is 'myname' and saves the output from the <code>whoami</code> command. Because the script will run as bandit23, the <code>whoami</code> command will print 'bandit23'. We only need to substitute $myname with bandit23 and execute it to get the result which will be a filename. Then read the contents of the newly created file.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image37.png" alt="Bandit Level 22 to 23" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> 0Zf11ioIjMVN551jX3CmStKLYqjk54Ga</p>

<p class="mb-2"><strong>Level 23 to Level 24:</strong> A program is running automatically at regular intervals from cron, the time-based job scheduler. Look in /etc/cron.d/ for the configuration and see what command is being executed.</p>
<p class="mb-3">NOTE: This level requires you to create your own first shell-script. This is a very big step and you should be proud of yourself when you beat this level!</p>
<p class="mb-3">NOTE 2: Keep in mind that your shell script is removed once executed, so you may want to keep a copy around…</p>
<p class="mb-3">As usual, we will check the /etc/cron.d/ directory and then check the contents of the shell script executed by the cronjob.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image38.png" alt="Bandit Level 23 to 24" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">The cron script executes and deletes all files in the folder /var/spool/$myname/foo. It runs as the user bandit24. Below is the shell script we will use.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image39.png" alt="Bandit Level 23 to 24" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We then need to give the necessary permissions to the shell script and the password file. Ensure that we copy the script to the correct directory. After a while, reading the contents of the password file returns the password.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image40.png" alt="Bandit Level 23 to 24" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8</p>

<p class="mb-2"><strong>Level 24 to Level 25:</strong> A daemon is listening on port 30002 and will give you the password for bandit25 if given the password for bandit24 and a secret numeric 4-digit pincode. There is no way to retrieve the pincode except by going through all of the 10000 combinations, called brute-forcing. You do not need to create new connections each time.</p>
<p class="mb-3">When we use <code>nc localhost 30002</code> and manually key in the password and the pincode, we can see that we get a response which says we are wrong. So let's create a temporary directory, and store our bruteforce.sh shell script in it. Make the script executable after creating it and run it.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image41.png" alt="Bandit Level 24 to 25" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">The script will run through all the combinations and print the correct password and pincode once it finds the correct combination. Use <code>sort result.txt | grep -v "Wrong!"</code> to filter out the incorrect attempts. The code for the script is shown below.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image42.png" alt="Bandit Level 24 to 25" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> iCi86ttT4KSNe1armKiwbQNmB3YJP3q4</p>

<!-- <p class="mb-2"><strong>Level 25 to Level 26:</strong> Logging in to bandit26 from bandit25 should be fairly easy… The shell for user bandit26 is not /bin/bash, but something else. Find out what it is, how it works and how to break out of it.</p>
<p class="mb-3">NOTE: if you’re a Windows user and typically use Powershell to ssh into bandit: Powershell is known to cause issues with the intended solution to this level. You should use command prompt instead.</p>
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image43.png" alt="Bandit Level 25 to 26" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/overthewire/bandit/bandit_overthewire_image44.png" alt="Bandit Level 25 to 26" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Password:</strong> </p>

<p class="mb-2"><strong>Level 26 to Level 27:</strong> Good job getting a shell! Now hurry and grab the password for bandit27!</p>
<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>

<p class="mb-2"><strong>Level 27 to Level 28:</strong> There is a git repository at ssh://bandit27-git@bandit.labs.overthewire.org/home/bandit27-git/repo via the port 2220. The password for the user bandit27-git is the same as for the user bandit27. From your local machine (not the OverTheWire machine!), clone the repository and find the password for the next level. This needs git installed locally on your machine.</p>
<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>

<p class="mb-2"><strong>Level 28 to Level 29:</strong> There is a git repository at ssh://bandit28-git@bandit.labs.overthewire.org/home/bandit28-git/repo via the port 2220. The password for the user bandit28-git is the same as for the user bandit28. From your local machine (not the OverTheWire machine!), clone the repository and find the password for the next level. This needs git installed locally on your machine.</p>
<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>

<p class="mb-2"><strong>Level 29 to Level 30:</strong> There is a git repository at ssh://bandit29-git@bandit.labs.overthewire.org/home/bandit29-git/repo via the port 2220. The password for the user bandit29-git is the same as for the user bandit29. From your local machine (not the OverTheWire machine!), clone the repository and find the password for the next level. This needs git installed locally on your machine.</p>
<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>

<p class="mb-2"><strong>Level 30 to Level 31:</strong> There is a git repository at ssh://bandit30-git@bandit.labs.overthewire.org/home/bandit30-git/repo via the port 2220. The password for the user bandit30-git is the same as for the user bandit30. From your local machine (not the OverTheWire machine!), clone the repository and find the password for the next level. This needs git installed locally on your machine.</p>
<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>

<p class="mb-2"><strong>Level 31 to Level 32:</strong> There is a git repository at ssh://bandit31-git@bandit.labs.overthewire.org/home/bandit31-git/repo via the port 2220. The password for the user bandit31-git is the same as for the user bandit31. From your local machine (not the OverTheWire machine!), clone the repository and find the password for the next level. This needs git installed locally on your machine.</p>
<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>

<p class="mb-2"><strong>Level 32 to Level 33:</strong> After all this git stuff, it’s time for another escape. Good luck!</p>
<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p>

<p class="mb-2"><strong>Level 33 to Level 34:</strong> There is a setuid binary in the homedirectory that does the following: it makes a connection to localhost on the port you specify as a commandline argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit33). If the password is correct, it will transmit the password for the next level (bandit34).</p>
<p class="mb-3">.</p>
<p class="mb-5"><strong>Password:</strong> </p> -->

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the <a href="/hacking-labs/overthewire/">next Hacking Lab</a>.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>