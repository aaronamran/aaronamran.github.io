---
title: 'Mount'
date: '2026-02-14'
excerpt: 'Practice basics of Network File Sharing (NFS).'
prog: 'Hackviser Warmup Stage 1  -  Feb 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/warmups/mount/mount_hackviser_logo.png" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Mount</h1>
<div class="writeup-date">February 2026 &middot; Warmup Stage 1</div>
</div>
</div>
<p class="lead mb-4">This writeup focuses on practicing basics of Network File Sharing (NFS). NFS is a protocol that allows computers to share files from their file systems over a network.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> What is the name of the service running on port 2049?</p>
<p class="mb-3">Use nmap to scan the target machine and identify open ports with <code>nmap -sC -sV -A [target IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/warmups/mount/mount_hackviser_image1.png" alt="Mount 1" class="img-fluid mb-3" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> nfs</p>
<br />

<p class="mb-2"><strong>Question 2:</strong> What does NFS stands for?</p>
<p class="mb-5"><strong>Answer:</strong> Network File Sharing</p>
<br />

<p class="mb-2"><strong>Question 3:</strong> What is the command used to view shared NFS exports on remote computers?</p>
<img src="/assets/hackinglabs/hackviser/warmups/mount/mount_hackviser_image2.png" alt="Mount 2" class="img-fluid mb-3" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> showmount</p>
<br />

<p class="mb-2"><strong>Question 4:</strong> What is the path to the directory that the target machine shares with NFS?</p>
<p class="mb-5"><strong>Answer:</strong> /root</p>
<br />

<p class="mb-2"><strong>Question 5:</strong> What is the command used to mount NFS exports to the computer?</p>
<p class="mb-5"><strong>Answer:</strong> mount</p>
<br />

<p class="mb-2"><strong>Question 6:</strong> What is the password saved in the a file in the directory you mounted?</p>
<p class="mb-3">First create a folder using <code>mkdir /mnt/nfs_mount</code> to mount the NFS export. Then mount the NFS export using <code>mount -t nfs [target IP]:/root /mnt/nfs_mount</code> and navigate to the mounted directory.</p>
<img src="/assets/hackinglabs/hackviser/warmups/mount/mount_hackviser_image3.png" alt="Mount 3" class="img-fluid mb-3" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> yrt1-pa6Y-cxTF-4vak</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">February 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>