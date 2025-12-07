# Bash Interpreter - RHCSA Simulator

Full bash script interpreter for RHCSA exam practice.

## Architecture

The interpreter consists of four modular components:

1. **Lexer** (`lexer.js`) - Tokenizes bash syntax
2. **Parser** (`parser.js`) - Builds Abstract Syntax Tree (AST)
3. **Executor** (`executor.js`) - Executes AST nodes
4. **Interpreter** (`interpreter.js`) - Main integration layer

## Features Implemented

### Control Structures
- `if/then/else/elif/fi` - Conditional execution
- `for var in list; do ... done` - For loops
- `while condition; do ... done` - While loops
- `until condition; do ... done` - Until loops (inverse of while)
- `case $var in pattern) ... ;; esac` - Case statements
- `break`, `continue`, `return` - Flow control

### Test Conditions
- `[ ]` - POSIX test (single bracket)
- `[[ ]]` - Bash advanced test (double bracket)
- `test` command

**Operators:**
- String: `=`, `==`, `!=`, `-z`, `-n`
- Numeric: `-eq`, `-ne`, `-lt`, `-le`, `-gt`, `-ge`
- File: `-f`, `-d`, `-e`, `-r`, `-w`, `-x`
- Logical: `!` (negation)

### Functions
```bash
function greet {
    echo "Hello $1"
    return 0
}

greet World
```

### Variables
- Local variables: `var=value`
- Environment: `export VAR=value`
- Local scope: `local var=value`
- Special variables: `$?`, `$#`, `$@`, `$*`, `$0-$9`

### Command Substitution
- `$(command)` - Modern syntax
- `` `command` `` - Legacy backticks

### Redirections
- `>` - Redirect stdout
- `>>` - Append stdout
- `<` - Redirect stdin
- `2>` - Redirect stderr
- `2>&1` - Redirect stderr to stdout

### Operators
- `|` - Pipeline
- `&&` - AND (execute if previous succeeds)
- `||` - OR (execute if previous fails)
- `;` - Command separator
- `&` - Background execution (parsed but not fully implemented)

### Built-in Commands
- `export`, `local`, `declare`, `readonly` - Variable management
- `unset` - Remove variables
- `echo` - Print text
- `source`, `.` - Execute script in current shell
- `eval` - Evaluate string as command
- `shift` - Shift positional parameters
- `exit` - Exit with code
- `read` - Read input (simplified in browser)
- `true`, `false` - Boolean commands

## Usage Examples

### Simple Script
```bash
#!/bin/bash
echo "Hello, World!"
```

Run with:
```bash
bash script.sh
```

### With Arguments
```bash
#!/bin/bash
echo "Script name: $0"
echo "First arg: $1"
echo "All args: $@"
echo "Arg count: $#"
```

Run with:
```bash
bash script.sh arg1 arg2 arg3
```

### If Statement
```bash
#!/bin/bash
if [ "$1" = "hello" ]; then
    echo "World"
elif [ "$1" = "goodbye" ]; then
    echo "Farewell"
else
    echo "Unknown greeting"
fi
```

### For Loop
```bash
#!/bin/bash
for file in /etc/*.conf; do
    echo "Config: $file"
done
```

### While Loop
```bash
#!/bin/bash
counter=0
while [ $counter -lt 5 ]; do
    echo "Count: $counter"
    counter=$((counter + 1))
done
```

### Case Statement
```bash
#!/bin/bash
case "$1" in
    start)
        echo "Starting service..."
        ;;
    stop)
        echo "Stopping service..."
        ;;
    *)
        echo "Usage: $0 {start|stop}"
        exit 1
        ;;
esac
```

### Functions
```bash
#!/bin/bash
function backup {
    local source=$1
    local dest=$2
    echo "Backing up $source to $dest"
    cp -r "$source" "$dest"
    return $?
}

backup /etc/config /backup/config
echo "Backup completed with exit code: $?"
```

## RHCSA Exam Relevance

Essential for:
- Automating system administration tasks
- Creating backup scripts
- User management automation
- Service deployment
- Configuration management
- Cron job scripts
- System monitoring

## Limitations

Browser-based implementation has some constraints:
- No interactive `read` (sets empty value)
- Background jobs (`&`) parsed but not executed asynchronously
- No subshells or process substitution
- No signal handling
- Simplified globbing
- No job control

These limitations don't affect RHCSA exam prep significantly since the exam focuses on practical scripting rather than advanced bash features.

## Implementation Notes

- Fully synchronous execution (simplified for browser)
- Integrates with virtual filesystem
- Respects file permissions
- Variable scoping with function-local variables
- Exit code propagation throughout
- Real bash behavior for exam practice
