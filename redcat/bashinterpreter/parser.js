// Bash Parser - Builds Abstract Syntax Tree from tokens
// Parses bash script syntax into executable AST nodes

class BashParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    
    parse() {
        const statements = [];
        
        while (!this.isAtEnd()) {
            // Skip newlines between statements
            while (this.match('NEWLINE')) {
                // consume
            }
            
            if (this.isAtEnd()) break;
            
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            }
        }
        
        return {
            type: 'Program',
            body: statements
        };
    }
    
    parseStatement() {
        // Control structures
        if (this.check('IF')) return this.parseIf();
        if (this.check('FOR')) return this.parseFor();
        if (this.check('WHILE')) return this.parseWhile();
        if (this.check('UNTIL')) return this.parseUntil();
        if (this.check('CASE')) return this.parseCase();
        if (this.check('FUNCTION')) return this.parseFunction();
        
        // Simple commands
        if (this.check('BREAK')) {
            this.advance();
            return { type: 'Break' };
        }
        
        if (this.check('CONTINUE')) {
            this.advance();
            return { type: 'Continue' };
        }
        
        if (this.check('RETURN')) {
            this.advance();
            let value = null;
            if (!this.check('NEWLINE') && !this.check('SEMICOLON') && !this.isAtEnd()) {
                value = this.current().value;
                this.advance();
            }
            return { type: 'Return', value: value };
        }
        
        // Pipeline/command
        return this.parsePipeline();
    }
    
    parsePipeline() {
        let left = this.parseCommand();
        
        while (this.match('PIPE')) {
            const right = this.parseCommand();
            left = {
                type: 'Pipeline',
                left: left,
                right: right
            };
        }
        
        // Logical operators (&&, ||)
        while (this.check('AND') || this.check('OR')) {
            const op = this.advance().type;
            const right = this.parsePipeline();
            left = {
                type: 'LogicalOp',
                operator: op === 'AND' ? '&&' : '||',
                left: left,
                right: right
            };
        }
        
        // Command separator or background
        if (this.match('SEMICOLON') || this.match('NEWLINE')) {
            // consumed
        } else if (this.match('BACKGROUND')) {
            left = {
                type: 'Background',
                command: left
            };
        }
        
        return left;
    }
    
    parseCommand() {
        const args = [];
        const redirects = [];
        
        // Handle test/[ command specially
        if (this.match('LBRACKET')) {
            return this.parseTest();
        }
        
        if (this.match('DOUBLE_LBRACKET')) {
            return this.parseDoubleTest();
        }
        
        // Collect command arguments and redirections
        while (!this.isAtEnd() && 
               !this.check('PIPE') && 
               !this.check('AND') && 
               !this.check('OR') && 
               !this.check('SEMICOLON') && 
               !this.check('NEWLINE') &&
               !this.check('BACKGROUND')) {
            
            // Redirections
            if (this.check('REDIRECT_OUT') || 
                this.check('APPEND') || 
                this.check('REDIRECT_IN') || 
                this.check('REDIRECT_ERR') ||
                this.check('REDIRECT_STDERR_TO_STDOUT')) {
                
                const type = this.advance().type;
                let target = '';
                
                if (type !== 'REDIRECT_STDERR_TO_STDOUT') {
                    if (!this.isAtEnd()) {
                        target = this.parseValue();
                    }
                }
                
                redirects.push({
                    type: type,
                    target: target
                });
                continue;
            }
            
            // Regular argument
            args.push(this.parseValue());
        }
        
        if (args.length === 0) {
            return null;
        }
        
        return {
            type: 'Command',
            args: args,
            redirects: redirects
        };
    }
    
    parseValue() {
        const token = this.current();
        
        if (token.type === 'STRING') {
            this.advance();
            // Remove quotes
            let value = token.value;
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            return value;
        }
        
        if (token.type === 'VARIABLE') {
            this.advance();
            return token.value; // Keep $ prefix for executor to expand
        }
        
        if (token.type === 'CMD_SUBST') {
            this.advance();
            return token.value; // Keep $() or `` for executor to expand
        }
        
        if (token.type === 'WORD') {
            this.advance();
            return token.value;
        }
        
        this.advance();
        return token.value;
    }
    
    parseTest() {
        const args = [];
        
        while (!this.match('RBRACKET')) {
            if (this.isAtEnd()) {
                throw new Error('Unclosed test bracket [');
            }
            args.push(this.parseValue());
        }
        
        return {
            type: 'Test',
            args: args,
            doublebrack: false
        };
    }
    
    parseDoubleTest() {
        const args = [];
        
        while (!this.match('DOUBLE_RBRACKET')) {
            if (this.isAtEnd()) {
                throw new Error('Unclosed test bracket [[');
            }
            args.push(this.parseValue());
        }
        
        return {
            type: 'Test',
            args: args,
            doublebrack: true
        };
    }
    
    parseIf() {
        this.consume('IF');
        
        const condition = this.parsePipeline();
        
        this.skipNewlines();
        this.consume('THEN');
        this.skipNewlines();
        
        const thenBody = [];
        while (!this.check('ELIF') && !this.check('ELSE') && !this.check('FI')) {
            if (this.isAtEnd()) {
                throw new Error('Unclosed if statement');
            }
            this.skipNewlines();
            if (this.check('ELIF') || this.check('ELSE') || this.check('FI')) break;
            thenBody.push(this.parseStatement());
            this.skipNewlines();
        }
        
        const elifClauses = [];
        while (this.match('ELIF')) {
            this.skipNewlines();
            const elifCondition = this.parsePipeline();
            this.skipNewlines();
            this.consume('THEN');
            this.skipNewlines();
            
            const elifBody = [];
            while (!this.check('ELIF') && !this.check('ELSE') && !this.check('FI')) {
                if (this.isAtEnd()) {
                    throw new Error('Unclosed elif clause');
                }
                this.skipNewlines();
                if (this.check('ELIF') || this.check('ELSE') || this.check('FI')) break;
                elifBody.push(this.parseStatement());
                this.skipNewlines();
            }
            
            elifClauses.push({
                condition: elifCondition,
                body: elifBody
            });
        }
        
        let elseBody = null;
        if (this.match('ELSE')) {
            this.skipNewlines();
            elseBody = [];
            while (!this.check('FI')) {
                if (this.isAtEnd()) {
                    throw new Error('Unclosed else clause');
                }
                this.skipNewlines();
                if (this.check('FI')) break;
                elseBody.push(this.parseStatement());
                this.skipNewlines();
            }
        }
        
        this.consume('FI');
        
        return {
            type: 'If',
            condition: condition,
            thenBody: thenBody,
            elifClauses: elifClauses,
            elseBody: elseBody
        };
    }
    
    parseFor() {
        this.consume('FOR');
        
        const varName = this.current().value;
        this.advance();
        
        this.consume('IN');
        
        const items = [];
        while (!this.check('SEMICOLON') && !this.check('NEWLINE') && !this.check('DO')) {
            if (this.isAtEnd()) break;
            items.push(this.parseValue());
        }
        
        if (this.match('SEMICOLON') || this.match('NEWLINE')) {
            // consumed
        }
        
        this.skipNewlines();
        this.consume('DO');
        this.skipNewlines();
        
        const body = [];
        while (!this.check('DONE')) {
            if (this.isAtEnd()) {
                throw new Error('Unclosed for loop');
            }
            this.skipNewlines();
            if (this.check('DONE')) break;
            body.push(this.parseStatement());
            this.skipNewlines();
        }
        
        this.consume('DONE');
        
        return {
            type: 'For',
            variable: varName,
            items: items,
            body: body
        };
    }
    
    parseWhile() {
        this.consume('WHILE');
        
        const condition = this.parsePipeline();
        
        this.skipNewlines();
        this.consume('DO');
        this.skipNewlines();
        
        const body = [];
        while (!this.check('DONE')) {
            if (this.isAtEnd()) {
                throw new Error('Unclosed while loop');
            }
            this.skipNewlines();
            if (this.check('DONE')) break;
            body.push(this.parseStatement());
            this.skipNewlines();
        }
        
        this.consume('DONE');
        
        return {
            type: 'While',
            condition: condition,
            body: body
        };
    }
    
    parseUntil() {
        this.consume('UNTIL');
        
        const condition = this.parsePipeline();
        
        this.skipNewlines();
        this.consume('DO');
        this.skipNewlines();
        
        const body = [];
        while (!this.check('DONE')) {
            if (this.isAtEnd()) {
                throw new Error('Unclosed until loop');
            }
            this.skipNewlines();
            if (this.check('DONE')) break;
            body.push(this.parseStatement());
            this.skipNewlines();
        }
        
        this.consume('DONE');
        
        return {
            type: 'Until',
            condition: condition,
            body: body
        };
    }
    
    parseCase() {
        this.consume('CASE');
        
        const value = this.parseValue();
        
        this.skipNewlines();
        this.consume('IN');
        this.skipNewlines();
        
        const cases = [];
        
        while (!this.check('ESAC')) {
            if (this.isAtEnd()) {
                throw new Error('Unclosed case statement');
            }
            
            this.skipNewlines();
            if (this.check('ESAC')) break;
            
            // Pattern
            const pattern = this.parseValue();
            this.consume('RPAREN'); // )
            this.skipNewlines();
            
            // Body
            const body = [];
            while (!this.check('SEMICOLON') && !this.check('DOUBLE_SEMICOLON')) {
                if (this.check('ESAC') || this.isAtEnd()) break;
                this.skipNewlines();
                if (this.check('SEMICOLON') || this.check('DOUBLE_SEMICOLON')) break;
                body.push(this.parseStatement());
                this.skipNewlines();
            }
            
            // ;; or ;
            if (this.match('DOUBLE_SEMICOLON') || this.match('SEMICOLON')) {
                // consumed
            }
            
            cases.push({
                pattern: pattern,
                body: body
            });
            
            this.skipNewlines();
        }
        
        this.consume('ESAC');
        
        return {
            type: 'Case',
            value: value,
            cases: cases
        };
    }
    
    parseFunction() {
        this.consume('FUNCTION');
        
        const name = this.current().value;
        this.advance();
        
        // Optional () after function name
        if (this.match('LPAREN')) {
            this.consume('RPAREN');
        }
        
        this.skipNewlines();
        this.consume('LBRACE');
        this.skipNewlines();
        
        const body = [];
        while (!this.check('RBRACE')) {
            if (this.isAtEnd()) {
                throw new Error('Unclosed function');
            }
            this.skipNewlines();
            if (this.check('RBRACE')) break;
            body.push(this.parseStatement());
            this.skipNewlines();
        }
        
        this.consume('RBRACE');
        
        return {
            type: 'Function',
            name: name,
            body: body
        };
    }
    
    // Helper methods
    skipNewlines() {
        while (this.match('NEWLINE')) {
            // consume
        }
    }
    
    current() {
        return this.tokens[this.pos];
    }
    
    peek() {
        if (this.pos + 1 < this.tokens.length) {
            return this.tokens[this.pos + 1];
        }
        return this.tokens[this.tokens.length - 1];
    }
    
    advance() {
        const token = this.current();
        if (!this.isAtEnd()) {
            this.pos++;
        }
        return token;
    }
    
    check(type) {
        if (this.isAtEnd()) return false;
        return this.current().type === type;
    }
    
    match(type) {
        if (this.check(type)) {
            this.advance();
            return true;
        }
        return false;
    }
    
    consume(type) {
        if (!this.check(type)) {
            const current = this.current();
            throw new Error(`Expected ${type} but got ${current.type} at line ${current.line}`);
        }
        return this.advance();
    }
    
    isAtEnd() {
        return this.current().type === 'EOF';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BashParser;
}
