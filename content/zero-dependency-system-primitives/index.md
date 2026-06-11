---
title: 'Restrictive Hacking: Zero-Dependency System Primitives'
date: '2026-06-11'
---

<div class="writeup-header">
<img src="/assets/img/profile.jpg" alt="Logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Perspectives</div>
<h1 class="writeup-title">Restrictive Hacking: <strong>Zero-Dependency System Primitives</strong></h1>
<div class="writeup-date">June 2026</div>
</div>
</div>

<p class="lead mb-4">
Flashy hacking suites break and automated scanners get blocked. Relying entirely on a third-party script leaves you powerless against a hardened perimeter. True stealth requires living off the land, turning native operating system primitives into your personal execution framework.
</p>

<div style="background-color: #111; border: 1px solid #222; padding: 0.85rem 1.2rem; border-radius: 4px; margin: 1.25rem 0; font-family: monospace; font-size: 0.85rem; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; min-width: 550px;">
        <tr style="line-height: 1.5;">
            <td style="width: 30%; vertical-align: top; text-align: center;">
                <strong>Phase 1: The Beginner</strong><br />
                <span style="font-size: 0.8rem;">CLI &amp; Native Commands</span>
            </td>
            <td style="width: 5%; text-align: center; font-size: 1rem; vertical-align: middle;"><strong>➔</strong></td>
            <td style="width: 30%; vertical-align: top; text-align: center;">
                <strong>Phase 2: The Penetration Tester</strong><br />
                <span style="font-size: 0.8rem;">Noisy Tools &amp; Bloated Scanners</span>
            </td>
            <td style="width: 5%; text-align: center; font-size: 1rem; vertical-align: middle;"><strong>➔</strong></td>
            <td style="width: 30%; vertical-align: top; text-align: center;">
                <strong>Phase 3: The Red Teamer</strong><br />
                <span style="font-size: 0.8rem;">Native Primitives Mastery</span>
            </td>
        </tr>
    </table>
</div>

<p class="lead mb-4">
This highlights the ultimate irony of offensive security: the industry demands that beginners master the basics, graduates them to noisy automation for standard penetration testing, and then forces them to strip everything away to survive against modern EDR/SIEM boundaries as advanced red teamers. True stealth means looping back to absolute system fluency. The matrix below isolates the strict 20% surface area of native utilities that handle 80% of real-world tactical execution.
</p>
<br />

<div class="primitives-tabs" id="primitivesTabs">
    <button class="primitives-tab active" data-tab="linux">Linux CLI</button>
    <button class="primitives-tab" data-tab="cmd">Windows CMD</button>
    <button class="primitives-tab" data-tab="powershell">Windows PowerShell</button>
    <button class="primitives-tab" data-tab="javascript">Browser Console</button>
</div>

<!-- Linux Primitives Panel -->
<div class="primitives-panel active" id="primitives-linux">
<p>Linux treats everything as a file, and its power lies in raw text manipulation. Below is the operational 20% surface area required to navigate, configure, and audit an enterprise Linux environment completely from memory.</p>
<br />

