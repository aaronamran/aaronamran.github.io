---
title: 'Comicstore'
date: '2026-07-01'
excerpt: 'Easy - Web - System'
prog: 'Hackviser Scenarios -  July 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Comicstore</h1>
<div class="writeup-date">July 2026 &middot; Scenarios</div>
</div>
</div>
<p class="lead mb-4">The person who runs a comic store claims to have a rare collection, but engages in misleading behavior. He makes false promises to customers, such as exchanging comics or selling them for cash, which he never fulfills. This behavior raises concerns about the legitimacy of this rare comic book collection. Furthermore, his habit of regularly backing up MP3 files suggests a tech-savvy approach and possibly a sophisticated structure to his fraudulent activities.These allegations should be investigated to confirm the veracity of the rare comic book collection claims and to protect potential victim customers from this scam. Investigate and report back!</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What could be a potential username?</p>
<p class="mb-3">In the Linux terminal, we navigate to <code>/var/log/apache2/</code>. Reading <code>access.log</code> shows us the source IP address of the attacker.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/comicstore/comicstore_hackviser_image1.png" alt="Comicstore 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> johnny</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> Looks like the admin has left a note for himself. What is the password?</p>
<p class="mb-3">To discover this, we first need to run Ffuf against the target by using <code>ffuf -u http://[target_IP]/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -e .txt,.zip,.bak,.mp3 -t 500 -ic</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/comicstore/comicstore_hackviser_image2.png" alt="Comicstore 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We can see that the listed results of the directory contents. Notice there is a <code>_note</code> directory. Opening this in the browser reveals the following:</p>
<img src="/assets/hackinglabs/hackviser/scenarios/comicstore/comicstore_hackviser_image3.png" alt="Comicstore 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Reading <code>securepasswords.txt</code> gives us the SSH password.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/comicstore/comicstore_hackviser_image4.png" alt="Comicstore 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> bl4z3</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> What is the name of the directory where comic books are kept?</p>
<p class="mb-3">We use the previously obtained SSH password to login as <code>johnny</code> into the target server. Exploring in <code>johnny</code>'s home directory and in his Documents directory reveals the directory we need.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/comicstore/comicstore_hackviser_image5.png" alt="Comicstore 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> myc0ll3ct1on</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What is the name of the script that is used for backing up mp3 files?</p>
<p class="mb-3">Running <code>find / -name "*backup*" -type f 2>/dev/null</code> shows us the script used.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/comicstore/comicstore_hackviser_image6.png" alt="Comicstore 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> backup_mp3.sh</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> What is the name of the richest person in the Scamlist.csv file?</p>
<p class="mb-3">Attempting to read <code>scamlist.csv</code> directly or with <code>sudo</code> gives us a 'Permission denied' error. This means we need to escalate our local privileges to root user. However, running <code>sudo -l</code> gives us a massive hint, because it shows us that we can run <code>backup_mp3.sh</code> script as root user without needing a password.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/comicstore/comicstore_hackviser_image7.png" alt="Comicstore 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

```Bash
#!/bin/bash

sudo find / -name "*.mp3" | sudo tee -a /run/media/johnny/BACKUP/backedup.txt

# archive file to keep track of files
input="/run/media/johnny/BACKUP/backedup.txt"

while getopts c: flag; do
  case "${flag}" in
    c) command=${OPTARG};;
  esac
done

backup_files="/home/johnny/Music/song*.mp3"

# backup location
dest="/run/media/johnny/BACKUP"

# archive filename.
hostname=$(hostname -s)
archive_file="$hostname-bak.tar.gz"

# print starting message
echo "Backing up $backup_files to $dest/$archive_file" && echo

# backing up the files
tar czf $dest/$archive_file $backup_files

# print ending message
echo && echo "Backup finished"

cmd=$($command) && echo $cmd
```

<p class="mb-3">The script has a massive security flaw built right into it. It uses <code>getopts</code> to look for a <code>-c</code> flag, takes whatever string we pass to it, and runs it as a command at the very end (<code>cmd=$($command)</code>). Since we can run this script as <code>root</code> using <code>sudo</code>, whatever command we pass to the <code>-c</code> flag will execute with full root privileges. To read the <code>scamlist.csv</code> file, we run the script with <code>sudo</code> and pass the <code>cat</code> command to the <code>-c</code> flag: <code>sudo /opt/.securebak/backup_mp3.sh -c "cat /home/johnny/Documents/myc0ll3ct1on/scamlist.csv"</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/comicstore/comicstore_hackviser_image8.png" alt="Comicstore 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Emily Randolf</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">July 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>