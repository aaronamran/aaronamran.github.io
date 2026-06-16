---
title: 'Fundamentals'
date: '2026-06-16'
excerpt: 'Practice Reverse Engineering Fundamentals in multiple lab exercises.'
prog: 'Hackviser Reverse Engineering Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/fundamentals/fundamentals_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Fundamentals</h1>
<div class="writeup-date">June 2026 · Reverse Engineering Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Reverse Engineering Fundamentals in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Strings</strong></h5>
<p class="mb-3">This lab includes a C++ application showing that important information can be found in string data because of errors in the app's development.

To complete the laboratory, you need to find the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>In WSL terminal on Windows, we navigate to the folder containing the application and run the command <code>strings "Process Monitor.exe"</code>.</p>

```bash
user@linux:~$ strings "Process Monitor.exe"
!This program cannot be run in DOS mode.
bRich
.text
`.rdata
<rest of output here>
```

<p class="mb-3">Apparently we just hit a classic roadblock in Windows reverse engineering: Wide Characters (UTF-16 Little Endian). By default, the Linux strings utility only scans for standard 7-bit ASCII strings. However, modern Windows applications natively store user-facing text, dialog messages, and hardcoded values as 16-bit wide characters (Unicode).

Our output right now contains only the PE header boilerplate, Windows API function declarations, and compiler-generated runtime errors (like bad allocation). The actual license key is invisible because it's encoded in UTF-16, which inserts a null byte (0x00) after every character, causing standard strings to see them as single-character chunks and skip them.

Our output was filled with Windows API functions like <code>MessageBoxW</code>, and <code>GetDlgItemTextW</code>.

The <code>W</code> at the end of those Windows functions stands for Wide. It explicitly tells the OS to expect 16-bit UTF-16 strings instead of standard 8-bit ASCII strings. To fix this, we run the command <code>strings -e l "Process Monitor.exe"</code>. <code>-e l</code> tells the tool to use Encoding: Little-Endian 16-bit. The output containing the license key is shown below:</p>

```bash
user@linux:~$ strings -e l "Process Monitor.exe"
@jjj
gMessage
Process Monitor is starting.
ProcessMonitorWindowClass
Process Monitor
LISTBOX
 | Name:
 | PPID:
PID:
@LicenseKeyWindowClass
License Key
Error
Window creation failed
EDIT
Submit
BUTTON
OLDSL-FOVJJ-A1KZ8-I5H7A-SKIEQ
Verified
License key verified.
License key is invalid.
```

<p class="mb-5"><strong>Answer:</strong> OLDSL-FOVJJ-A1KZ8-I5H7A-SKIEQ</p>
<br />


<h5 class="mb-2"><strong>2. Architecture</strong></h5>
<p class="mb-3">This lab includes an application written in C++, where you can collect information about a simple text editor.

You need to collect information to complete the lab.

What is the architecture of the application?

Answer Format: *** **-***</p>
<p class="mb-3"><strong>Steps: </strong>In Linux terminal, we simply run <code>file architecture</code>.</p>

```bash
user@linux:~$ file architecture
architecture: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=b2702a63251165557092f1a96c91a167dd03ecae, for GNU/Linux 3.2.0, not stripped
```
<p class="mb-5"><strong>Answer:</strong> ELF 64-bit</p>
<br />


<h5 class="mb-2"><strong>3. DLL Analysis</strong></h5>
<p class="mb-3">This lab includes an application written in C++, where you can analyze DLLs to find important data such as function names used in the software.

To complete the lab you need to find the function names.

What is the name of the function that performs addition?</p>
<p class="mb-3"><strong>Steps: </strong>In Linux terminal, we simply run <code>strings MathFunctions.dll | grep -iE "add|sum"</code>.</p>

```bash
user@linux:~$ strings MathFunctions.dll | grep -iE "add|sum"
Math_add
```

<p class="mb-5"><strong>Answer:</strong> Math_add</p>
<br />


<h5 class="mb-2"><strong>4. Get Hash</strong></h5>
<p class="mb-3">This lab includes an application written in C++, where you can collect information.

You need to collect information to complete the lab.

What is the SHA1 hash value of the application?</p>
<p class="mb-3"><strong>Steps: </strong>In Linux terminal, we simply run <code>sha1sum text-editor</code>.</p>

```bash
user@linux:~$ sha1sum text-editor
0c57dec13224cdbe56cb03ca136dc6e6a7b248c4  text-editor
```

<p class="mb-5"><strong>Answer:</strong> 0c57dec13224cdbe56cb03ca136dc6e6a7b248c4</p>
<br />


<h5 class="mb-2"><strong>5. Programming Language</strong></h5>
<p class="mb-3">This lab includes identifying the language in which an application is developed.

To complete the lab you need to identify the programming language in which the application is developed.

Which programming language was the application developed in?</p>
<p class="mb-3"><strong>Steps: </strong>In Linux terminal, we simply run <code>objdump -p play-sound.exe | grep "DLL Name"</code>.</p>

```bash
user@linux:~$ objdump -p play-sound.exe | grep "DLL Name"
        DLL Name: USER32.dll
        DLL Name: WINMM.dll
        DLL Name: VCRUNTIME140.dll
        DLL Name: api-ms-win-crt-runtime-l1-1-0.dll
        DLL Name: api-ms-win-crt-math-l1-1-0.dll
        DLL Name: api-ms-win-crt-stdio-l1-1-0.dll
        DLL Name: api-ms-win-crt-locale-l1-1-0.dll
        DLL Name: api-ms-win-crt-heap-l1-1-0.dll
        DLL Name: KERNEL32.dll
```
<p class="mb-3">The application was developed in C++ because its dependencies dynamically link to the Windows Multimedia API (<code>WINMM.dll</code>) alongside the Microsoft Visual C++ Runtime (<code>VCRUNTIME140.dll</code>) and Universal C Runtime libraries.</p>
<p class="mb-5"><strong>Answer:</strong> C++</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>