<table class="primitives-table">
    <thead><tr><th>Category</th><th>Command & Syntax</th><th>Core Utility & Invisible Context</th></tr></thead>
    <tbody>
    <tr><td>Meta Engine</td><td><code>man &lt;command&gt;</code></td><td>The ultimate local source of truth.</td></tr>
    <tr><td></td><td><code>apropos &lt;keyword&gt;</code></td><td>Searches man-page descriptions when you forget the exact command name.</td></tr>
    <tr><td>Navigation & Storage</td><td><code>cd</code> / <code>pwd</code></td><td>Change directory and print absolute working directory path.</td></tr>
    <tr><td></td><td><code>ls -lah</code></td><td>Lists directory contents showing hidden files (<code>-a</code>), detailed properties (<code>-l</code>), and human-readable sizes (<code>-h</code>).</td></tr>
    <tr><td></td><td><code>cp</code> / <code>mv</code> / <code>rm -rf</code></td><td>Copy, move, and forcefully remove files or directories recursively.</td></tr>
    <tr><td></td><td><code>mkdir -p /path/dir</code></td><td>Creates a nested directory path, spawning parent directories automatically if missing.</td></tr>
    <tr><td></td><td><code>ln -s &lt;target&gt; &lt;link&gt;</code></td><td>Creates a symbolic (soft) link. Crucial for configuration shortcuts and persistence hijacking.</td></tr>
    <tr><td></td><td><code>tar -czvf archive.tar.gz &lt;dir&gt;</code></td><td>Creates a compressed archive package. Use <code>tar -xzvf archive.tar.gz</code> to extract.</td></tr>
    <tr><td></td><td><code>lsblk</code></td><td>Lists block storage devices and visualizes partition mappings.</td></tr>
    <tr><td></td><td><code>df -h</code></td><td>Displays filesystem disk space usage across active mount points.</td></tr>
    <tr><td></td><td><code>du -sh * | sort -h</code></td><td>Sifts through the current directory, calculating sizes and sorting them to pinpoint massive files instantly.</td></tr>
    <tr><td></td><td><code>mount</code> / <code>umount</code></td><td>Attaches or detaches storage block devices to designated filesystem directory nodes.</td></tr>
    <tr><td></td><td><code>pvcreate</code> / <code>vgcreate</code> / <code>lvcreate</code></td><td>The foundation of Logical Volume Management (LVM) storage provisioning.</td></tr>
    <tr><td>Data & Text Slicing</td><td><code>cat</code> / <code>tac</code></td><td>Streams file contents to standard output sequentially or in reverse order.</td></tr>
    <tr><td></td><td><code>less</code></td><td>Opens large files with controlled pagination and native backward (<code>?</code>) or forward (<code>/</code>) string searching.</td></tr>
    <tr><td></td><td><code>tail -f &lt;file&gt;</code></td><td>Streams live updates appended to a target log file in real-time.</td></tr>
    <tr><td></td><td><code>grep -E "regex"</code></td><td>Filters incoming data streams or file strings matching precise patterns or regular expressions.</td></tr>
    <tr><td></td><td><code>awk '{print $N}'</code></td><td>Isolates and extracts specific columns of text from structured command outputs or logs.</td></tr>
    <tr><td></td><td><code>sed 's/find/replace/g'</code></td><td>Stream editor that searches and replaces strings dynamically without manually opening files.</td></tr>
    <tr><td></td><td><code>sort | uniq -c</code></td><td>Sorts input lines and returns unique entries along with their exact occurrence count.</td></tr>
    <tr><td></td><td><code>wc -l</code></td><td>Counts the absolute number of lines in a text stream.</td></tr>
    <tr><td>Identity & Access</td><td><code>whoami</code> / <code>id</code></td><td>Verifies active execution user context, UID, GID, and effective group associations.</td></tr>
    <tr><td></td><td><code>sudo -l</code></td><td>Lists the specific administrative binary execution privileges allowed for the current shell profile.</td></tr>
    <tr><td></td><td><code>su - &lt;user&gt;</code></td><td>Switches user context completely, pulling down the target user's clean environment variables.</td></tr>
    <tr><td></td><td><code>useradd</code> / <code>usermod</code> / <code>userdel</code></td><td>Complete administrative provisioning lifecycle for local user configuration profiles.</td></tr>
    <tr><td></td><td><code>groupadd</code> / <code>groupdel</code></td><td>Generates or terminates system security boundary access groups.</td></tr>
    <tr><td>Security & Auditing</td><td><code>chmod &lt;octal/symbolic&gt;</code></td><td>Modifies file access permissions (Read, Write, Execute). Uses standard octal bits or symbolic declarations.</td></tr>
    <tr><td></td><td><code>chown</code> / <code>chgrp</code></td><td>Alters explicit user and primary group ownership properties over targeted resources.</td></tr>
    <tr><td></td><td><code>chattr +i &lt;file&gt;</code></td><td>Toggles filesystem attributes. Applying <code>+i</code> makes a file entirely immutable, blocking even root from altering it.</td></tr>
    <tr><td></td><td><code>getfacl</code> / <code>setfacl</code></td><td>Views and manages advanced Access Control Lists for precise, multi-user file permission matrices.</td></tr>
    <tr><td>Process Triage</td><td><code>ps aux</code></td><td>Returns an absolute, descriptive snapshot of every active running process thread on the OS.</td></tr>
    <tr><td></td><td><code>top</code> / <code>htop</code></td><td>Launches an interactive real-time resource utilization and runtime thread manager.</td></tr>
    <tr><td></td><td><code>kill -9 &lt;PID&gt;</code></td><td>Transmits an uncatchable <code>SIGKILL</code> signal to forcefully terminate a rogue process thread.</td></tr>
    <tr><td></td><td><code>lsof -i :&lt;port&gt;</code></td><td>Identifies every open file handle or network socket, linking them directly to the owning Process ID.</td></tr>
    <tr><td></td><td><code>free -m</code></td><td>Renders a structured breakdown of available, used, and cached system RAM allocations.</td></tr>
    <tr><td>Network & Sockets</td><td><code>ip a</code> / <code>ip r</code></td><td>Evaluates physical interface configurations, IP definitions, and local Layer 3 routing charts.</td></tr>
    <tr><td></td><td><code>ss -tunatp</code></td><td>Displays all listening or established TCP (<code>-t</code>) and UDP (<code>-u</code>) sockets alongside their bound Process IDs (<code>-p</code>).</td></tr>
    <tr><td></td><td><code>curl -I &lt;url&gt;</code></td><td>Executes raw HTTP/S client queries. Using <code>-I</code> fetches only the server response headers for analysis.</td></tr>
    <tr><td></td><td><code>tcpdump -i &lt;iface&gt;</code></td><td>Captures raw packet frames moving through a designated interface for granular network traffic analysis.</td></tr>
    <tr><td></td><td><code>firewall-cmd --list-all</code></td><td>Queries the firewalld zone runtime and persistent packet filtering rule configurations.</td></tr>
    <tr><td>System Automation</td><td><code>systemctl &lt;action&gt; &lt;svc&gt;</code></td><td>Manages the initialization, live execution state, and boot-time persistence of background system daemons.</td></tr>
    <tr><td></td><td><code>journalctl -xe</code></td><td>Queries systemd logs, automatically focusing on recent execution faults and troubleshooting trends.</td></tr>
    <tr><td></td><td><code>cron</code> / <code>at</code></td><td>Configures automated, recurring script tasks (<code>cron</code>) or schedules an isolated execution routine (<code>at</code>).</td></tr>
    <tr><td></td><td><code>uname -a</code></td><td>Extracts full host architecture specifications and live Linux kernel build version properties.</td></tr>
    <tr><td></td><td><code>dnf</code> / <code>rpm</code></td><td>Resolves, installs, updates, and audits compiled software packages across the local system registry.</td></tr>
    </tbody>
