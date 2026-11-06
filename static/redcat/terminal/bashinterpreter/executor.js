// Bash Executor - Executes AST nodes
// Runs parsed bash commands with proper scoping and control flow

class BashExecutor {
    constructor(commands, filesystem) {
        this.commands = commands; // RHCSACommands instance
        this.fs = filesystem;
        this.variables = {}; // Script-local variables
        this.functions = {}; // User-defined functions
        this.breakFlag = false;
        this.continueFlag = false;
        this.returnFlag = false;
        this.returnValue = 0;
        this.lastExitCode = 0;
    }
    
    async execute(ast) {
        try {
            return await this.executeNode(ast);
        } catch (error) {
            return {
                output: '',
                error: `bash: ${error.message}`,
                exitCode: 1
            };
        }
    }
    
    async executeNode(node) {
        if (!node) {
            return { output: '', error: '', exitCode: 0 };
        }
        
        switch (node.type) {
            case 'Program':
                return await this.executeProgram(node);
            case 'Command':
                return await this.executeCommand(node);
            case 'Pipeline':
                return await this.executePipeline(node);
            case 'LogicalOp':
                return await this.executeLogicalOp(node);
            case 'If':
                return await this.executeIf(node);
            case 'For':
                return await this.executeFor(node);
            case 'While':
                return await this.executeWhile(node);
            case 'Until':
                return await this.executeUntil(node);
            case 'Case':
                return await this.executeCase(node);
            case 'Function':
                return await this.executeFunction(node);
            case 'Test':
                return await this.executeTest(node);
            case 'Break':
                this.breakFlag = true;
                return { output: '', error: '', exitCode: 0 };
            case 'Continue':
                this.continueFlag = true;
                return { output: '', error: '', exitCode: 0 };
            case 'Return':
                this.returnFlag = true;
                this.returnValue = node.value ? parseInt(node.value) || 0 : 0;
                return { output: '', error: '', exitCode: this.returnValue };
            default:
                return { output: '', error: `Unknown node type: ${node.type}`, exitCode: 1 };
        }
    }
    
    async executeProgram(node) {
        let output = '';
        let error = '';
        let exitCode = 0;
        
        for (const stmt of node.body) {
            if (this.returnFlag) break;
            
            const result = await this.executeNode(stmt);
            output += result.output;
            error += result.error;
            exitCode = result.exitCode;
            this.lastExitCode = exitCode;
        }
        
        return { output, error, exitCode };
    }
    
    async executeCommand(node) {
        // Expand arguments (variables, command substitution)
        const expandedArgs = [];
        
        for (const arg of node.args) {
            const expanded = await this.expandString(arg);
            
            // Handle glob/word splitting for unquoted expansions
            if (expanded.includes(' ') && !arg.startsWith('"') && !arg.startsWith("'")) {
                expandedArgs.push(...expanded.split(/\s+/));
            } else {
                expandedArgs.push(expanded);
            }
        }
        
        if (expandedArgs.length === 0) {
            return { output: '', error: '', exitCode: 0 };
        }
        
        const cmdName = expandedArgs[0];
        const cmdArgs = expandedArgs.slice(1);
        
        // Check for variable assignment
        if (cmdName.includes('=')) {
            return this.executeAssignment(cmdName);
        }
        
        // Check for built-in commands first
        const builtinResult = await this.executeBuiltin(cmdName, cmdArgs);
        if (builtinResult !== null) {
            return builtinResult;
        }
        
        // Check for user-defined functions
        if (this.functions[cmdName]) {
            return await this.executeUserFunction(cmdName, cmdArgs);
        }
        
        // Execute external command via RHCSACommands
        const result = this.commands.executeCommand(cmdName, cmdArgs);
        
        // Handle redirections
        if (node.redirects && node.redirects.length > 0) {
            return this.applyRedirections(result, node.redirects);
        }
        
        return {
            output: result.output || result.stdout || '',
            error: result.error || result.stderr || '',
            exitCode: result.exitCode !== undefined ? result.exitCode : (result.error ? 1 : 0)
        };
    }
    
    async executeBuiltin(cmdName, args) {
        switch (cmdName) {
            case 'export':
                return this.builtinExport(args);
            case 'local':
                return this.builtinLocal(args);
            case 'declare':
            case 'readonly':
                return this.builtinDeclare(args);
            case 'unset':
                return this.builtinUnset(args);
            case 'echo':
                return this.builtinEcho(args);
            case 'test':
                return this.builtinTest(args);
            case 'source':
            case '.':
                return await this.builtinSource(args);
            case 'eval':
                return await this.builtinEval(args);
            case 'shift':
                return this.builtinShift(args);
            case 'exit':
                return this.builtinExit(args);
            case 'read':
                return this.builtinRead(args);
            case 'true':
                return { output: '', error: '', exitCode: 0 };
            case 'false':
                return { output: '', error: '', exitCode: 1 };
            default:
                return null; // Not a builtin
        }
    }
    
