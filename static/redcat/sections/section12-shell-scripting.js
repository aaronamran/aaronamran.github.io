const section12Data = {
    id: 12,
    title: "Shell Scripting & Automation",
    description: "Create and manage bash shell scripts",
    totalPoints: 28,
    questionSets: {
        // Set 1: Bash script basics
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Create a simple bash script that prints 'Hello World'.",
                expected: [
                    { command: "echo", requiredValues: ["'#!/bin/bash'", ">", "/root/hello.sh"] },
                    { command: "vi", requiredValues: ["/root/hello.sh"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/root/hello.sh"] }
                ],
                explanation: "#!/bin/bash shebang line specifies bash interpreter.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Make the script executable.",
                expected: [
                    { command: "chmod", requiredValues: ["+x", "/root/hello.sh"] },
                    { command: "chmod", requiredValues: ["755", "/root/hello.sh"] }
                ],
                explanation: "Scripts need execute permission to run directly.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Execute the script.",
                expected: [
                    { command: "/root/hello.sh", requiredValues: [] },
                    { command: "bash", requiredValues: ["/root/hello.sh"] },
                    { command: "./hello.sh", requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/root/hello.sh"] }
                ],
                explanation: "Can run as ./script.sh (needs +x) or bash script.sh (doesn't need +x).",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Create script with variables for username and hostname.",
                expected: [
                    { command: "vi", requiredValues: ["/root/userinfo.sh"] }
                ],
                explanation: "Variables: USER=$USER, HOST=$(hostname), NAME=\"value\"",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Display script syntax without executing it.",
                expected: [
                    { command: "bash", requiredFlags: ["-n"], requiredValues: ["/root/userinfo.sh"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/root/userinfo.sh"] }
                ],
                explanation: "bash -n checks syntax only. bash -x debugs with tracing.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Create script accepting command-line arguments.",
                expected: [
                    { command: "vi", requiredValues: ["/root/args.sh"] }
                ],
                explanation: "$1, $2... are positional params. $# is count. $@ is all args.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Test command-line argument script with 3 arguments.",
                expected: [
                    { command: "/root/args.sh", requiredValues: ["arg1", "arg2", "arg3"] },
                    { command: "bash", requiredValues: ["/root/args.sh", "first", "second", "third"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/root/args.sh"] }
                ],
                explanation: "Script receives arguments as $1, $2, $3, etc.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Create script that checks if two arguments were provided.",
                expected: [
                    { command: "vi", requiredValues: ["/root/checkargs.sh"] }
                ],
                explanation: "if [ $# -ne 2 ]; then echo 'Need 2 args'; exit 1; fi",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Create script with comments explaining each section.",
                expected: [
                    { command: "vi", requiredValues: ["/root/documented.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "# starts comment line. Good practice for maintainability.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Run script with verbose debugging enabled.",
                expected: [
                    { command: "bash", requiredFlags: ["-x"], requiredValues: ["/root/documented.sh"] },
                    { command: "set", requiredFlags: ["-x"], requiredValues: [] }
                ],
                explanation: "bash -x shows each command before executing. Useful for debugging.",
                points: 2
            }
        ],
        
        // Set 2: Conditionals and tests
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Create script with if-then-else checking if file exists.",
                expected: [
                    { command: "vi", requiredValues: ["/root/filecheck.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "if [ -f filename ]; then ... fi. Common tests: -f (file), -d (dir), -e (exists).",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Test if /etc/passwd exists using test command.",
                expected: [
                    { command: "test", requiredFlags: ["-f"], requiredValues: ["/etc/passwd"] },
                    { command: "[", requiredValues: ["-f", "/etc/passwd", "]"] }
                ],
                explanation: "test -f file and [ -f file ] are equivalent. Exit code 0=true.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create script checking if directory exists, create if not.",
                expected: [
                    { command: "vi", requiredValues: ["/root/ensuredir.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "if [ ! -d /path ]; then mkdir -p /path; fi",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Create script comparing two numbers with if-elif-else.",
                expected: [
                    { command: "vi", requiredValues: ["/root/compare.sh"] }
                ],
                explanation: "Numeric: -eq, -ne, -lt, -le, -gt, -ge. String: =, !=",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create script using case statement for menu selection.",
                expected: [
                    { command: "vi", requiredValues: ["/root/menu.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "case $var in pattern1) ...;; pattern2) ...;; *) default;; esac",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Test string comparison: check if two variables are equal.",
                expected: [
                    { command: "[", requiredValues: ["\"$VAR1\"", "=", "\"$VAR2\"", "]"] },
                    { command: "test", requiredValues: ["\"$VAR1\"", "=", "\"$VAR2\""] }
                ],
                explanation: "Always quote variables in tests to handle empty values.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Create script checking if user is root (UID 0).",
                expected: [
                    { command: "vi", requiredValues: ["/root/checkroot.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "if [ $(id -u) -ne 0 ]; then echo 'Must be root'; exit 1; fi",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Create script with file permission checks.",
                expected: [
                    { command: "vi", requiredValues: ["/root/perms.sh"] }
                ],
                explanation: "Tests: -r (readable), -w (writable), -x (executable), -s (non-zero size).",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Create script using && and || for conditional execution.",
                expected: [
                    { command: "vi", requiredValues: ["/root/shortcircuit.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "command1 && command2 (run cmd2 if cmd1 succeeds). || runs if fails.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Test if string is empty or non-empty.",
                expected: [
                    { command: "[", requiredValues: ["-z", "\"$VAR\"", "]"] },
                    { command: "[", requiredValues: ["-n", "\"$VAR\"", "]"] }
                ],
                explanation: "-z tests if zero length (empty). -n tests if non-zero length.",
                points: 2
            }
        ],
        
        // Set 3: Loops
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Create script with for loop iterating over list of names.",
                expected: [
                    { command: "vi", requiredValues: ["/root/forloop.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "for name in list; do commands; done",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Create for loop processing all files in directory.",
                expected: [
                    { command: "vi", requiredValues: ["/root/processfiles.sh"] }
                ],
                explanation: "for file in /path/*; do ...; done. Globbing expands wildcards.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create C-style for loop counting from 1 to 10.",
                expected: [
                    { command: "vi", requiredValues: ["/root/count.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "for ((i=1; i<=10; i++)); do echo $i; done",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Create while loop reading lines from file.",
                expected: [
                    { command: "vi", requiredValues: ["/root/readlines.sh"] }
                ],
                explanation: "while read line; do echo $line; done < file.txt",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create infinite while loop with sleep.",
                expected: [
                    { command: "vi", requiredValues: ["/root/infinite.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "while true; do commands; sleep 5; done. Use Ctrl+C to stop.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Create until loop that waits for file creation.",
                expected: [
                    { command: "vi", requiredValues: ["/root/waitfile.sh"] }
                ],
                explanation: "until [ -f /tmp/flag ]; do sleep 2; done. Loops until condition true.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Use break to exit loop early based on condition.",
                expected: [
                    { command: "vi", requiredValues: ["/root/breakloop.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "break exits current loop. break 2 exits two nested loops.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Use continue to skip to next iteration.",
                expected: [
                    { command: "vi", requiredValues: ["/root/continueloop.sh"] }
                ],
                explanation: "continue skips remaining loop body, starts next iteration.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Create nested loops (loop within loop).",
                expected: [
                    { command: "vi", requiredValues: ["/root/nested.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "for i in 1 2 3; do for j in a b c; do echo $i$j; done; done",
                points: 4
            },
            {
                id: 10,
                category: "Audit",
                description: "Loop through command-line arguments.",
                expected: [
                    { command: "vi", requiredValues: ["/root/loopargs.sh"] }
                ],
                explanation: "for arg in \"$@\"; do echo $arg; done. Preserves spaces in args.",
                points: 3
            }
        ],
        
        // Set 4: Functions and exit codes
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Create script with function definition and call.",
                expected: [
                    { command: "vi", requiredValues: ["/root/functions.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "function_name() { commands; }. Call with: function_name",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Create function accepting parameters.",
                expected: [
                    { command: "vi", requiredValues: ["/root/funcparams.sh"] }
                ],
                explanation: "Inside function: $1, $2 are function args, not script args.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create function that returns value using return.",
                expected: [
                    { command: "vi", requiredValues: ["/root/returnvalue.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "return sets exit code (0-255). Check with $? after calling.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Create function that outputs value using echo.",
                expected: [
                    { command: "vi", requiredValues: ["/root/echovalue.sh"] }
                ],
                explanation: "result=$(function_name). Captures stdout, not exit code.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Check exit code of last command.",
                expected: [
                    { command: "echo", requiredValues: ["$?"] }
                ],
                allowedPreChecks: [],
                explanation: "$? contains exit code. 0=success, non-zero=failure.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Create script that exits with specific error code.",
                expected: [
                    { command: "vi", requiredValues: ["/root/exitcodes.sh"] }
                ],
                explanation: "exit 0 (success), exit 1 (general error). Conventional codes up to 255.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Create function with local variables.",
                expected: [
                    { command: "vi", requiredValues: ["/root/localvars.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "local var=value. Local scope only within function.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Use set -e to exit on any error.",
                expected: [
                    { command: "vi", requiredValues: ["/root/sete.sh"] }
                ],
                explanation: "set -e exits script if any command fails. set +e disables.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Use set -u to treat unset variables as errors.",
                expected: [
                    { command: "vi", requiredValues: ["/root/setu.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "set -u (or set -o nounset) fails on undefined variable reference.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Create script with error handling using trap.",
                expected: [
                    { command: "vi", requiredValues: ["/root/trap.sh"] }
                ],
                explanation: "trap 'cleanup_commands' EXIT. Runs cleanup on script exit.",
                points: 4
            }
        ],
        
        // Set 5: Input/output and redirection
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Create script that reads user input.",
                expected: [
                    { command: "vi", requiredValues: ["/root/readinput.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "read -p 'Prompt: ' VARNAME. Stores input in variable.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Read input without echoing (for passwords).",
                expected: [
                    { command: "read", requiredFlags: ["-s"], requiredValues: [] }
                ],
                explanation: "read -s hides input as typed. Use for sensitive data.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create script with timeout for user input.",
                expected: [
                    { command: "vi", requiredValues: ["/root/timeout.sh"] }
                ],
                allowedPreChecks: [],
                explanation: "read -t 10. Waits 10 seconds, continues if no input.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Redirect stdout to file.",
                expected: [
                    { command: "echo", requiredValues: ["'test'", ">", "/tmp/output.txt"] }
                ],
                explanation: "> overwrites file. >> appends. 1> explicit stdout redirect.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Redirect stderr to file separately from stdout.",
                expected: [
                    { command: "command", requiredValues: ["2>", "/tmp/errors.txt"] }
                ],
                allowedPreChecks: [],
                explanation: "2> redirects stderr. Can use both: cmd > out.txt 2> err.txt",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Redirect both stdout and stderr to same file.",
                expected: [
                    { command: "command", requiredValues: [">", "/tmp/all.txt", "2>&1"] },
                    { command: "command", requiredValues: ["&>", "/tmp/all.txt"] }
                ],
                explanation: "2>&1 sends stderr to wherever stdout goes. &> is shortcut.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Discard output by redirecting to /dev/null.",
                expected: [
                    { command: "command", requiredValues: [">", "/dev/null", "2>&1"] }
                ],
                allowedPreChecks: [],
                explanation: "/dev/null discards all data. Silences command completely.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Use here document to provide multi-line input.",
                expected: [
                    { command: "cat", requiredValues: ["<<", "EOF"] }
                ],
                explanation: "cat << EOF ... EOF. Input until delimiter (EOF) reached.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Use here string to provide single-line input.",
                expected: [
                    { command: "grep", requiredValues: ["pattern", "<<<", "'text'"] }
                ],
                allowedPreChecks: [],
                explanation: "<<< 'string'. Passes string as stdin to command.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Create script logging all output to file with tee.",
                expected: [
                    { command: "vi", requiredValues: ["/root/logging.sh"] }
                ],
                explanation: "command | tee logfile. Shows output AND saves to file.",
                points: 3
            }
        ],
        
        // Set 6: String and array operations
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Extract substring from variable.",
                expected: [
                    { command: "echo", requiredValues: ["${VAR:0:5}"] }
                ],
                allowedPreChecks: [],
                explanation: "${VAR:start:length}. Extracts substring from position.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Get length of string variable.",
                expected: [
                    { command: "echo", requiredValues: ["${#VAR}"] }
                ],
                explanation: "${#VAR} returns character count of variable value.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Replace pattern in variable (substitution).",
                expected: [
                    { command: "echo", requiredValues: ["${VAR/old/new}"] },
                    { command: "echo", requiredValues: ["${VAR//old/new}"] }
                ],
                allowedPreChecks: [],
                explanation: "${VAR/pattern/replacement}. Single /= first match, //= all matches.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Remove prefix from variable.",
                expected: [
                    { command: "echo", requiredValues: ["${VAR#prefix}"] }
                ],
                explanation: "${VAR#pattern} removes shortest match. ${VAR##pattern} removes longest.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Remove suffix from variable.",
                expected: [
                    { command: "echo", requiredValues: ["${VAR%suffix}"] }
                ],
                allowedPreChecks: [],
                explanation: "${VAR%pattern} removes shortest match. ${VAR%%pattern} removes longest.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Set default value if variable is unset.",
                expected: [
                    { command: "echo", requiredValues: ["${VAR:-default}"] }
                ],
                explanation: "${VAR:-value} uses value if VAR unset/null. Doesn't modify VAR.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Create array and access elements.",
                expected: [
                    { command: "arr=(one", requiredValues: ["two", "three)"] },
                    { command: "echo", requiredValues: ["${arr[0]}"] }
                ],
                allowedPreChecks: [],
                explanation: "arr=(val1 val2 val3). Access: ${arr[index]}. Index starts at 0.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Display all array elements.",
                expected: [
                    { command: "echo", requiredValues: ["${arr[@]}"] },
                    { command: "echo", requiredValues: ["${arr[*]}"] }
                ],
                explanation: "${arr[@]} expands to separate words. ${arr[*]} single word.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Get array length (number of elements).",
                expected: [
                    { command: "echo", requiredValues: ["${#arr[@]}"] }
                ],
                allowedPreChecks: [],
                explanation: "${#arr[@]} counts array elements. ${#arr[i]} is length of element i.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Loop through array elements.",
                expected: [
                    { command: "for", requiredValues: ["item", "in", "${arr[@]}"] }
                ],
                explanation: "for item in \"${arr[@]}\"; do echo $item; done",
                points: 3
            }
        ]
    }
};