</table>

<h4 style="margin-top: 2rem;">Exploitation Primitives: <em>The Offensive Pivot</em></h4>
<p>When operating in restricted, zero-dependency environments, these chained variants turn your core native commands into offensive reconnaissance arrays.</p>

<blockquote>
    <p><strong>SUID Binaries Discovery Matrix</strong><br>Locate binaries executing with implicit root context:</p>
    <pre><code>find / -perm -4000 -type f 2>/dev/null</code></pre>
</blockquote>

<blockquote>
    <p><strong>World-Writable Structural Auditing</strong><br>Identify files any low-privileged identity can alter to compromise integrity:</p>
    <pre><code>find / -perm -o+w -type f 2>/dev/null</code></pre>
</blockquote>

<blockquote>
    <p><strong>Live Local Process Interrogation</strong><br>Walk through the virtual memory filesystem to sniff environment strings or runtime process states without using security-flagged analysis tools:</p>
    <pre><code>cat /proc/&lt;PID&gt;/cmdline && cat /proc/&lt;PID&gt;/environ</code></pre>
</blockquote>
</div>

<!-- Windows CMD Primitives Panel -->
<div class="primitives-panel" id="primitives-cmd">
<p>When PowerShell is heavily restricted, logged by script-block auditing, or completely unavailable, the classic Command Prompt (<code>cmd.exe</code>) remains the ultimate fallback. It is frozen in time for enterprise backwards compatibility, making its core binary primitives completely reliable across any Windows architecture.</p>
<br />

