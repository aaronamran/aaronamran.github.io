const section4Data = {
    id: 4,
    title: "Shell Scripting",
    description: "Create and manage bash shell scripts",
    totalPoints: 109,
    questionSets: {
        // Set 1: Bash script basics
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Edit hello.sh: add #!/bin/bash on line 1, then use echo to print 'Hello World'.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["hello.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["echo", "Hello World"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["hello.sh"] }
                ],
                explanation: "A bash script must start with #!/bin/bash and use echo to print output.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Make hello.sh executable.",
                expected: [
                    { command: "chmod", requiredValues: ["+x", "hello.sh"] },
                    { command: "chmod", requiredValues: ["755", "hello.sh"] }
                ],
                explanation: "Scripts need execute permission to run directly.",
                points: 1
            },
            {
                id: 3,
                category: "Implementation",
                description: "Execute the hello.sh script.",
                expected: [
                    { command: "./hello.sh", requiredValues: [] },
                    { command: "bash", requiredValues: ["hello.sh"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["hello.sh"] }
                ],
                explanation: "Can run as ./script.sh (needs +x) or bash script.sh (doesn't need +x).",
                points: 1
            },
            {
                id: 4,
                category: "Audit",
                description: "Edit userinfo.sh: add #!/bin/bash, assign MY_USER=$USER and MY_HOST=$(hostname), then echo both variables.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["userinfo.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["$USER", "hostname", "echo"],
                            mustContainAny: ["MY_USER", "MY_HOST"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["userinfo.sh"] }
                ],
                explanation: "Variables: USER=$USER, HOST=$(hostname), NAME=\"value\"",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Display userinfo.sh syntax without executing it.",
                expected: [
                    { command: "bash", requiredFlags: ["-n"], requiredValues: ["userinfo.sh"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["userinfo.sh"] }
                ],
                explanation: "bash -n checks syntax only. bash -x debugs with tracing.",
                points: 1
            },
            {
                id: 6,
                category: "Audit",
                description: "Edit args.sh: add #!/bin/bash, echo $1, $2, and $3 for each positional argument, and echo $# to show the total count.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["args.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasVariable: ["1", "2", "3"],
                            mustContain: ["$#", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["args.sh"] }
                ],
                explanation: "$1, $2... are positional params. $# is count. $@ is all args.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Test args.sh by running it with 3 arguments, e.g.: ./args.sh one two three",
                expected: [
                    { command: "./args.sh", requiredValues: [] },
                    { command: "bash", requiredValues: ["args.sh"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["args.sh"] }
                ],
                explanation: "Script receives arguments as $1, $2, $3, etc.",
                points: 1
            },
            {
                id: 8,
                category: "Audit",
                description: "Edit checkargs.sh: add #!/bin/bash. If $# -ne 2, echo 'Usage: checkargs.sh arg1 arg2' and exit 1.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["checkargs.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasIfStatement: true,
                            hasFiClosing: true,
                            mustContain: ["$#", "exit"],
                            mustContainAny: ["[ $#", "[[ $#", "test $#"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["checkargs.sh"] }
                ],
                explanation: "if [ $# -ne 2 ]; then echo 'Need 2 args'; exit 1; fi. Also accepts [[ ]] or test command.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Edit documented.sh: add #!/bin/bash, include at least two # comment lines describing the script's purpose, then add an echo command.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["documented.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["#", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["documented.sh"] }
                ],
                explanation: "# starts comment line. Good practice for maintainability.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Run documented.sh with verbose debugging enabled.",
                expected: [
                    { command: "bash", requiredFlags: ["-x"], requiredValues: ["documented.sh"] },
                    { command: "set", requiredFlags: ["-x"], requiredValues: [] }
                ],
                explanation: "bash -x shows each command before executing. Useful for debugging.",
                points: 1
            }
        ],
        
        // Set 2: Conditionals and tests
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Edit filecheck.sh: add #!/bin/bash. Check if /etc/hosts exists with [ -f ]; echo 'File exists' if true, else echo 'File not found'.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["filecheck.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasIfStatement: true,
                            hasElseStatement: true,
                            hasFiClosing: true,
                            mustContainAny: ["[ -f", "[ -e", "[ -d", "[[ -f", "[[ -e", "[[ -d", "test -f", "test -e", "test -d"],
                            mustContain: ["/etc/hosts", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["filecheck.sh"] }
                ],
                explanation: "if [ -f filename ]; then ... else ... fi. Also accepts [[ ]] or test command. Common tests: -f (file), -d (dir), -e (exists).",
                points: 2
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
                points: 1
            },
            {
                id: 3,
                category: "Implementation",
                description: "Edit ensuredir.sh: add #!/bin/bash. If /tmp/mydir does not exist (! -d), create it with mkdir -p /tmp/mydir and echo 'Directory created'.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["ensuredir.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasIfStatement: true,
                            hasFiClosing: true,
                            mustContainAny: ["[ ! -d", "[ -d", "[[ ! -d", "[[ -d", "test ! -d", "test -d"],
                            mustContain: ["mkdir", "/tmp/mydir", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["ensuredir.sh"] }
                ],
                explanation: "if [ ! -d /path ]; then mkdir -p /path; fi. Also accepts [[ ]] or test command.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Test string comparison: check if two variables are equal.",
                expected: [
                    { command: "[", requiredValues: ["\"$VAR1\"", "=", "\"$VAR2\"", "]"] },
                    { command: "test", requiredValues: ["\"$VAR1\"", "=", "\"$VAR2\""] }
                ],
                explanation: "Always quote variables in tests to handle empty values.",
                points: 1
            },
            {
                id: 5,
                category: "Audit",
                description: "Test if string is empty or non-empty.",
                expected: [
                    { command: "[", requiredValues: ["-z", "\"$VAR\"", "]"] },
                    { command: "[", requiredValues: ["-n", "\"$VAR\"", "]"] }
                ],
                explanation: "-z tests if zero length (empty). -n tests if non-zero length.",
                points: 1
            }
        ],
        
        // Set 3: Loops
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Edit forloop.sh: add #!/bin/bash. Use for NAME in alice bob charlie; do echo \"Hello, $NAME\"; done to greet each name.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["forloop.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasForLoop: true,
                            mustContain: ["alice", "echo", "$NAME"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["forloop.sh"] }
                ],
                explanation: "for name in list; do commands; done",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Edit readlines.sh: add #!/bin/bash. Use: while read LINE; do echo \"$LINE\"; done < /etc/hostname to print each line of the file.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["readlines.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasWhileLoop: true,
                            mustContain: ["read", "/etc/hostname", "echo", "$LINE"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["readlines.sh"] }
                ],
                explanation: "while read line; do echo $line; done < file.txt",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Edit processfiles.sh: add #!/bin/bash. Use for FILE in /etc/*.conf; do echo \"$FILE\"; done to print each config file name.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["processfiles.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasForLoop: true,
                            mustContain: ["/etc/", ".conf", "echo", "$FILE"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["processfiles.sh"] }
                ],
                explanation: "for file in /path/*; do ...; done. Globbing expands wildcards.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Edit count.sh: add #!/bin/bash. Use for ((i=1; i<=10; i++)); do echo \"$i\"; done to count and print numbers 1 through 10.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["count.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasForLoop: true,
                            mustContain: ["((", "echo", "$i"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["count.sh"] }
                ],
                explanation: "for ((i=1; i<=10; i++)); do echo $i; done",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Edit infinite.sh: add #!/bin/bash. Use while true; do echo 'Running...'; sleep 5; done to loop indefinitely.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["infinite.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasWhileLoop: true,
                            mustContain: ["true", "sleep", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["infinite.sh"] }
                ],
                explanation: "while true; do commands; sleep 5; done. Use Ctrl+C to stop.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Edit waitfile.sh: add #!/bin/bash. Use until [ -f /tmp/flag ]; do sleep 2; done, then echo 'Flag found!' once the file appears.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["waitfile.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContainAny: ["[ -f", "[[ -f", "test -f"],
                            mustContain: ["until", "/tmp/flag", "sleep", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["waitfile.sh"] }
                ],
                explanation: "until [ -f /tmp/flag ]; do sleep 2; done. Loops until condition true.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Edit breakloop.sh: add #!/bin/bash. Use for i in 1 2 3 4 5; do if [ $i -eq 3 ]; then echo 'Breaking at 3'; break; fi; done.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["breakloop.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasForLoop: true,
                            hasIfStatement: true,
                            hasFiClosing: true,
                            mustContain: ["do", "then", "$i", "break", "echo", "[ ", " ]"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["breakloop.sh"] }
                ],
                explanation: "break exits current loop. break 2 exits two nested loops.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Edit continueloop.sh: add #!/bin/bash. Use for i in 1 2 3 4 5; do if [ $((i%2)) -eq 0 ]; then continue; fi; echo \"$i\"; done to skip even numbers.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["continueloop.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasForLoop: true,
                            hasIfStatement: true,
                            hasFiClosing: true,
                            mustContain: ["do", "then", "$i", "continue", "echo", "[ ", " ]"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["continueloop.sh"] }
                ],
                explanation: "continue skips remaining loop body, starts next iteration.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Edit nested.sh: add #!/bin/bash. for i in 1 2 3; do for j in A B C; do echo \"$i $j\"; done; done to print all pairs like '1 A', '1 B'.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["nested.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasForLoop: true,
                            mustContain: ["echo", "$"],
                            matchesPattern: { "for \\w+ in": 2 }
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["nested.sh"] }
                ],
                explanation: "for i in 1 2 3; do for j in a b c; do echo $i$j; done; done",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Edit loopargs.sh: add #!/bin/bash. Use for arg in \"$@\"; do echo \"Arg: $arg\"; done to print each argument passed to the script.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["loopargs.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasForLoop: true,
                            mustContain: ["$@", "echo", "$arg"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["loopargs.sh"] }
                ],
                explanation: "for arg in \"$@\"; do echo $arg; done. Preserves spaces in args.",
                points: 2
            }
        ],
        
        // Set 4: Functions and exit codes
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Edit functions.sh: add #!/bin/bash. Define greet() { echo 'Hello from function'; } and call it by name at the end.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["functions.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasFunction: true,
                            mustContain: ["echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["functions.sh"] }
                ],
                explanation: "function_name() { commands; }. Call with: function_name",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Edit funcparams.sh: add #!/bin/bash. Define greet() that echoes 'Hello, $1'. Call it with: greet 'World'.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["funcparams.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasFunction: true,
                            mustContain: ["$1", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["funcparams.sh"] }
                ],
                explanation: "Inside function: $1, $2 are function args, not script args.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Edit returnvalue.sh: add #!/bin/bash. Define check() that returns 0 on success or 1 on failure. Echo $? after calling it to see the exit code.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["returnvalue.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasFunction: true,
                            mustContain: ["return", "echo", "$?"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["returnvalue.sh"] }
                ],
                explanation: "return sets exit code (0-255). Check with $? after calling.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Edit echovalue.sh: add #!/bin/bash. Define get_date() that echoes $(date). Capture it: result=$(get_date), then echo $result.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["echovalue.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasFunction: true,
                            mustContain: ["echo", "result"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["echovalue.sh"] }
                ],
                explanation: "result=$(function_name). Captures stdout, not exit code.",
                points: 2
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
                description: "Edit exitcodes.sh: add #!/bin/bash. Echo 'Script starting', then exit 2 to signal an error condition.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["exitcodes.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["exit", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["exitcodes.sh"] }
                ],
                explanation: "exit 0 (success), exit 1 (general error). Conventional codes up to 255.",
                points: 1
            },
            {
                id: 7,
                category: "Implementation",
                description: "Edit localvars.sh: add #!/bin/bash. Define test_scope() with local MY_VAR='hello'; echo $MY_VAR inside the function, then call it.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["localvars.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            hasFunction: true,
                            mustContain: ["local", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["localvars.sh"] }
                ],
                explanation: "local var=value. Local scope only within function.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Edit sete.sh: add #!/bin/bash and set -e near the top. Echo 'Start', then include a command that will fail (e.g. ls /no/such/dir) to trigger automatic exit.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["sete.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["set -e", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["sete.sh"] }
                ],
                explanation: "set -e exits script if any command fails. set +e disables.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Edit setu.sh: add #!/bin/bash and set -u near the top. Then echo $UNDEFINED_VAR to deliberately trigger an unset variable error.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["setu.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["set -u", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["setu.sh"] }
                ],
                explanation: "set -u (or set -o nounset) fails on undefined variable reference.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Edit trap.sh: add #!/bin/bash. Use trap 'echo Cleaning up...' EXIT so the cleanup message prints automatically when the script finishes.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["trap.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["trap", "echo", "EXIT"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["trap.sh"] }
                ],
                explanation: "trap 'cleanup_commands' EXIT. Runs cleanup on script exit.",
                points: 3
            }
        ],
        
        // Set 5: Input/output and redirection
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Edit readinput.sh: add #!/bin/bash. Use read -p 'Enter your name: ' NAME and then echo \"Hello, $NAME\".",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["readinput.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["read", "-p", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["readinput.sh"] }
                ],
                explanation: "read -p 'Prompt: ' VARNAME. Stores input in variable.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Read input without echoing (for passwords).",
                expected: [
                    { command: "read", requiredFlags: ["-s"], requiredValues: [] }
                ],
                allowedPreChecks: [],
                explanation: "read -s hides input as typed. Use for sensitive data.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Edit timeout.sh: add #!/bin/bash. Use read -t 5 -p 'Enter input: ' REPLY; if REPLY is empty, echo 'Timed out'.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["timeout.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["read", "-t", "echo"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["timeout.sh"] }
                ],
                explanation: "read -t 10. Waits 10 seconds, continues if no input.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Redirect stdout to file.",
                expected: [
                    { command: "echo", requiredValues: ["'test'", ">", "/tmp/output.txt"] }
                ],
                allowedPreChecks: [],
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
                allowedPreChecks: [],
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
                allowedPreChecks: [],
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
                description: "Edit logging.sh: add #!/bin/bash. Run df -h and pipe through tee /tmp/disk.log to display output on screen and save it to a file.",
                expected: [
                    { 
                        command: "vi", 
                        requiredValues: ["logging.sh"],
                        scriptValidation: {
                            hasBashShebang: true,
                            mustContain: ["tee", "df"]
                        }
                    }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["logging.sh"] }
                ],
                explanation: "command | tee logfile. Shows output AND saves to file.",
                points: 2
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
                description: "Create array: arr=(one two three), then echo ${arr[0]} to print the first element 'one'.",
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

