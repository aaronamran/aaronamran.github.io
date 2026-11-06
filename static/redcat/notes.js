/**
 * Red Cat - Section Notes (RHCSA EX200 Aligned Structure)
 * 
 * This file stores notes for each section that can be displayed in the notes modal.
 * Notes can include tips, examplanations, command references, and study materials.
 * 
 * Each section has a notes property that contains HTML content.
 * You can use standard HTML tags for formatting:
 * - <h3> for subheadings
 * - <p> for paragraphs
 * - <ul>/<ol> and <li> for lists
 * - <code> for inline code
 * - <pre><code> for code blocks
 * - <strong> and <em> for emphasis
 * 
 * UPDATED FOR 17-SECTION STRUCTURE (RHCSA EX200 Curriculum Aligned)
 */

const sectionNotes = {
    1: {
        title: "Essential Tools",
        content: `
            <h3>Linux Directory Structure</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Location</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>/boot</code></td>
                        <td style="padding: 8px;">Files to start the boot process</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>/dev</code></td>
                        <td style="padding: 8px;">Special device files that the system uses to access hardware</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>/etc</code></td>
                        <td style="padding: 8px;">System-specific configuration files</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>/home</code></td>
                        <td style="padding: 8px;">Home directory, where regular users store their data and configuration files</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>/root</code></td>
                        <td style="padding: 8px;">Home directory for the administrative superuser, root</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>/run</code></td>
                        <td style="padding: 8px;">Runtime data for processes started since last boot (process ID files, lock files). Contents re-created on reboot</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>/tmp</code></td>
                        <td style="padding: 8px;">World-writable space for temporary files. Files not accessed for 10 days are deleted automatically</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>/usr</code></td>
                        <td style="padding: 8px;">Installed software, shared libraries, and read-only program data<br><code>/usr/bin</code> - User commands<br><code>/usr/sbin</code> - System administration commands<br><code>/usr/local</code> - Locally customized software</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>/var</code></td>
                        <td style="padding: 8px;">System-specific variable data (databases, cache, log files, printer-spooled documents, website content)</td>
                    </tr>
                </tbody>
            </table>

            <h3>File System Navigation Tips</h3>
            <ul>
                <li><code>.</code> (single dot) - Refers to the current directory</li>
                <li><code>..</code> (double dot) - Refers to the parent directory</li>
                <li>Files starting with a dot (<code>.</code>) are hidden files (e.g., <code>.bashrc</code>)</li>
                <li><code>~</code> (tilde) - Shortcut for current user's home directory</li>
                <li><code>mkdir -p /path/to/deep/directory</code> - Create parent directories automatically</li>
                <li><code>rm -i file.txt</code> - Interactive delete with confirmation prompt (opposite of <code>-f</code> force)</li>
            </ul>

            <h3>Manage Links Between Files</h3>
            <p><strong>Hard Links:</strong> A second name for an existing file pointing to the exact same data on disk (same inode). Data remains accessible as long as at least one link exists.</p>
            <pre><code>ln file1.txt file2.txt</code></pre>
            <p>Creates an identical twin; if you delete <code>file1.txt</code>, content is still accessible through <code>file2.txt</code>.</p>

            <p><strong>Symbolic Links (Soft Links):</strong> A special file that acts as a shortcut by pointing to a file or directory name rather than the data itself. Can span across different file systems.</p>
            <pre><code>ln -s /etc/ssh /home/user/ssh_config</code></pre>
            <p>Creates a shortcut; if <code>/etc/ssh</code> is moved or deleted, the link becomes "dangling" and won't work.</p>

            <h3>Pattern Matching (Globbing)</h3>
            <p><strong>CRITICAL EXAM SKILL:</strong> Wildcards for matching multiple files at once.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Pattern</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Matches</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>*</code></td>
                        <td style="padding: 8px;">Any string of zero or more characters</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>?</code></td>
                        <td style="padding: 8px;">Any single character</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>[abc]</code></td>
                        <td style="padding: 8px;">Any one character in the enclosed class</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>[!abc]</code> or <code>[^abc]</code></td>
                        <td style="padding: 8px;">Any one character NOT in the enclosed class</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>[[:alpha:]]</code></td>
                        <td style="padding: 8px;">Any alphabetic character</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>[[:digit:]]</code></td>
                        <td style="padding: 8px;">Any single digit from 0 to 9</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>[[:alnum:]]</code></td>
                        <td style="padding: 8px;">Any alphabetic character or digit</td>
                    </tr>
                </tbody>
            </table>

            <p><strong>Examples:</strong></p>
            <ul>
                <li><code>ls a*</code> - List all files starting with "a"</li>
                <li><code>ls *a*</code> - List all files containing "a"</li>
                <li><code>ls [ac]*</code> - List files starting with "a" or "c"</li>
                <li><code>ls ????</code> - List files with exactly 4 characters</li>
            </ul>

            <h3>Brace Expansion</h3>
            <p>Generate multiple strings quickly for creating files or directories:</p>
            <pre><code>mkdir RHEL{7,8,9}               # Creates: RHEL7 RHEL8 RHEL9
echo file{1..3}.txt           # Outputs: file1.txt file2.txt file3.txt
touch file{a,b}{1,2}.txt      # Creates: filea1.txt filea2.txt fileb1.txt fileb2.txt</code></pre>

            <h3>Variables & Command Substitution</h3>
            <p><strong>Variable Assignment:</strong></p>
            <pre><code>USERNAME=operator
echo \$USERNAME                # Output: operator
echo \${USERNAME}              # Safer form with curly braces</code></pre>

            <p><strong>Command Substitution:</strong> Use command output in another command:</p>
            <pre><code>echo Today is \$(date +%A)
echo The time is \$(date +%M) minutes past \$(date +%l%p)</code></pre>

            <h3>Protecting Arguments from Expansion</h3>
            <ul>
                <li><code>\</code> (backslash) - Escape single character: <code>echo \\\$HOME</code> displays <code>\$HOME</code> literally</li>
                <li><code>'single quotes'</code> - Stop ALL shell expansion (literal text)</li>
                <li><code>"double quotes"</code> - Allow variable and command substitution, but stop globbing</li>
            </ul>

            <p><strong>Examples:</strong></p>
            <pre><code>echo 'Will \$myhost evaluate to \$(hostname)?'   # Literal text
echo "Will \$myhost evaluate to \$(hostname)?"   # Variables expand</code></pre>

            <h3>File Descriptors & Redirection</h3>
            <p><strong>Standard I/O Channels:</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Channel</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Number</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Default</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Usage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>stdin</code></td>
                        <td style="padding: 8px;"><code>0</code></td>
                        <td style="padding: 8px;">Keyboard</td>
                        <td style="padding: 8px;">Read only</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>stdout</code></td>
                        <td style="padding: 8px;"><code>1</code></td>
                        <td style="padding: 8px;">Terminal</td>
                        <td style="padding: 8px;">Write only</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>stderr</code></td>
                        <td style="padding: 8px;"><code>2</code></td>
                        <td style="padding: 8px;">Terminal</td>
                        <td style="padding: 8px;">Write only (errors)</td>
                    </tr>
                </tbody>
            </table>

            <p><strong>Redirection Operators:</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Operator</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>&gt; file</code></td>
                        <td style="padding: 8px;">Redirect stdout to overwrite file</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>&gt;&gt; file</code></td>
                        <td style="padding: 8px;">Redirect stdout to append to file</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>2&gt; file</code></td>
                        <td style="padding: 8px;">Redirect stderr to overwrite file</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>2&gt; /dev/null</code></td>
                        <td style="padding: 8px;">Discard error messages</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>&amp;&gt; file</code> or <code>&gt; file 2&gt;&amp;1</code></td>
                        <td style="padding: 8px;">Redirect both stdout and stderr to overwrite file</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>&amp;&gt;&gt; file</code> or <code>&gt;&gt; file 2&gt;&amp;1</code></td>
                        <td style="padding: 8px;">Redirect both stdout and stderr to append to file</td>
                    </tr>
                </tbody>
            </table>

            <p><strong>CRITICAL:</strong> Order matters! <code>&gt; output.log 2&gt;&amp;1</code> redirects stdout first, then stderr follows. Reverse order won't work as expected.</p>

            <h3>Pipelines</h3>
            <p>Connect standard output of one command to standard input of another using <code>|</code> (pipe):</p>
            <pre><code>ls -l /usr/bin | less                    # View output one page at a time
ls | wc -l                               # Count files
ls -t | head -n 10 &gt; /tmp/recent.txt     # Save top 10 recent files</code></pre>

            <p><strong>tee Command:</strong> Copy output to both file AND next command in pipeline:</p>
            <pre><code>ls -l | tee /tmp/saved-output | less     # Save AND view
ls -t | head -n 10 | tee /tmp/ten-files  # Display AND save
ls -l | tee -a /tmp/append-files         # Append with -a flag</code></pre>

            <p><strong>Pro Tip:</strong> To pipe both stdout and stderr: <code>find / -name passwd 2&gt;&amp;1 | less</code></p>

            <h3>Vim - Minimum Essentials</h3>
            <p><strong>EXAM CRITICAL:</strong> You need to know basic Vim to edit files on RHCSA!</p>

            <p><strong>Essential Commands:</strong></p>
            <ul>
                <li><code>i</code> - Enter insert mode (start typing)</li>
                <li><code>Esc</code> - Return to command mode</li>
                <li><code>:w</code> - Write (save) file</li>
                <li><code>:wq</code> or <code>:x</code> - Write and quit</li>
                <li><code>:q!</code> - Quit without saving (discard changes)</li>
                <li><code>u</code> - Undo last change</li>
                <li><code>x</code> - Delete single character</li>
                <li><code>dd</code> - Delete entire line</li>
            </ul>

            <p><strong>Visual Mode (Copy/Paste):</strong></p>
            <ul>
                <li><code>v</code> - Character mode (highlight text)</li>
                <li><code>Shift+v</code> - Line mode (highlight full lines)</li>
                <li><code>Ctrl+v</code> - Block mode (column selection)</li>
                <li><code>y</code> - Yank (copy) selection</li>
                <li><code>p</code> - Put (paste) after cursor</li>
            </ul>

            <p><strong>Vim Config:</strong> <code>~/.vimrc</code> for user settings, <code>/etc/vimrc</code> for system-wide.</p>

            <h3>Shell Variables (Detailed)</h3>
            <p><strong>Setting Variables:</strong></p>
            <pre><code>COUNT=40                    # No spaces around =
first_name=John
file1=/tmp/abc
\${VARIABLENAME}             # Curly braces for clarity</code></pre>

            <p><strong>Using Variables:</strong></p>
            <pre><code>echo \$COUNT                 # Display value: 40
echo \${COUNT}x              # Curly braces prevent ambiguity: 40x
ls -l \$file1                # Use variable in commands
rm \$file1</code></pre>

            <p><strong>List All Variables:</strong> <code>set | less</code></p>

            <p><strong>Important:</strong> Variables are shell-specific. Each terminal session has its own set of variables.</p>
        `
    },
    2: {
        title: "Users & Groups",
        content: `
            <h3>Users</h3>
            <ul>
                <li><code>id &lt;user&gt;</code> - Show information about a specific user. When no user is specified, shows information about the currently logged-in user</li>
                <li><code>su</code> - Non-login shell. Switches to the root user while remaining in your current shell environment</li>
                <li><code>su -</code> (or <code>su --login</code>) - Login shell. Starts a completely fresh login session and loads the full path and environment intended for that user</li>
                <li><code>sudo</code> - Execute commands that require root privileges</li>
                <li><code>useradd &lt;user&gt;</code> - Add a new user</li>
                <li><code>usermod &lt;user&gt;</code> - Modify a user account</li>
                <li><code>userdel &lt;user&gt;</code> - Delete a user</li>
                <li><code>passwd &lt;user&gt;</code> - Change the password for a user</li>
            </ul>

            <h3>UID Ranges</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">UID</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>0</code></td>
                        <td style="padding: 8px;">Superuser (root) account ID</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>1-200</code></td>
                        <td style="padding: 8px;">System account UIDs for system processes</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>201-999</code></td>
                        <td style="padding: 8px;">UIDs for system processes that do not own files on this system. Software that requires an underprivileged UID is dynamically assigned a UID from this available pool</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>1000+</code></td>
                        <td style="padding: 8px;">UID range assigned to regular, unprivileged users</td>
                    </tr>
                </tbody>
            </table>

            <h3>Groups</h3>
            <ul>
                <li><code>groupadd &lt;group&gt;</code> - Add a new group</li>
                <li><code>groupmod &lt;group&gt;</code> - Modify a group</li>
                <li><code>groupdel &lt;group&gt;</code> - Delete a group</li>
                <li><code>newgrp &lt;group2&gt;</code> - Temporarily switch to a secondary group</li>
            </ul>

            <h3>User Passwords</h3>
            <p><strong>/etc/passwd</strong> - World-readable file because many system tools need it to map UIDs to usernames:</p>
            <pre><code>username:x:UID:GID:Comment:Home_Directory:Login_Shell</code></pre>
            <p>The <code>x</code> indicates that the password has been moved to <code>/etc/shadow</code></p>

            <p><strong>/etc/shadow</strong> - Secure password vault only readable by root or highly privileged processes:</p>
            <pre><code>username:hash:last_changed:min_age:max_age:warning:inactive:expire</code></pre>

            <p><strong>Security Note:</strong> If the password field for a user account in <code>/etc/passwd</code> is blank (no x and no hash), the system may allow the user to log in without any password. If x is missing but a hash is present, the system is using the old insecure method. RHEL defaults to shadowed x for security.</p>

            <h3>Password Management</h3>
            <ul>
                <li><code>chage &lt;user&gt;</code> - Modify the password aging policy for a user</li>
                <li><code>usermod -L &lt;user&gt;</code> - Lock the user account; the user cannot log in to the system</li>
                <li><code>usermod -s /sbin/nologin &lt;user&gt;</code> - Set nologin shell to prevent the user from logging into a command-line session while still allowing their account to run background services or authenticate for specific applications like email</li>
            </ul>
        `
    },
    3: {
        title: "Permissions & ACLs",
        content: `
            <h3>Basic Permissions</h3>
            <p><strong>rwx</strong> - Read, Write, Execute</p>
            <ul>
                <li><code>ls -l file</code> - Shows permissions and ownership of a file</li>
                <li><code>ls -ld /directory</code> - Shows information about the directory itself, not its contents</li>
            </ul>

            <h3>Change Permissions with Symbolic Method</h3>
            <p><strong>Syntax:</strong> <code>chmod who|what|which file|directory</code></p>

            <p><strong>Who (user categories):</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Symbol</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>u</code> (user)</td>
                        <td style="padding: 8px;">File owner</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>g</code> (group)</td>
                        <td style="padding: 8px;">File group members</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>o</code> (others)</td>
                        <td style="padding: 8px;">Users who are not the file owner and not group members</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>a</code> (all)</td>
                        <td style="padding: 8px;">All three categories</td>
                    </tr>
                </tbody>
            </table>

            <p><strong>What (operations):</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Symbol</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>+</code> (add)</td>
                        <td style="padding: 8px;">Add permissions to the file</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>-</code> (remove)</td>
                        <td style="padding: 8px;">Remove permissions from the file</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>=</code> (set exactly)</td>
                        <td style="padding: 8px;">Set exactly the specified permissions</td>
                    </tr>
                </tbody>
            </table>

            <p><strong>Which (permission types):</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Symbol</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>r</code> (read)</td>
                        <td style="padding: 8px;">Read access to file; listing access to directory</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>w</code> (write)</td>
                        <td style="padding: 8px;">Write permissions to file or directory</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>x</code> (execute)</td>
                        <td style="padding: 8px;">Execute permissions for the file; allows entering a directory and accessing files/subdirectories inside</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>X</code> (special)</td>
                        <td style="padding: 8px;">Execute permissions for a directory, or execute permissions for a file only if it already has at least one execute bit set</td>
                    </tr>
                </tbody>
            </table>

            <p><strong>Examples:</strong></p>
            <ul>
                <li><code>chmod go-rw file.txt</code> - Remove read and write permissions for group and others on file.txt</li>
                <li><code>chmod a+x script.sh</code> - Add execute permissions for everyone on script.sh</li>
                <li><code>chmod -R g+rwx /home/user/folder</code> - Recursively (-R) set permissions on files and subdirectories in the directory tree</li>
            </ul>

            <h3>Change Permissions with Octal Method</h3>
            <p><strong>Permission Calculation:</strong></p>
            <pre><code>U   | G   | O
rwx | rw- | r--
421 | 420 | 400
7   | 6   | 4

chmod 764 file</code></pre>

            <p><strong>Octal Values:</strong> r=4, w=2, x=1. Add them together for combined permissions.</p>

            <h3>Change Ownership</h3>
            <ul>
                <li><code>chown &lt;user&gt; &lt;file&gt;</code> - Grant ownership of the file to the specified user</li>
                <li><code>chown -R &lt;user&gt; &lt;directory&gt;</code> - Recursively grant ownership of the directory tree to the user</li>
                <li><code>chown :group &lt;file&gt;</code> - Change the group ownership of a file or directory</li>
                <li><code>chgrp group file</code> - Same as <code>chown :group file</code></li>
                <li><code>chown user:group &lt;file&gt;</code> - Change both the owner and group of a file or directory</li>
            </ul>

            <h3>Special Permissions</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Permission</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">File Effect</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Directory Effect</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>u+s</code> (setuid)<br><em>For running as root</em></td>
                        <td style="padding: 8px;">File executes as the user that owns the file, not as the user who ran it<br>Shows as <code>s</code> in user execute: <code>-rws------</code></td>
                        <td style="padding: 8px;">None</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>g+s</code> (setgid)<br><em>For collaboration</em></td>
                        <td style="padding: 8px;">File executes as the group that owns the file<br>Shows as <code>s</code> in group execute: <code>-rwxr-s---</code></td>
                        <td style="padding: 8px;">Files created in the directory inherit the group owner of the directory<br>Shows as <code>s</code> in group execute: <code>drwxr-s---</code></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>o+t</code> (sticky)<br><em>For shared folders</em></td>
                        <td style="padding: 8px;">None</td>
                        <td style="padding: 8px;">Users with write access can only remove files they own. They cannot remove or force saves to files owned by others<br>Shows as <code>t</code> in other execute: <code>drwxrwxrwt</code></td>
                    </tr>
                </tbody>
            </table>

            <p><strong>Special Permissions - Octal Method:</strong></p>
            <ul>
                <li><code>4</code> = setuid</li>
                <li><code>2</code> = setgid</li>
                <li><code>1</code> = sticky bit</li>
            </ul>

            <p><strong>Examples:</strong></p>
            <ul>
                <li><code>chmod 4755 file</code> - Set setuid + rwxr-xr-x</li>
                <li><code>chmod 2770 dir</code> - Set setgid + rwxrwx---</li>
                <li><code>chmod 1777 /tmp</code> - Set sticky bit + rwxrwxrwx</li>
                <li><code>chmod 0770 dir</code> - Remove special permissions (use 0 at the front)</li>
            </ul>

            <h3>Umask</h3>
            <p><strong>umask</strong> - Octal bitmask that automatically subtracts specific permissions from newly created files and directories.</p>
            <p><strong>Example:</strong> A umask of <code>0022</code> ensures new files are created as <code>644</code> (<code>-rw-r--r--</code>) and directories as <code>755</code> (<code>drwxr-xr-x</code>), preventing other users from writing to your data by default.</p>
        `
    },
    4: {
        title: "Shell Scripting",
        content: `
            <h3>Script Basics</h3>
            <p><strong>Shebang (First Line):</strong> Tells the system which interpreter to use:</p>
            <pre><code>#!/usr/bin/bash</code></pre>

            <p><strong>Making Scripts Executable:</strong></p>
            <pre><code>chmod +x script.sh                # Add execute permission
./script.sh                       # Run from current directory
/full/path/script.sh              # Run with absolute path</code></pre>

            <p><strong>Pro Tip:</strong> If script is in a directory listed in <code>\$PATH</code>, you can run it by name alone. Check with <code>echo \$PATH</code>.</p>

            <h3>Exit Codes</h3>
            <p><strong>EXAM CRITICAL:</strong> Scripts return exit codes to indicate success or failure.</p>
            <ul>
                <li><code>exit 0</code> - Success (no errors)</li>
                <li><code>exit 1-255</code> - Error codes (you define what each means)</li>
                <li><code>\$?</code> - Variable containing the exit code of the last command</li>
            </ul>

            <pre><code>#!/usr/bin/bash
echo "Hello, world"
exit 0                            # Explicit success

# Check exit code:
./script.sh
echo \$?                           # Displays: 0</code></pre>

            <p><strong>Note:</strong> If you don't specify <code>exit</code>, script returns the exit code of the last command run.</p>

            <h3>Quoting & Escaping</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Method</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Effect</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Example</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>\\</code> (backslash)</td>
                        <td style="padding: 8px;">Escape single character</td>
                        <td style="padding: 8px;"><code>echo \\# not a comment</code></td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>'single quotes'</code></td>
                        <td style="padding: 8px;">Literal text - escape EVERYTHING</td>
                        <td style="padding: 8px;"><code>echo '# \$VAR \$(cmd)'</code></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>"double quotes"</code></td>
                        <td style="padding: 8px;">Allow \$ and \$() substitution, stop globbing</td>
                        <td style="padding: 8px;"><code>echo "User: \$USER"</code></td>
                    </tr>
                </tbody>
            </table>

            <h3>For Loops</h3>
            <p><strong>Syntax:</strong> Process items from a list or range:</p>
            <pre><code>for VARIABLE in LIST; do
    echo \$VARIABLE
done

# Examples:
for file in *.txt; do
    echo "Processing \$file"
done

for i in {1..5}; do
    echo "Number \$i"
done

for user in alice bob charlie; do
    useradd \$user
done</code></pre>

            <h3>Conditional Statements</h3>
            <p><strong>If/Then:</strong></p>
            <pre><code>if [ \$COUNT -gt 10 ]; then
    echo "Count is greater than 10"
fi</code></pre>

            <p><strong>If/Then/Else:</strong></p>
            <pre><code>if [ -f /etc/hosts ]; then
    echo "File exists"
else
    echo "File not found"
fi</code></pre>

            <p><strong>If/Then/Elif/Else:</strong></p>
            <pre><code>if [ \$GRADE -ge 90 ]; then
    echo "A"
elif [ \$GRADE -ge 80 ]; then
    echo "B"
elif [ \$GRADE -ge 70 ]; then
    echo "C"
else
    echo "F"
fi</code></pre>

            <h3>Common Test Conditions</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Test</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>-f file</code></td>
                        <td style="padding: 8px;">File exists and is a regular file</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>-d dir</code></td>
                        <td style="padding: 8px;">Directory exists</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>-e file</code></td>
                        <td style="padding: 8px;">File or directory exists</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>-z string</code></td>
                        <td style="padding: 8px;">String is empty</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>-n string</code></td>
                        <td style="padding: 8px;">String is not empty</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>str1 = str2</code></td>
                        <td style="padding: 8px;">Strings are equal</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>num1 -eq num2</code></td>
                        <td style="padding: 8px;">Numbers are equal</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>num1 -ne num2</code></td>
                        <td style="padding: 8px;">Numbers are not equal</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>num1 -gt num2</code></td>
                        <td style="padding: 8px;">num1 greater than num2</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>num1 -lt num2</code></td>
                        <td style="padding: 8px;">num1 less than num2</td>
                    </tr>
                </tbody>
            </table>

            <h3>Regular Expressions - Quick Reference</h3>
            <p><strong>Line Anchors:</strong></p>
            <ul>
                <li><code>^</code> - Match beginning of line: <code>^cat</code> matches lines starting with "cat"</li>
                <li><code>\$</code> - Match end of line: <code>dog\$</code> matches lines ending with "dog"</li>
                <li><code>^cat\$</code> - Match exact line containing only "cat"</li>
            </ul>

            <p><strong>Common Patterns:</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background-color: rgba(255, 102, 102, 0.1); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Pattern</th>
                        <th style="padding: 8px; text-align: left; color: var(--text-primary);">Matches</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>.</code></td>
                        <td style="padding: 8px;">Any single character</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>*</code></td>
                        <td style="padding: 8px;">Preceding item zero or more times</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>+</code></td>
                        <td style="padding: 8px;">Preceding item one or more times</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>?</code></td>
                        <td style="padding: 8px;">Preceding item optional (0 or 1 time)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>{n}</code></td>
                        <td style="padding: 8px;">Preceding item exactly n times</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>[[:digit:]]</code></td>
                        <td style="padding: 8px;">Any digit (0-9)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 8px;"><code>[[:alpha:]]</code></td>
                        <td style="padding: 8px;">Any letter (a-z, A-Z)</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><code>[[:alnum:]]</code></td>
                        <td style="padding: 8px;">Any letter or digit</td>
                    </tr>
                </tbody>
            </table>

            <p><strong>Examples:</strong></p>
            <pre><code>grep '^root' /etc/passwd          # Lines starting with "root"
grep 'bash\$' /etc/passwd          # Lines ending with "bash"
grep '^[[:digit:]]' file.txt     # Lines starting with a digit
grep 'a.*b' file.txt             # Lines with 'a' followed by any chars then 'b'</code></pre>
        `
    },
    5: {
        title: "Storage: Partitions & LVM",
        content: `
            <h3>LVM - Logical Volume Manager</h3>
            <p><strong>KEY EXAM SKILL:</strong> The RHCSA heavily tests LVM creation and extension.</p>

            <h3>LVM Hierarchy</h3>
            <p>Physical Volume (PV) → Volume Group (VG) → Logical Volume (LV)</p>

            <h3>Essential Commands</h3>
            <ul>
                <li><code>pvcreate /dev/sdb1</code> - Initialize a partition as a Physical Volume</li>
                <li><code>vgcreate vg_name /dev/sdb1</code> - Create a Volume Group from PVs</li>
                <li><code>lvcreate -L 2G -n lv_name vg_name</code> - Create a 2GB Logical Volume</li>
                <li><code>lvextend -L +500M -r /dev/vg_name/lv_name</code> - Extend LV by 500MB and resize filesystem (-r flag is critical!)</li>
            </ul>

            <h3>Viewing Commands</h3>
            <ul>
                <li><code>pvs / pvdisplay / pvscan</code> - View Physical Volumes</li>
                <li><code>vgs / vgdisplay / vgscan</code> - View Volume Groups</li>
                <li><code>lvs / lvdisplay / lvscan</code> - View Logical Volumes</li>
            </ul>

            <p><strong>Pro Tip:</strong> The <code>-r</code> flag in <code>lvextend</code> automatically runs <code>xfs_growfs</code> or <code>resize2fs</code> to resize the filesystem. Without it, you'll have extra space but the filesystem won't use it!</p>
        `
    },
    6: {
        title: "Storage: File Systems",
        content: `
            <h3>Creating Filesystems</h3>
            <ul>
                <li><code>mkfs.xfs /dev/vg_data/lv_app</code> - Create XFS filesystem (RHEL 9 default)</li>
                <li><code>mkfs.ext4 /dev/sdc2</code> - Create EXT4 filesystem</li>
                <li><code>mkfs.vfat /dev/sde1</code> - Create FAT32 filesystem (USB compatibility)</li>
            </ul>

            <h3>/etc/fstab - Persistent Mounts</h3>
            <p><strong>CRITICAL:</strong> Use UUIDs, not device names! Device names can change.</p>
            <pre><code>UUID=xxxx-xxxx /data/apps xfs defaults 0 0</code></pre>
            <p>Get UUIDs with <code>blkid /dev/vg_data/lv_app</code></p>

            <h3>Swap Management</h3>
            <ul>
                <li><code>mkswap /dev/sdd1</code> - Format partition as swap</li>
                <li><code>swapon /dev/sdd1</code> - Activate swap</li>
                <li><code>swapoff /dev/sdd1</code> - Deactivate swap</li>
                <li><code>swapon --show</code> - List active swap</li>
            </ul>

            <h3>Mount Commands</h3>
            <ul>
                <li><code>mount /dev/vg_data/lv_app /data/apps</code> - Mount filesystem</li>
                <li><code>mount -o ro /dev/sde1 /mnt/usb</code> - Mount read-only</li>
                <li><code>findmnt /data/apps</code> - Verify mount</li>
            </ul>
        `
    },
    7: {
        title: "Remote Resources",
        content: `
            <p>Add your notes for Section 7: Remote Resources here.</p>
            <p><em>Covers: autofs, NFS mounts, /etc/auto.master.d/</em></p>
        `
    },
    8: {
        title: "Systemd & Processes",
        content: `
            <p>Add your notes for Section 8: Systemd & Processes here.</p>
            <p><em>Covers: systemctl, service management, targets, process control</em></p>
        `
    },
    9: {
        title: "System Tuning & Analysis",
        content: `
            <h3>Tuned - Performance Profiles</h3>
            <p><strong>NEW in EX200:</strong> System tuning with tuned daemon.</p>
            <ul>
                <li><code>tuned-adm list</code> - List available performance profiles</li>
                <li><code>tuned-adm active</code> - Show currently active profile</li>
                <li><code>tuned-adm profile throughput-performance</code> - Set profile for maximum throughput</li>
                <li><code>tuned-adm profile virtual-guest</code> - Optimize for VMs</li>
                <li><code>tuned-adm profile balanced</code> - General-purpose default</li>
            </ul>

            <h3>Journalctl - Advanced Log Analysis</h3>
            <p><strong>CRITICAL EXAM SKILL:</strong> Filtering logs efficiently.</p>
            <ul>
                <li><code>journalctl -u sshd</code> - Show logs for specific service</li>
                <li><code>journalctl -p err</code> - Show only error-level messages</li>
                <li><code>journalctl --since yesterday</code> - Time-based filtering</li>
                <li><code>journalctl --since "2024-01-01 10:00:00"</code> - Specific time</li>
                <li><code>journalctl -n 50 -f</code> - Last 50 lines + follow</li>
            </ul>

            <h3>Persistent Journal</h3>
            <p>By default, journal is stored in memory. To make it persistent across reboots:</p>
            <pre><code>mkdir /var/log/journal
systemctl restart systemd-journald</code></pre>
        `
    },
    10: {
        title: "Networking",
        content: `
            <p>Add your notes for Section 10: Networking here.</p>
            <p><em>Covers: nmcli, static IPv4/IPv6, hostname resolution</em></p>
        `
    },
    11: {
        title: "Network Security",
        content: `
            <h3>Firewalld - The RHCSA Way</h3>
            <p><strong>KEY CONCEPT:</strong> Always use <code>--permanent</code> and then <code>--reload</code>!</p>

            <h3>Essential Commands</h3>
            <ul>
                <li><code>firewall-cmd --get-default-zone</code> - Show default zone</li>
                <li><code>firewall-cmd --get-active-zones</code> - Show active zones</li>
                <li><code>firewall-cmd --list-all</code> - Show current runtime configuration</li>
                <li><code>firewall-cmd --permanent --list-all</code> - Show saved configuration</li>
            </ul>

            <h3>Adding Services</h3>
            <pre><code>firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload</code></pre>

            <h3>Adding Ports</h3>
            <pre><code>firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload</code></pre>

            <h3>Removing Rules</h3>
            <pre><code>firewall-cmd --permanent --remove-service=mysql
firewall-cmd --reload</code></pre>

            <p><strong>Pro Tip:</strong> <code>--reload</code> applies permanent rules without dropping active connections. <code>--complete-reload</code> drops everything.</p>
        `
    },
    12: {
        title: "SELinux Security",
        content: `
            <p>Add your notes for Section 12: SELinux Security here.</p>
            <p><em>Covers: Contexts, Booleans, port labeling, troubleshooting</em></p>
        `
    },
    13: {
        title: "Software Management",
        content: `
            <h3>DNF Package Management</h3>
            <p>Add DNF command notes here.</p>

            <h3>Flatpak - NEW in RHEL 9 EX200</h3>
            <p><strong>IMPORTANT:</strong> Flatpaks are now part of the official curriculum!</p>
            <ul>
                <li><code>flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo</code> - Add Flathub repository</li>
                <li><code>flatpak install flathub org.gnome.Calculator</code> - Install a Flatpak application</li>
                <li><code>flatpak list</code> - List installed Flatpaks</li>
                <li><code>flatpak update</code> - Update all Flatpaks</li>
            </ul>
        `
    },
    14: {
        title: "Task Scheduling",
        content: `
            <p>Add your notes for Section 14: Task Scheduling here.</p>
            <p><em>Covers: cron, at, systemd timers</em></p>
        `
    },
    15: {
        title: "Boot Process & Maintenance",
        content: `
            <h3>GRUB Configuration</h3>
            <ul>
                <li><code>grub2-mkconfig -o /boot/grub2/grub.cfg</code> - Regenerate GRUB config</li>
                <li><code>grubby --default-kernel</code> - Show default kernel</li>
                <li><code>grubby --set-default-index=N</code> - Set default kernel</li>
            </ul>

            <h3>Systemd Targets</h3>
            <ul>
                <li><code>systemctl get-default</code> - Show default target</li>
                <li><code>systemctl set-default multi-user.target</code> - Set text mode boot</li>
                <li><code>systemctl set-default graphical.target</code> - Set GUI mode boot</li>
                <li><code>systemctl isolate rescue.target</code> - Switch to rescue mode</li>
            </ul>

            <h3>Kernel Management</h3>
            <ul>
                <li><code>uname -r</code> - Show running kernel version</li>
                <li><code>dnf install kernel</code> - Install new kernel (keeps old)</li>
                <li><code>dracut -f</code> - Regenerate initramfs</li>
            </ul>

            <p><strong>Note:</strong> For root password reset procedures, see Section 19.</p>
        `
    },
    16: {
        title: "Rootless Containers",
        content: `
            <h3>Podman - Rootless Containers</h3>
            <p><strong>CRITICAL EXAM SKILL:</strong> Running containers as non-root with systemd integration.</p>

            <h3>Basic Container Operations</h3>
            <ul>
                <li><code>podman search registry.access.redhat.com/ubi9</code> - Search for images</li>
                <li><code>podman pull registry.access.redhat.com/ubi9/ubi</code> - Pull image</li>
                <li><code>podman run -d --name web-app -p 8080:80 httpd</code> - Run container</li>
                <li><code>podman ps</code> - List running containers</li>
                <li><code>podman ps -a</code> - List all containers</li>
            </ul>

            <h3>Systemd Integration - The "Auto-Start" Logic</h3>
            <p><strong>This is what most people forget!</strong></p>
            <pre><code># As user aaron:
podman generate systemd --name web-app --files
mkdir -p ~/.config/systemd/user
mv container-web-app.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now container-web-app.service

# THE CRITICAL STEP:
loginctl enable-linger aaron</code></pre>

            <p><strong>Why linger?</strong> Without it, user services stop when the user logs out. <code>enable-linger</code> keeps user services running even when not logged in.</p>
        `
    },
    17: {
        title: "Time Services",
        content: `
            <p>Add your notes for Section 17: Time Services here.</p>
            <p><em>Covers: timedatectl, chronyd, time zones, NTP synchronization</em></p>
        `
    },
    18: {
        title: "Flatpak",
        content: `
            <p>Add your notes for Section 18: Flatpak here.</p>
            <p><em>Covers: Flatpak installation, remotes, application management, permissions</em></p>
        `
    },
    19: {
        title: "Root Password Reset",
        content: `
            <h3>Root Password Reset - Critical RHCSA Skill</h3>
            <p><strong>EXAM SCENARIO:</strong> You cannot actually reboot in the browser, but you need to know the procedure!</p>

            <h3>Method 1: rd.break (Recommended)</h3>
            <ol>
                <li>Reboot the system and interrupt GRUB menu (press 'e')</li>
                <li>Find the line starting with 'linux' and append: <code>rd.break</code></li>
                <li>Press Ctrl+X to boot into emergency mode</li>
                <li>Remount /sysroot as read-write: <code>mount -o remount,rw /sysroot</code></li>
                <li>Change root into /sysroot: <code>chroot /sysroot</code></li>
                <li>Reset password: <code>passwd root</code></li>
                <li>Create SELinux relabel file: <code>touch /.autorelabel</code></li>
                <li>Exit chroot: <code>exit</code></li>
                <li>Exit emergency mode: <code>exit</code></li>
                <li>System reboots and relabels (this takes time!)</li>
            </ol>

            <h3>Method 2: init=/bin/bash (Alternative)</h3>
            <ol>
                <li>At GRUB, press 'e' to edit boot parameters</li>
                <li>Find the line starting with 'linux' and append: <code>init=/bin/bash</code></li>
                <li>Press Ctrl+X to boot</li>
                <li>Remount root as read-write: <code>mount -o remount,rw /</code></li>
                <li>Change password: <code>passwd root</code></li>
                <li>Create relabel file: <code>touch /.autorelabel</code></li>
                <li>Reboot: <code>exec /sbin/init</code></li>
            </ol>

            <h3>Critical Points</h3>
            <ul>
                <li><strong>Why /.autorelabel?</strong> You changed /etc/shadow outside of SELinux's control!</li>
                <li><strong>Why read-write?</strong> Default emergency mode mounts filesystems read-only</li>
                <li><strong>Why chroot?</strong> rd.break drops you in initramfs, not the real root filesystem</li>
                <li><strong>Exam tip:</strong> Practice the sequence until it's muscle memory!</li>
            </ul>
        `
    }
};

/**
 * Get notes for a specific section
 * @param {number} sectionId - The section ID (1-19)
 * @returns {object} Object containing title and content for the section's notes
 */
function getSectionNotes(sectionId) {
    return sectionNotes[sectionId] || {
        title: "Section Notes",
        content: "<p>No notes available for this section yet.</p>"
    };
}