<table class="primitives-table">
    <thead><tr><th>Category</th><th>Command & Syntax</th><th>Core Utility & Invisible Context</th></tr></thead>
    <tbody>
    <tr><td>Navigation & Context</td><td><code>dir /a /s</code></td><td>Lists directory contents. <code>/a</code> reveals hidden files/directories, and <code>/s</code> recursively drops through all nested subdirectories.</td></tr>
    <tr><td></td><td><code>cd /d &lt;path&gt;</code></td><td>Changes directories. The <code>/d</code> switch is mandatory if you are jumping across different drive letters (e.g., from <code>C:</code> to <code>D:</code>).</td></tr>
    <tr><td></td><td><code>cd</code></td><td>Typing the command with zero arguments acts as the legacy Windows equivalent to Linux <code>pwd</code>, printing the current active path string.</td></tr>
    <tr><td></td><td><code>where &lt;binary&gt;</code></td><td>Locates and prints the absolute path of executable binaries within the system's PATH environmental variable (equivalent to Linux <code>which</code>).</td></tr>
    <tr><td>File Manipulation</td><td><code>mkdir</code> / <code>rmdir /s /q</code></td><td>Creates a folder or forcefully deletes it. <code>/s</code> removes the target directory tree and all its contents, while <code>/q</code> runs it quietly without confirmation prompts.</td></tr>
    <tr><td></td><td><code>copy</code> / <code>move</code></td><td>Standard operators to duplicate or relocate target files across structural paths.</td></tr>
    <tr><td></td><td><code>robocopy &lt;src&gt; &lt;dest&gt; /e</code></td><td>Robust File Copy. An enterprise-grade data engine that handles multi-threaded folder migrations, mirrors trees, and preserves security ACL definitions.</td></tr>
    <tr><td></td><td><code>del /f /a</code></td><td>Deletes files. <code>/f</code> forces the deletion of read-only resources, and <code>/a</code> targets specific attributes like hidden or system files.</td></tr>
    <tr><td></td><td><code>type &lt;file&gt;</code></td><td>Streams plain-text file contents directly into the terminal window (the exact CMD equivalent to Linux <code>cat</code>).</td></tr>
    <tr><td>Network & Sockets</td><td><code>ipconfig /all</code></td><td>Displays complete network interface details, exposing MAC addresses, DNS servers, DHCP leases, and hidden tunneling cards.</td></tr>
    <tr><td></td><td><code>ping</code> / <code>tracert</code></td><td>Verifies basic Layer 3 host connectivity (<code>ping</code>) and maps out the explicit router hop pathway to a target domain (<code>tracert</code>).</td></tr>
    <tr><td></td><td><code>nslookup</code></td><td>Queries internal or external DNS nameservers to verify structural A-records, MX records, or reverse-pointer maps.</td></tr>
    <tr><td></td><td><code>netstat -ano</code></td><td>Displays every active network connection. <code>/a</code> shows all sockets, <code>/n</code> forces numeric port formats, and <code>/o</code> binds the owning Process ID (PID).</td></tr>
    <tr><td>Process & Triage</td><td><code>tasklist /v</code></td><td>Renders a detailed snapshot of all active processes, memory structures, and the explicit user profile executing each thread.</td></tr>
    <tr><td></td><td><code>taskkill /F /PID &lt;num&gt;</code></td><td>Forcefully terminates a running process. Use <code>/PID</code> for a specific identifier, or switch to <code>/IM process.exe</code> to kill by image name.</td></tr>
    <tr><td></td><td><code>sc query</code> / <code>sc config</code></td><td>Service Control engine. Interrogates, manages, stops, starts, or alters the startup configuration matrices of Windows background system services.</td></tr>
    <tr><td>Identity & Auditing</td><td><code>whoami /priv</code></td><td>Verifies current execution context. The <code>/priv</code> flag lists all active administrative and security tokens assigned to the current shell token.</td></tr>
    <tr><td></td><td><code>net user</code></td><td>Interrogates or alters local user account parameters. Typing <code>net user &lt;name&gt; *</code> allows an admin to overwrite a local password.</td></tr>
    <tr><td></td><td><code>net localgroup</code></td><td>Reviews or modifies local group structural boundaries (e.g., querying <code>net localgroup administrators</code> to audit administrative persistence).</td></tr>
    <tr><td></td><td><code>net share</code></td><td>Enumerates or manages local SMB network file shares and default hidden administrative deployments (like <code>C$</code> or <code>ADMIN$</code>).</td></tr>
    <tr><td></td><td><code>systeminfo</code></td><td>Pulls a massive metadata profile of the operating system, including host hotfixes, kernel patch updates, uptime, and BIOS attributes.</td></tr>
    <tr><td></td><td><code>wmic process get</code></td><td>Interrogates internal systems via Windows Management Instrumentation. Excellent for grabbing specific columns like <code>caption,commandline</code> raw.</td></tr>
    <tr><td>Data Manipulation</td><td><code>findstr /I /S "string"</code></td><td>The classic CMD text parsing engine (equivalent to Linux <code>grep</code>). <code>/I</code> ignores case variance, and <code>/S</code> recursively searches nested files.</td></tr>
    </tbody>