    executeAssignment(expr) {
        const [varName, ...valueParts] = expr.split('=');
        const value = valueParts.join('='); // Handle = in value
        
        this.variables[varName] = value;
        this.commands.env[varName] = value; // Also set in environment
        
        return { output: '', error: '', exitCode: 0 };
    }
    
    builtinExport(args) {
        for (const arg of args) {
            if (arg.includes('=')) {
                const [varName, ...valueParts] = arg.split('=');
                const value = valueParts.join('=');
                this.variables[varName] = value;
                this.commands.env[varName] = value;
            } else {
                // Export existing variable
                if (this.variables[arg]) {
                    this.commands.env[arg] = this.variables[arg];
                }
            }
        }
        return { output: '', error: '', exitCode: 0 };
    }
    
    builtinLocal(args) {
        // Similar to assignment but marks as local (we'll simplify)
        for (const arg of args) {
            if (arg.includes('=')) {
                const [varName, ...valueParts] = arg.split('=');
                const value = valueParts.join('=');
                this.variables[varName] = value;
            }
        }
        return { output: '', error: '', exitCode: 0 };
    }
    
    builtinDeclare(args) {
        // Simplified: treat like local
        return this.builtinLocal(args);
    }
    
    builtinUnset(args) {
        for (const arg of args) {
            delete this.variables[arg];
            delete this.commands.env[arg];
        }
        return { output: '', error: '', exitCode: 0 };
    }
    
    builtinEcho(args) {
        const output = args.join(' ') + '\n';
        return { output, error: '', exitCode: 0 };
    }
    
    builtinTest(args) {
        const result = this.evaluateTest(args);
        return { output: '', error: '', exitCode: result ? 0 : 1 };
    }
    
    async builtinSource(args) {
        if (args.length === 0) {
            return { output: '', error: 'source: filename required', exitCode: 1 };
        }
        
        const filename = args[0];
        const fullPath = this.fs.resolvePath(filename);
        const fileNode = this.fs.getNode(fullPath);
        
        if (!fileNode || fileNode.type !== 'file') {
            return { output: '', error: `source: ${filename}: No such file`, exitCode: 1 };
        }
        
        // Execute the sourced script
        return await this.executeScript(fileNode.content);
    }
    
    async builtinEval(args) {
        const code = args.join(' ');
        return await this.executeScript(code);
    }
    
    builtinShift(args) {
        const n = args.length > 0 ? parseInt(args[0]) || 1 : 1;
        this.commands.scriptArgs = this.commands.scriptArgs.slice(Math.min(n, this.commands.scriptArgs.length - 1));
        return { output: '', error: '', exitCode: 0 };
    }
    
    builtinExit(args) {
        const code = args.length > 0 ? parseInt(args[0]) || 0 : this.lastExitCode;
        return { output: '', error: '', exitCode: code, exit: true };
    }
    
    builtinRead(args) {
        // Simplified: can't do interactive read in browser, just set to empty
        const varName = args[0] || 'REPLY';
        this.variables[varName] = '';
        return { output: '', error: '', exitCode: 0 };
    }
    
    async executePipeline(node) {
        const leftResult = await this.executeNode(node.left);
        
        // Pass stdout of left as stdin to right
        const rightNode = node.right;
        if (rightNode.type === 'Command') {
            // Add stdin to command execution
            const cmdName = rightNode.args[0];
            const cmdArgs = [];
            for (let i = 1; i < rightNode.args.length; i++) {
                cmdArgs.push(await this.expandString(rightNode.args[i]));
            }
            
            const result = this.commands.executeCommand(cmdName, cmdArgs, leftResult.output);
            return {
                output: result.output || result.stdout || '',
                error: (leftResult.error || '') + (result.error || result.stderr || ''),
                exitCode: result.exitCode !== undefined ? result.exitCode : (result.error ? 1 : 0)
            };
        }
        
        return leftResult;
    }
    
    async executeLogicalOp(node) {
        const leftResult = await this.executeNode(node.left);
        this.lastExitCode = leftResult.exitCode;
        
        if (node.operator === '&&') {
            if (leftResult.exitCode === 0) {
                const rightResult = await this.executeNode(node.right);
                return {
                    output: leftResult.output + rightResult.output,
                    error: leftResult.error + rightResult.error,
                    exitCode: rightResult.exitCode
                };
            }
            return leftResult;
        } else if (node.operator === '||') {
            if (leftResult.exitCode !== 0) {
                const rightResult = await this.executeNode(node.right);
                return {
                    output: leftResult.output + rightResult.output,
                    error: leftResult.error + rightResult.error,
                    exitCode: rightResult.exitCode
                };
            }
            return leftResult;
        }
        
        return leftResult;
    }
    
