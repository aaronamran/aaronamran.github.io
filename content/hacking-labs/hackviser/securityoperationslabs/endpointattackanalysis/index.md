---
title: 'Endpoint Attack Analysis'
date: '2026-06-15'
excerpt: 'Practice Endpoint Attack Analysis in multiple lab exercises.'
prog: 'Hackviser Security Operations Labs  -  June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Endpoint Attack Analysis</h1>
<div class="writeup-date">June 2026 · Security Operations Labs</div>
</div>
</div>
<p class="lead mb-4">Practice endpoint attack analysis in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Wazuh - LSASS Credential Dumping Analysis</strong></h5>
<p class="mb-3">In Windows systems, lsass.exe (Local Security Authority Subsystem Service) is a critical process that stores user session information and password hashes in memory. Attackers aim to access this memory area to capture credentials. Tools like Mimikatz are the most well-known examples of this technique.

MITRE ATT&CK: T1003.001 - OS Credential Dumping: LSASS Memory

A suspicious access to the lsass.exe process has been detected on the system monitored via Sysmon (Event ID 10).

Analyze the Wazuh logs and identify the full file path of the malicious process (sourceImage) that accessed lsass.exe.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image1.png" alt="Endpoint Attack Analysis 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>lsass.exe</code>, and click the details pop-up button of the first source and search for <code>LSASS</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image2.png" alt="Endpoint Attack Analysis 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> C:\Users\Public\Downloads\payload.exe</p>
<br />


<h5 class="mb-2"><strong>2. Wazuh - Backdoor Analysis with FIM</strong></h5>
<p class="mb-3">File Integrity Monitoring (FIM) is a critical security control for detecting unauthorized changes to system files. Attackers often upload malicious files known as web shells to web directories to gain persistence or execute commands on a compromised system.

MITRE ATT&CK: T1505.003 - Server Software Component: Web Shell

The /var/www/html directory of a Linux server is being monitored in real-time. A file named "backdoor.php" uploaded by the attacker has been detected.

Analyze the FIM events on the Wazuh Dashboard and identify the SHA-256 hash value of this file.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image3.png" alt="Endpoint Attack Analysis 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>backdoor.php</code>, and click the details pop-up button of the source and search for the keyword <code>SHA-256</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image4.png" alt="Endpoint Attack Analysis 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 86b0eea46ef9d06f7bfadbd02632f60828c4eb2cd3de3d47e4e9c0291d532778</p>
<br />


<h5 class="mb-2"><strong>3. Wazuh - System Discovery Analysis</strong></h5>
<p class="mb-3">System discovery covers the reconnaissance commands attackers execute after infiltrating a system to understand the environment and plan deeper access. Seemingly harmless commands such as hostname, uname, and cat /proc/cpuinfo are actually preparations for a further attack.

MITRE ATT&CK: T1082 - System Information Discovery

Suspicious discovery activities executed via the user_test account have been detected on the system.

Analyze the Wazuh logs and identify the command the attacker used to collect CPU information.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image5.png" alt="Endpoint Attack Analysis 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>"T1082" and "lscpu"</code>, and click the details pop-up button of the only source and search for the keyword <code>COMMAND</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image6.png" alt="Endpoint Attack Analysis 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> /usr/bin/lscpu</p>
<br />


<h5 class="mb-2"><strong>4. Wazuh - Indicator Removal Analysis</strong></h5>
<p class="mb-3">Defense evasion covers the techniques attackers use to avoid detection. Attackers can clear their bash history or truncate system log files to erase traces of commands they have executed, significantly complicating the forensic analysis process.

MITRE ATT&CK: T1070 - Indicator Removal on Host

The forensic team noticed that the /var/log/auth.log file on the srv-app-02 server was unexpectedly emptied.

Analyze the Wazuh logs and identify the command the attacker used to clear this file.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image7.png" alt="Endpoint Attack Analysis 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>"/var/log/auth.log" and "srv-app-02"</code>, and click the details pop-up button of the only source and search for the keyword <code>COMMAND</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image8.png" alt="Endpoint Attack Analysis 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> /usr/bin/truncate -s 0 /var/log/auth.log</p>
<br />


<h5 class="mb-2"><strong>5. Wazuh - OS Credential Dumping Analysis</strong></h5>
<p class="mb-3">In Linux systems, the /etc/shadow file is the most critical system file that stores hashed user passwords, accessible only with root privileges. Attackers aim to capture the hash data in this file to perform brute-force attacks or gain passwordless access.

MITRE ATT&CK: T1003.008 - OS Credential Dumping: /etc/passwd and /etc/shadow

A suspicious activity has been detected where an attacker copied the shadow file and exfiltrated the data.

Analyze the Wazuh logs and identify the URL address to which the attacker sent the collected data.

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image9.png" alt="Endpoint Attack Analysis 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>"/etc/passwd" and "/etc/shadow"</code>, and click the details pop-up button of the only source and search for the keyword <code>COMMAND</code>, we see the following information.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image10.png" alt="Endpoint Attack Analysis 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Next, when we search for <code>"exfil_archive.tar.gz"</code>, and click the details pop-up button of the second source and search for the keyword <code>exfil_archive.tar.gz</code>, we get the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image11.png" alt="Endpoint Attack Analysis 11" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> http://data-storage-api.hv/v2/upload</p>
<br />


<h5 class="mb-2"><strong>5. Wazuh - Cron Job Persistence Analysis</strong></h5>
<p class="mb-3">Cron is a scheduling service on Linux systems that enables automatic execution of tasks at specified time intervals. Attackers can manipulate cron tables to regularly execute malicious scripts in order to maintain persistence on a compromised system.

MITRE ATT&CK: T1053.003 - Scheduled Task/Job: Cron

What is the IP address of the command-and-control (C2) server that the malicious script, deployed via the cron job, connects to

You can access the Wazuh Dashboard using the default credentials (admin/admin)</p>
<p class="mb-3"><strong>Steps: </strong>We see the following Wazuh dashboard being loaded.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image12.png" alt="Web Attack Analysis 12" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">When we search for <code>"T1053.003"</code>, and click the details pop-up button of the only source and search for the keyword <code>cron</code>, we get the cron job.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image13.png" alt="Web Attack Analysis 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Since we know that the C2 server deployed the malicious script, we search for <code>"sys-check.sh"</code>. Clicking on the details pop-up button of the last source and searching for an IP address gives us the answer.</p>
<img src="/assets/hackinglabs/hackviser/securityoperationslabs/endpointattackanalysis/endpointattackanalysis_hackviser_image14.png" alt="Web Attack Analysis 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 10.10.10.50</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>