</table>

<h4 style="margin-top: 2rem;">Exploitation Primitives: <em>The Offensive Pivot</em></h4>
<p>These precise CMD configurations chain legacy primitives together to perform stealthy administrative audits and offensive data mining without bringing external suites onto the target.</p>

<blockquote>
    <p><strong>Token Privilege Assessment</strong><br>Instantly check if your current context possesses critical exploitation privileges (like <code>SeImpersonatePrivilege</code> or <code>SeDebugPrivilege</code>):</p>
    <pre><code>whoami /priv | findstr /I "Se"</code></pre>
</blockquote>

<blockquote>
    <p><strong>Process Image Location Hunt</strong><br>Find exactly where a running binary is executing from on the file system to detect malicious masquerading:</p>
    <pre><code>wmic process get caption,executablepath,processid | findstr /I "lsass"</code></pre>
</blockquote>

<blockquote>
    <p><strong>Sensitive File Sifting</strong><br>Recursively search through directories for configuration files containing potential passwords or credentials:</p>
    <pre><code>findstr /S /I /M "password" *.config *.xml *.txt</code></pre>
</blockquote>
</div>

<!-- Windows PowerShell Primitives Panel -->
<div class="primitives-panel" id="primitives-powershell">
<p>PowerShell completely breaks away from the text-stream paradigm. Instead of piping raw strings of text, it passes structured .NET <strong>Objects</strong> containing rich properties and executable methods through the pipeline (<code>|</code>). This object-oriented engine gives you complete programmatic control over the operating system internals.</p>
<br />