    async executeIf(node) {
        const condResult = await this.executeNode(node.condition);
        this.lastExitCode = condResult.exitCode;
        
        let output = condResult.output;
        let error = condResult.error;
        let exitCode = 0;
        
        if (condResult.exitCode === 0) {
            // Execute then body
            for (const stmt of node.thenBody) {
                if (this.breakFlag || this.continueFlag || this.returnFlag) break;
                const result = await this.executeNode(stmt);
                output += result.output;
                error += result.error;
                exitCode = result.exitCode;
            }
        } else {
            // Check elif clauses
            let executed = false;
            for (const elif of node.elifClauses) {
                const elifCondResult = await this.executeNode(elif.condition);
                output += elifCondResult.output;
                error += elifCondResult.error;
                
                if (elifCondResult.exitCode === 0) {
                    for (const stmt of elif.body) {
                        if (this.breakFlag || this.continueFlag || this.returnFlag) break;
                        const result = await this.executeNode(stmt);
                        output += result.output;
                        error += result.error;
                        exitCode = result.exitCode;
                    }
                    executed = true;
                    break;
                }
            }
            
            // Execute else body if no elif matched
            if (!executed && node.elseBody) {
                for (const stmt of node.elseBody) {
                    if (this.breakFlag || this.continueFlag || this.returnFlag) break;
                    const result = await this.executeNode(stmt);
                    output += result.output;
                    error += result.error;
                    exitCode = result.exitCode;
                }
            }
        }
        
        return { output, error, exitCode };
    }
    
    async executeFor(node) {
        let output = '';
        let error = '';
        let exitCode = 0;
        
        // Expand items
        const items = [];
        for (const item of node.items) {
            items.push(await this.expandString(item));
        }
        
        for (const item of items) {
            if (this.breakFlag) {
                this.breakFlag = false;
                break;
            }
            
            if (this.returnFlag) break;
            
            // Set loop variable
            this.variables[node.variable] = item;
            
            // Execute body
            for (const stmt of node.body) {
                if (this.breakFlag || this.returnFlag) break;
                
                if (this.continueFlag) {
                    this.continueFlag = false;
                    break;
                }
                
                const result = await this.executeNode(stmt);
                output += result.output;
                error += result.error;
                exitCode = result.exitCode;
            }
            
            if (this.continueFlag) {
                this.continueFlag = false;
            }
        }
        
        return { output, error, exitCode };
    }
    
    async executeWhile(node) {
        let output = '';
        let error = '';
        let exitCode = 0;
        
        while (true) {
            if (this.breakFlag || this.returnFlag) {
                this.breakFlag = false;
                break;
            }
            
            const condResult = await this.executeNode(node.condition);
            output += condResult.output;
            error += condResult.error;
            
            if (condResult.exitCode !== 0) break;
            
            for (const stmt of node.body) {
                if (this.breakFlag || this.returnFlag) break;
                
                if (this.continueFlag) {
                    this.continueFlag = false;
                    break;
                }
                
                const result = await this.executeNode(stmt);
                output += result.output;
                error += result.error;
                exitCode = result.exitCode;
            }
            
            if (this.continueFlag) {
                this.continueFlag = false;
            }
        }
        
        return { output, error, exitCode };
    }
    
    async executeUntil(node) {
        let output = '';
        let error = '';
        let exitCode = 0;
        
        while (true) {
            if (this.breakFlag || this.returnFlag) {
                this.breakFlag = false;
                break;
            }
            
            const condResult = await this.executeNode(node.condition);
            output += condResult.output;
            error += condResult.error;
            
            if (condResult.exitCode === 0) break; // Until is opposite of while
            
            for (const stmt of node.body) {
                if (this.breakFlag || this.returnFlag) break;
                
                if (this.continueFlag) {
                    this.continueFlag = false;
                    break;
                }
                
                const result = await this.executeNode(stmt);
                output += result.output;
                error += result.error;
                exitCode = result.exitCode;
            }
            
            if (this.continueFlag) {
                this.continueFlag = false;
            }
        }
        
        return { output, error, exitCode };
    }
    
    async executeCase(node) {
        const value = await this.expandString(node.value);
        
        let output = '';
        let error = '';
        let exitCode = 0;
        
        for (const caseClause of node.cases) {
            const pattern = await this.expandString(caseClause.pattern);
            
            // Simple pattern matching (*, ?, or exact match)
            if (this.matchPattern(value, pattern)) {
                for (const stmt of caseClause.body) {
                    const result = await this.executeNode(stmt);
                    output += result.output;
                    error += result.error;
                    exitCode = result.exitCode;
                }
                break; // Only execute first matching case
            }
        }
        
        return { output, error, exitCode };
    }
    
