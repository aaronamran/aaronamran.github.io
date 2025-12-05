// Bash Lexer - Tokenizes bash script syntax
// Converts bash script text into tokens for parsing

class BashLexer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
        this.line = 1;
        this.col = 1;
        this.tokens = [];
    }
    
    tokenize() {
        while (this.pos < this.input.length) {
            this.skipWhitespace();
            
            if (this.pos >= this.input.length) break;
            
            const char = this.current();
            
            // Comments
            if (char === '#') {
                this.skipComment();
                continue;
            }
            
            // Newline / statement separator
            if (char === '\n') {
                this.addToken('NEWLINE', '\n');
                this.advance();
                this.line++;
                this.col = 1;
                continue;
            }
            
            // Semicolon (command separator)
            if (char === ';') {
                this.addToken('SEMICOLON', ';');
                this.advance();
                continue;
            }
            
            // Pipe
            if (char === '|') {
                if (this.peek() === '|') {
                    this.addToken('OR', '||');
                    this.advance();
                    this.advance();
                } else {
                    this.addToken('PIPE', '|');
                    this.advance();
                }
                continue;
            }
            
            // And
            if (char === '&') {
                if (this.peek() === '&') {
                    this.addToken('AND', '&&');
                    this.advance();
                    this.advance();
                } else {
                    this.addToken('BACKGROUND', '&');
                    this.advance();
                }
                continue;
            }
            
            // Redirections
            if (char === '>') {
                if (this.peek() === '>') {
                    this.addToken('APPEND', '>>');
                    this.advance();
                    this.advance();
                } else {
                    this.addToken('REDIRECT_OUT', '>');
                    this.advance();
                }
                continue;
            }
            
            if (char === '<') {
                this.addToken('REDIRECT_IN', '<');
                this.advance();
                continue;
            }
            
            // Numbers (for redirections like 2>)
            if (char === '2' && this.peek() === '>') {
                this.advance();
                if (this.peek() === '&' && this.input[this.pos + 2] === '1') {
                    this.addToken('REDIRECT_STDERR_TO_STDOUT', '2>&1');
                    this.advance();
                    this.advance();
                    this.advance();
                } else {
                    this.addToken('REDIRECT_ERR', '2>');
                    this.advance();
                }
                continue;
            }
            
            // Parentheses
            if (char === '(') {
                this.addToken('LPAREN', '(');
                this.advance();
                continue;
            }
            
            if (char === ')') {
                this.addToken('RPAREN', ')');
                this.advance();
                continue;
            }
            
            // Braces
            if (char === '{') {
                this.addToken('LBRACE', '{');
                this.advance();
                continue;
            }
            
            if (char === '}') {
                this.addToken('RBRACE', '}');
                this.advance();
                continue;
            }
            
            // Brackets for test
            if (char === '[') {
                if (this.peek() === '[') {
                    this.addToken('DOUBLE_LBRACKET', '[[');
                    this.advance();
                    this.advance();
                } else {
                    this.addToken('LBRACKET', '[');
                    this.advance();
                }
                continue;
            }
            
            if (char === ']') {
                if (this.peek() === ']') {
                    this.addToken('DOUBLE_RBRACKET', ']]');
                    this.advance();
                    this.advance();
                } else {
                    this.addToken('RBRACKET', ']');
                    this.advance();
                }
                continue;
            }
            
            // Dollar sign (variables, command substitution)
            if (char === '$') {
                if (this.peek() === '(') {
                    this.readCommandSubstitution();
                } else if (this.peek() === '{') {
                    this.readVariableBraced();
                } else {
                    this.readVariable();
                }
                continue;
            }
            
            // Strings
            if (char === '"') {
                this.readDoubleQuotedString();
                continue;
            }
            
            if (char === "'") {
                this.readSingleQuotedString();
                continue;
            }
            
            // Backticks (command substitution)
            if (char === '`') {
                this.readBacktickSubstitution();
                continue;
            }
            
            // Keywords and words
            this.readWord();
        }
        
        this.addToken('EOF', '');
        return this.tokens;
    }
    
    current() {
        return this.input[this.pos];
    }
    
    peek(offset = 1) {
        return this.input[this.pos + offset];
    }
    
    advance() {
        this.pos++;
        this.col++;
    }
    
    skipWhitespace() {
        while (this.pos < this.input.length && /[ \t\r]/.test(this.current())) {
            this.advance();
        }
    }
    
    skipComment() {
        while (this.pos < this.input.length && this.current() !== '\n') {
            this.advance();
        }
    }
    
    readWord() {
        const start = this.pos;
        
        while (this.pos < this.input.length) {
            const char = this.current();
            
            // Stop at special characters
            if (/[\s;|&<>(){}[\]#$"'`]/.test(char)) {
                break;
            }
            
            this.advance();
        }
        
        const value = this.input.slice(start, this.pos);
        
        // Check if it's a keyword
        const keywords = [
            'if', 'then', 'else', 'elif', 'fi',
            'case', 'esac', 'in',
            'for', 'while', 'until', 'do', 'done',
            'function', 'return',
            'break', 'continue',
            'local', 'declare', 'readonly', 'export'
        ];
        
        if (keywords.includes(value)) {
            this.addToken(value.toUpperCase(), value);
        } else {
            this.addToken('WORD', value);
        }
    }
    
    readVariable() {
        const start = this.pos;
        this.advance(); // Skip $
        
        // Special variables: $?, $#, $@, $*, $0-$9
        if (/[?#@*0-9]/.test(this.current())) {
            this.advance();
            this.addToken('VARIABLE', this.input.slice(start, this.pos));
            return;
        }
        
        // Regular variable name
        while (this.pos < this.input.length && /[A-Za-z0-9_]/.test(this.current())) {
            this.advance();
        }
        
        this.addToken('VARIABLE', this.input.slice(start, this.pos));
    }
    
    readVariableBraced() {
        const start = this.pos;
        this.advance(); // Skip $
        this.advance(); // Skip {
        
        while (this.pos < this.input.length && this.current() !== '}') {
            this.advance();
        }
        
        if (this.current() === '}') {
            this.advance();
        }
        
        this.addToken('VARIABLE', this.input.slice(start, this.pos));
    }
    
    readCommandSubstitution() {
        const start = this.pos;
        this.advance(); // Skip $
        this.advance(); // Skip (
        
        let depth = 1;
        while (this.pos < this.input.length && depth > 0) {
            if (this.current() === '(') depth++;
            if (this.current() === ')') depth--;
            if (depth > 0) this.advance();
        }
        
        if (this.current() === ')') {
            this.advance();
        }
        
        this.addToken('CMD_SUBST', this.input.slice(start, this.pos));
    }
    
    readBacktickSubstitution() {
        const start = this.pos;
        this.advance(); // Skip `
        
        while (this.pos < this.input.length && this.current() !== '`') {
            this.advance();
        }
        
        if (this.current() === '`') {
            this.advance();
        }
        
        this.addToken('CMD_SUBST', this.input.slice(start, this.pos));
    }
    
    readDoubleQuotedString() {
        const start = this.pos;
        this.advance(); // Skip opening "
        
        while (this.pos < this.input.length && this.current() !== '"') {
            if (this.current() === '\\') {
                this.advance(); // Skip escape char
                if (this.pos < this.input.length) {
                    this.advance(); // Skip escaped char
                }
            } else {
                this.advance();
            }
        }
        
        if (this.current() === '"') {
            this.advance(); // Skip closing "
        }
        
        this.addToken('STRING', this.input.slice(start, this.pos));
    }
    
    readSingleQuotedString() {
        const start = this.pos;
        this.advance(); // Skip opening '
        
        while (this.pos < this.input.length && this.current() !== "'") {
            this.advance();
        }
        
        if (this.current() === "'") {
            this.advance(); // Skip closing '
        }
        
        this.addToken('STRING', this.input.slice(start, this.pos));
    }
    
    addToken(type, value) {
        this.tokens.push({
            type: type,
            value: value,
            line: this.line,
            col: this.col
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BashLexer;
}