<table class="primitives-table">
    <thead><tr><th>Category</th><th>Cmdlet & Syntax</th><th>Core Utility & Invisible Context</th></tr></thead>
    <tbody>
    <tr><td>The Meta Engine</td><td><code>Get-Command *keyword*</code></td><td>Dynamically scans and maps every cmdlet, module, script, or alias available on the system matching the query.</td></tr>
    <tr><td></td><td><code>Get-Help &lt;cmdlet&gt; -Examples</code></td><td>Calls the integrated manual pages. The <code>-Examples</code> flag isolates working syntax blocks without parsing the full documentation tree.</td></tr>
    <tr><td></td><td><code>Get-Member</code></td><td><strong>The fundamental pipeline tool.</strong> Inspects any piped output object and exposes its hidden property names, methods, and types.</td></tr>
    <tr><td></td><td><code>Update-Help</code></td><td>Forces an administrative down-stream sync of the latest structured help and documentation files directly from Microsoft.</td></tr>
    <tr><td>Object Data Slicing</td><td><code>Where-Object</code> (Alias: <code>?</code>)</td><td>Filters objects out of the pipeline based on precise conditional scripts (e.g., matching property flags or execution states).</td></tr>
    <tr><td></td><td><code>Select-Object</code> (Alias: <code>select</code>)</td><td>Isolates specific properties (columns), creates custom object properties, or restricts output counts (e.g., <code>-First 5</code>).</td></tr>
    <tr><td></td><td><code>ForEach-Object</code> (Alias: <code>%</code>)</td><td>Loops through an array or continuous stream of pipeline objects, executing an identical script block on every single item.</td></tr>
    <tr><td></td><td><code>Sort-Object</code></td><td>Organizes pipeline elements in ascending or descending alphanumeric order based on any chosen object property.</td></tr>
    <tr><td></td><td><code>Select-String</code></td><td>The native PowerShell equivalent to Linux <code>grep</code>. Parses raw files or object outputs using string targets or Regular Expressions.</td></tr>
    <tr><td></td><td><code>Group-Object</code></td><td>Segregates and groups incoming data sets by matching property types, automatically generating instance counts.</td></tr>
    <tr><td>System & Filesystem</td><td><code>Get-ChildItem</code> (Alias: <code>dir</code> / <code>ls</code>)</td><td>Enumerates objects inside the current PSProvider context. Works identically across the filesystem, registry hives, and cert stores.</td></tr>
    <tr><td></td><td><code>Set-Location</code> (Alias: <code>cd</code>)</td><td>Changes the execution path context across active directory, registry, or logical resource drives.</td></tr>
    <tr><td></td><td><code>Copy-Item</code> / <code>Move-Item</code> / <code>Remove-Item</code></td><td>Copies, moves, or deletes file items, folder structures, registry keys, or environment settings.</td></tr>
    <tr><td></td><td><code>New-Item</code></td><td>Generates a new resource item (creates new directories, registry values, or acts like Linux <code>touch</code> to drop empty files).</td></tr>
    <tr><td></td><td><code>Get-Content</code> (Alias: <code>cat</code>)</td><td>Streams a target file. Use <code>Get-Content -Tail 10 -Wait</code> to stream live system updates in real-time (equivalent to Linux <code>tail -f</code>).</td></tr>
    <tr><td></td><td><code>Set-Content</code> / <code>Add-Content</code></td><td>Writes text parameters to a target file. <code>Set-Content</code> completely overwrites; <code>Add-Content</code> appends data cleanly.</td></tr>
    <tr><td>Operational Triage</td><td><code>Get-Process</code> (Alias: <code>ps</code>)</td><td>Displays an object-oriented summary of all active process blocks and their underlying memory handles.</td></tr>
    <tr><td></td><td><code>Stop-Process -Id &lt;num&gt;</code></td><td>Forcefully terminates one or more active process structures using an explicit Process ID or process image name (<code>-Name</code>).</td></tr>
    <tr><td></td><td><code>Get-Service</code></td><td>Queries the state matrix of all registered system service daemons.</td></tr>
    <tr><td></td><td><code>Start-Service</code> / <code>Stop-Service</code></td><td>Modifies the running status of background services on the host dynamically.</td></tr>
    <tr><td></td><td><code>Set-Service</code></td><td>Adjusts underlying service parameters, such as changing critical boot properties (<code>-StartupType Automatic/Disabled</code>).</td></tr>
    <tr><td>Network & Sockets</td><td><code>Get-NetIPAddress</code></td><td>Evaluates physical and virtual adapter network bindings, IPv4/IPv6 addresses, and interface link states.</td></tr>
    <tr><td></td><td><code>Get-NetRoute</code></td><td>Queries the host's active Layer 3 IP routing parameters and interface metrics.</td></tr>
    <tr><td></td><td><code>Get-NetTCPConnection</code></td><td>The modern object replacement for <code>netstat</code>. Returns listening sockets, foreign endpoints, and bound PIDs instantly.</td></tr>
    <tr><td></td><td><code>Test-NetConnection -Port &lt;num&gt;</code></td><td>The complete native port utility. Performs ICMP checks, traceroutes, and verifies open TCP port state mappings without external binaries.</td></tr>
    <tr><td></td><td><code>Invoke-WebRequest</code> (Alias: <code>iwr</code>)</td><td>Executes standard HTTP/S client requests against web resources. Downloads binaries or captures full DOM page returns.</td></tr>
    <tr><td></td><td><code>Invoke-RestMethod</code> (Alias: <code>irm</code>)</td><td>Tailored specifically for interacting with REST APIs. Automatically parses incoming JSON or XML payloads into native objects.</td></tr>
    <tr><td>Identity & Windows Core</td><td><code>Get-LocalUser</code> / <code>Set-LocalUser</code></td><td>Manages local user account configuration fields, group references, and security properties.</td></tr>
    <tr><td></td><td><code>Get-LocalGroup</code> / <code>Add-LocalGroupMember</code></td><td>Audits or modifies local administrative and permission access boundary groups on the target machine.</td></tr>
    <tr><td></td><td><code>Get-CimInstance</code></td><td>The core administrative interface to Windows internals. Queries the Common Information Model (CIM) to extract absolute OS properties.</td></tr>
    <tr><td></td><td><code>Get-WinEvent</code></td><td>Queries the structural Windows Event Log management subsystem to isolate system faults, authentication anomalies, or security trails.</td></tr>
    <tr><td></td><td><code>Get-ExecutionPolicy</code></td><td>Audits the host script signing restrictions (<code>Restricted</code>, <code>RemoteSigned</code>, <code>Bypass</code>) controlling the execution of automation scripts.</td></tr>
    <tr><td>Data Interoperability</td><td><code>Export-Csv</code> / <code>Import-Csv</code></td><td>Converts object streams directly into organized spreadsheet templates, or pulls raw CSV datasets back into live objects.</td></tr>
    <tr><td></td><td><code>ConvertTo-Json</code> / <code>ConvertFrom-Json</code></td><td>Instantly flattens complex system objects into flat text JSON strings, or re-hydrates incoming API payloads into interactive structures.</td></tr>
    </tbody>
