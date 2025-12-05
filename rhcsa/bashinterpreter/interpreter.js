// Bash Interpreter - Main Entry Point
// Integrates lexer, parser, and executor for bash script execution

class BashInterpreter {
    constructor(commands, filesystem) {
        this.commands = commands;
        this.fs = filesystem;
    }
    
    async executeScript(code, args = []) {
        try {
            // Set script arguments (for $0, $1, etc.)
            const savedArgs = this.commands.scriptArgs;
            this.commands.scriptArgs = args;
            
            // Lexical analysis
            const lexer = new BashLexer(code);
            const tokens = lexer.tokenize();
            
            // Syntax analysis
            const parser = new BashParser(tokens);
            const ast = parser.parse();
            
            // Execution
            const executor = new BashExecutor(this.commands, this.fs);
            const result = await executor.execute(ast);
            
            // Restore saved arguments
            this.commands.scriptArgs = savedArgs;
            
            return result;
        } catch (error) {
            return {
                output: '',
                error: `bash: ${error.message}\n${error.stack || ''}`,
                exitCode: 1
            };
        }
    }
    
    async executeFile(filepath, args = []) {
        // Resolve full path
        const fullPath = this.fs.resolvePath(filepath);
        
        // Read file
        const fileNode = this.fs.getNode(fullPath);
        
        if (!fileNode) {
            return {
                output: '',
                error: `bash: ${filepath}: No such file or directory`,
                exitCode: 127
            };
        }
        
        if (fileNode.type !== 'file') {
            return {
                output: '',
                error: `bash: ${filepath}: Is a directory`,
                exitCode: 126
            };
        }
        
        // Check execute permission
        if (!this.fs.checkPermission(fileNode, 'x')) {
            return {
                output: '',
                error: `bash: ${filepath}: Permission denied`,
                exitCode: 126
            };
        }
        
        // Execute script with arguments
        const scriptArgs = [filepath, ...args];
        return await this.executeScript(fileNode.content, scriptArgs);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BashInterpreter;
}