    async executeFunction(node) {
        this.functions[node.name] = node.body;
        return { output: '', error: '', exitCode: 0 };
    }
    
    async executeUserFunction(name, args) {
        const body = this.functions[name];
        
        // Save current script args
        const savedArgs = this.commands.scriptArgs;
        
        // Set function arguments
        this.commands.scriptArgs = [name, ...args];
        
        let output = '';
        let error = '';
        let exitCode = 0;
        
        for (const stmt of body) {
            if (this.returnFlag) {
                this.returnFlag = false;
                exitCode = this.returnValue;
                break;
            }
            
            const result = await this.executeNode(stmt);
            output += result.output;
            error += result.error;
            exitCode = result.exitCode;
        }
        
        // Restore script args
        this.commands.scriptArgs = savedArgs;
        
        return { output, error, exitCode };
    }
    
    async executeTest(node) {
        const result = this.evaluateTest(node.args);
        return { output: '', error: '', exitCode: result ? 0 : 1 };
    }
    
    async executeScript(code) {
        const lexer = new BashLexer(code);
        const tokens = lexer.tokenize();
        const parser = new BashParser(tokens);
        const ast = parser.parse();
        return await this.execute(ast);
    }
    
    // Helper: Expand variables and command substitutions in string
    async expandString(str) {
        if (!str) return '';
        
        // Variable expansion: $VAR or ${VAR}
        str = str.replace(/\$\{?([A-Za-z_?@*#0-9][A-Za-z0-9_]*)\}?/g, (match, varName) => {
            if (varName === '?') return String(this.lastExitCode);
            if (varName === '#') return String(this.commands.scriptArgs.length - 1);
            if (varName === '@' || varName === '*') return this.commands.scriptArgs.slice(1).join(' ');
            if (/^[0-9]$/.test(varName)) {
                const index = parseInt(varName);
                return this.commands.scriptArgs[index] || '';
            }
            
            return this.variables[varName] || this.commands.env[varName] || '';
        });
        
        // Command substitution: $(cmd) or `cmd`
        const cmdSubstRegex = /\$\(([^)]+)\)|`([^`]+)`/g;
        const matches = [...str.matchAll(cmdSubstRegex)];
        
        for (const match of matches) {
            const cmd = match[1] || match[2];
            const result = await this.executeScript(cmd);
            str = str.replace(match[0], result.output.trim());
        }
        
        return str;
    }
    
    // Helper: Simple pattern matching for case statements
    matchPattern(value, pattern) {
        if (pattern === '*') return true;
        if (pattern === value) return true;
        
        // Convert glob pattern to regex
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(value);
    }
    
    // Helper: Evaluate test conditions
    evaluateTest(args) {
        if (args.length === 0) return false;
        
        // Unary operators
        if (args.length === 2) {
            const op = args[0];
            const arg = args[1];
            
            switch (op) {
                case '-z': return arg.length === 0;
                case '-n': return arg.length > 0;
                case '-f': return this.fs.getNode(this.fs.resolvePath(arg))?.type === 'file';
                case '-d': return this.fs.getNode(this.fs.resolvePath(arg))?.type === 'directory';
                case '-e': return this.fs.getNode(this.fs.resolvePath(arg)) !== null;
                case '-r': 
                case '-w': 
                case '-x': return true; // Simplified: assume all files have all permissions
                case '!': return !this.evaluateTest(args.slice(1));
            }
        }
        
        // Binary operators
        if (args.length === 3) {
            const left = args[0];
            const op = args[1];
            const right = args[2];
            
            switch (op) {
                case '=':
                case '==': return left === right;
                case '!=': return left !== right;
                case '-eq': return parseInt(left) === parseInt(right);
                case '-ne': return parseInt(left) !== parseInt(right);
                case '-lt': return parseInt(left) < parseInt(right);
                case '-le': return parseInt(left) <= parseInt(right);
                case '-gt': return parseInt(left) > parseInt(right);
                case '-ge': return parseInt(left) >= parseInt(right);
            }
        }
        
        // Default: non-empty string is true
        return args[0] && args[0].length > 0;
    }
    
    // Helper: Apply redirections
    applyRedirections(result, redirects) {
        // Simplified: just handle basic file redirections
        for (const redir of redirects) {
            if (redir.type === 'REDIRECT_OUT') {
                this.fs.writeFile(redir.target, result.output);
                result.output = '';
            } else if (redir.type === 'APPEND') {
                const existing = this.fs.readFile(redir.target);
                this.fs.writeFile(redir.target, existing + result.output);
                result.output = '';
            } else if (redir.type === 'REDIRECT_ERR') {
                this.fs.writeFile(redir.target, result.error);
                result.error = '';
            }
        }
        return result;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BashExecutor;
}