</table>

<h4 style="margin-top: 2rem;">Exploitation Primitives: <em>The Offensive Pivot</em></h4>
<p>These precise PowerShell object pipelines manipulate native .NET engines and built-in hooks to gather intelligence or audit domains completely invisibly without calling standard administrator panels.</p>

<blockquote>
    <p><strong>Active Directory User Sifting via [ADSI]</strong><br>Query the entire corporate Active Directory domain directly through the raw native .NET framework accelerator, bypassing the heavy, heavily-monitored <code>ActiveDirectory</code> admin module completely:</p>
    <pre><code>([adsisearcher]"objectcategory=user").FindAll()</code></pre>
</blockquote>

<blockquote>
    <p><strong>Advanced Object Property Sifting</strong><br>Pull every active running service that is explicitly configured to launch automatically, but is currently sitting in a stopped state (a common signature of broken configurations or tampered persistence hooks):</p>
    <pre><code>Get-Service | Where-Object {$_.StartType -eq "Automatic" -and $_.Status -eq "Stopped"} | Select-Object Name, DisplayName</code></pre>
</blockquote>

<blockquote>
    <p><strong>Deep Event Log Auditing</strong><br>Search directly inside the local Security log to pull out the most recent failed network authentication events (Event ID 4625) to map configuration issues or brute-force tracking:</p>
    <pre><code>Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 10 | Select-Object TimeCreated, Message</code></pre>
</blockquote>
</div>

<!-- JavaScript Primitives Panel -->
<div class="primitives-panel" id="primitives-javascript">
<p>Inside a modern browser environment, you are no longer dealing with system binaries. Instead, you are operating directly within a live, running <strong>JavaScript</strong> engine and manipulating the Document Object Model (DOM). For manual application security auditing, logic checking, and DOM analysis, this core 20% surface area allows you to bypass user interfaces and interrogate application behavior directly.</p>
<br />

<table class="primitives-table">
    <thead><tr><th>Category</th><th>Syntax & Property</th><th>Core Utility & Invisible Context</th></tr></thead>
    <tbody>
    <tr><td>Variables & Storage</td><td><code>const target = ...</code></td><td>Declares an immutable, block-scoped reference. Use this by default to lock onto specific DOM nodes or functions so you don't overwrite them.</td></tr>
    <tr><td></td><td><code>let counter = 0;</code></td><td>Declares a mutable, block-scoped variable. Essential for controlling programmatic script loops or brute-force tracking inside the console.</td></tr>
    <tr><td></td><td><code>localStorage</code> / <code>sessionStorage</code></td><td>Interrogates the browser's persistent key-value storage. Excellent for auditing leaked state objects, cached keys, or configuration variables.</td></tr>
    <tr><td></td><td><code>document.cookie</code></td><td>Dumps the active session cookies. Crucial for verifying if session identifiers are securely locked down or missing the defensive <code>HttpOnly</code> flag.</td></tr>
    <tr><td>DOM Navigation</td><td><code>document.querySelector('.selector')</code></td><td>Selects the <strong>first</strong> element matching a specific CSS selector (e.g., <code>'input[type="hidden"]'</code>).</td></tr>
    <tr><td></td><td><code>document.querySelectorAll('.selector')</code></td><td>Returns a static NodeList containing <strong>all</strong> matching elements on the live page for bulk evaluation.</td></tr>
    <tr><td></td><td><code>$0</code></td><td>A unique, built-in DevTools macro. Select any element visually in the "Elements" panel, type <code>$0</code> in the console, and it instantly references it.</td></tr>
    <tr><td></td><td><code>.parentElement</code> / <code>.children</code></td><td>Traverses the live DOM tree upwards to parent containers or downwards through nested structures from a targeted node.</td></tr>
    <tr><td>Data Manipulation</td><td><code>.getAttribute('name')</code></td><td>Reads explicit HTML element attribute values. (e.g., pulling a hidden form token).</td></tr>
    <tr><td></td><td><code>.setAttribute('name', 'val')</code></td><td>Dynamically overrides an HTML attribute (e.g., changing an input from <code>type="password"</code> to <code>type="text"</code> to reveal a masked string).</td></tr>
    <tr><td></td><td><code>.innerText</code> / <code>.innerHTML</code></td><td>Reads or overrides text or raw HTML rendering blocks inside a node to test how input validation routines handle data.</td></tr>
    <tr><td></td><td><code>.value</code></td><td>Directly reads or inputs text strings into form fields, options arrays, or textboxes programmatically.</td></tr>
    <tr><td>Functional Chaining</td><td><code>.forEach(el => { ... })</code></td><td>Loops through an array or list of nodes to execute an identical action (like programmatically clicking a sequence of fields).</td></tr>
    <tr><td></td><td><code>.map(el => el.property)</code></td><td>Transforms a raw array of elements into a clean, extracted array containing only the precise properties you want to see.</td></tr>
    <tr><td></td><td><code>.filter(el => condition)</code></td><td>Sifting mechanism. Trims an array down to only include elements that evaluate to true based on a custom conditional statement.</td></tr>
    <tr><td></td><td><code>Array.from(nodeList)</code></td><td>Converts an index-based DevTools NodeList (from <code>querySelectorAll</code>) into a true JavaScript array to enable <code>.map()</code> and <code>.filter()</code>.</td></tr>
    <tr><td>Network & Execution</td><td><code>fetch('url')</code></td><td>Generates a raw asynchronous HTTP/S request (GET/POST/PUT) straight from the console environment to talk directly to backend endpoints.</td></tr>
    <tr><td></td><td><code>.json()</code></td><td>Appended to a fetch sequence to automatically decode an incoming backend stream into an interactive, structured JavaScript object.</td></tr>
    <tr><td></td><td><code>window.location.href = 'url'</code></td><td>Evaluates or forces an immediate browser redirection to a completely new URL structure.</td></tr>
    <tr><td></td><td><code>setTimeout()</code> / <code>setInterval()</code></td><td>Executes an automated block of code after a precise delay (<code>setTimeout</code>) or triggers it continuously at regular loops (<code>setInterval</code>).</td></tr>
    <tr><td>Console Interrogators</td><td><code>console.dir(object)</code></td><td><strong>The JS equivalent to Get-Member.</strong> Instead of rendering a node visually, it opens an interactive directory of <em>every</em> hidden property and method inside the object.</td></tr>
    <tr><td></td><td><code>console.table(array)</code></td><td>Flattens arrays of objects or data extractions into a gorgeous, readable, and filterable spreadsheet view inside the DevTools console.</td></tr>
    <tr><td></td><td><code>monitorEvents($0, 'event')</code></td><td>DevTools exclusive. Live-streams every trigger of a specific category (like <code>'mouse'</code>, <code>'key'</code>, or <code>'control'</code>) passing into an element.</td></tr>
    </tbody>
</table>

<h4 style="margin-top: 2rem;">Exploitation Primitives: <em>The Offensive Pivot</em></h4>
<p>These browser-native snippets use the console to instantly map out the global runtime landscape and build defensive instrumentation maps or automated extractions completely independent of external extensions.</p>

<blockquote>
    <p><strong>The Global Scope Interrogator</strong><br>Simply evaluate the root <code>window</code> object to instantly discover all custom developer-defined functions, active API clients, global states, and loaded third-party libraries:</p>
    <pre><code>console.dir(window);</code></pre>
</blockquote>

<blockquote>
    <p><strong>The External URL Extraction Pipeline</strong><br>Grab all links embedded on a busy page, map them to their absolute hypertext references, and filter out the internal paths to see exactly where the page sends outbound traffic:</p>
    <pre><code>Array.from(document.querySelectorAll('a'))
.map(link => link.href)
.filter(href => href.startsWith('http') && !href.includes(window.location.hostname));</code></pre>
</blockquote>

<blockquote>
    <p><strong>The DOM XSS Sink Hook</strong><br>Override a native browser execution method directly in memory to trap, trace, and print the exact input and origin whenever data passes through a dangerous execution window live:</p>
    <pre><code>const originalEval = window.eval;
window.eval = function(inputContext) {
console.warn("DANGEROUS RUNTIME SINK TRIGGERED:");
console.trace(inputContext);
return originalEval(inputContext);
};</code></pre>
</blockquote>
</div>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<script>
  // Primitives tabs
  document.getElementById('primitivesTabs').addEventListener('click', e => {
    const btn = e.target.closest('.primitives-tab');
    if (!btn) return;
    document.querySelectorAll('.primitives-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.primitives-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('primitives-' + btn.dataset.tab).classList.add('active');
  });
</script>
