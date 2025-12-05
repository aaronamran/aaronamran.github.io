// RHCSA Nano Editor
// Simulates GNU nano text editor for RHCSA practice

class NanoEditor {
    constructor(terminal, filesystem) {
        this.terminal = terminal;
        this.fs = filesystem;
        this.active = false;
        this.filename = '';
        this.content = [];
        this.cursorRow = 0;
        this.cursorCol = 0;
        this.scrollOffset = 0;
        this.modified = false;
        this.message = '';
        this.messageTimeout = null;
        this.searchTerm = '';
        
        // Visible area (excluding header and status bars)
        this.visibleRows = 20;
        this.maxCols = 80;
    }
    
    open(filename, initialContent = '') {
        this.filename = filename;
        this.content = initialContent.split('\n');
        if (this.content.length === 0 || (this.content.length === 1 && this.content[0] === '')) {
            this.content = [''];
        }
        this.cursorRow = 0;
        this.cursorCol = 0;
        this.scrollOffset = 0;
        this.modified = false;
        this.active = true;
        this.message = '';
        
        this.render();
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        this.keyHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keyHandler);
    }
    
    detachEventListeners() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
    }
    
    handleKeyPress(e) {
        if (!this.active) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const ctrl = e.ctrlKey;
        const key = e.key;
        
        // Ctrl shortcuts (nano style)
        if (ctrl) {
            switch(key.toLowerCase()) {
                case 'x': // Exit
                    this.promptExit();
                    break;
                case 'o': // Write Out (save)
                    this.saveFile();
                    break;
                case 'g': // Get Help
                    this.showHelp();
                    break;
                case 'w': // Where Is (search)
                    this.promptSearch();
                    break;
                case 'k': // Cut line
                    this.cutLine();
                    break;
                case 'u': // Uncut (paste)
                    this.uncutLine();
                    break;
                case 'j': // Justify (not implemented - just show message)
                    this.setMessage('Justify not available in this version');
                    break;
                case 'c': // Current position
                    this.showPosition();
                    break;
                case 'r': // Read file (not implemented)
                    this.setMessage('Read File not available in this version');
                    break;
                case 't': // To spell (not implemented)
                    this.setMessage('Spell check not available');
                    break;
                case '_': // Go to line
                    this.promptGoToLine();
                    break;
                case '\\': // Replace (not implemented)
                    this.setMessage('Replace not available in this version');
                    break;
                case 'a': // Mark text start
                    this.setMessage('Mark Set');
                    break;
                case '6': // Copy line
                    this.copyLine();
                    break;
            }
            this.render();
            return;
        }
        
        // Navigation keys
        switch(key) {
            case 'ArrowUp':
                this.moveCursor(-1, 0);
                break;
            case 'ArrowDown':
                this.moveCursor(1, 0);
                break;
            case 'ArrowLeft':
                this.moveCursor(0, -1);
                break;
            case 'ArrowRight':
                this.moveCursor(0, 1);
                break;
            case 'Home':
                this.cursorCol = 0;
                break;
            case 'End':
                this.cursorCol = this.content[this.cursorRow].length;
                break;
            case 'PageUp':
                this.moveCursor(-this.visibleRows, 0);
                break;
            case 'PageDown':
                this.moveCursor(this.visibleRows, 0);
                break;
            case 'Enter':
                this.insertNewline();
                break;
            case 'Backspace':
                this.deleteChar();
                break;
            case 'Delete':
                this.deleteCharForward();
                break;
            case 'Tab':
                this.insertText('    '); // 4 spaces
                break;
            default:
                // Regular character input
                if (key.length === 1 && !ctrl) {
                    this.insertText(key);
                }
                break;
        }
        
        this.render();
    }
    
    moveCursor(rowDelta, colDelta) {
        this.cursorRow = Math.max(0, Math.min(this.content.length - 1, this.cursorRow + rowDelta));
        this.cursorCol = Math.max(0, Math.min(this.content[this.cursorRow].length, this.cursorCol + colDelta));
        
        // Adjust scroll offset
        if (this.cursorRow < this.scrollOffset) {
            this.scrollOffset = this.cursorRow;
        } else if (this.cursorRow >= this.scrollOffset + this.visibleRows) {
            this.scrollOffset = this.cursorRow - this.visibleRows + 1;
        }
    }
    
    insertText(text) {
        const line = this.content[this.cursorRow];
        this.content[this.cursorRow] = line.slice(0, this.cursorCol) + text + line.slice(this.cursorCol);
        this.cursorCol += text.length;
        this.modified = true;
    }
    
    insertNewline() {
        const line = this.content[this.cursorRow];
        const before = line.slice(0, this.cursorCol);
        const after = line.slice(this.cursorCol);
        
        this.content[this.cursorRow] = before;
        this.content.splice(this.cursorRow + 1, 0, after);
        
        this.cursorRow++;
        this.cursorCol = 0;
        this.modified = true;
        
        // Adjust scroll
        if (this.cursorRow >= this.scrollOffset + this.visibleRows) {
            this.scrollOffset++;
        }
    }
    
    deleteChar() {
        if (this.cursorCol > 0) {
            // Delete character before cursor
            const line = this.content[this.cursorRow];
            this.content[this.cursorRow] = line.slice(0, this.cursorCol - 1) + line.slice(this.cursorCol);
            this.cursorCol--;
            this.modified = true;
        } else if (this.cursorRow > 0) {
            // Join with previous line
            const currentLine = this.content[this.cursorRow];
            this.cursorRow--;
            this.cursorCol = this.content[this.cursorRow].length;
            this.content[this.cursorRow] += currentLine;
            this.content.splice(this.cursorRow + 1, 1);
            this.modified = true;
        }
    }
    
    deleteCharForward() {
        const line = this.content[this.cursorRow];
        if (this.cursorCol < line.length) {
            this.content[this.cursorRow] = line.slice(0, this.cursorCol) + line.slice(this.cursorCol + 1);
            this.modified = true;
        } else if (this.cursorRow < this.content.length - 1) {
            // Join with next line
            this.content[this.cursorRow] += this.content[this.cursorRow + 1];
            this.content.splice(this.cursorRow + 1, 1);
            this.modified = true;
        }
    }
    
    cutLine() {
        if (!this.cutBuffer) this.cutBuffer = [];
        this.cutBuffer = [this.content[this.cursorRow]];
        this.content.splice(this.cursorRow, 1);
        if (this.content.length === 0) {
            this.content = [''];
        }
        if (this.cursorRow >= this.content.length) {
            this.cursorRow = this.content.length - 1;
        }
        this.cursorCol = 0;
        this.modified = true;
    }
    
    uncutLine() {
        if (this.cutBuffer && this.cutBuffer.length > 0) {
            this.content.splice(this.cursorRow, 0, ...this.cutBuffer);
            this.modified = true;
        }
    }
    
    copyLine() {
        if (!this.cutBuffer) this.cutBuffer = [];
        this.cutBuffer = [this.content[this.cursorRow]];
        this.setMessage('Line copied');
    }
    
    saveFile() {
        const fileContent = this.content.join('\n');
        const result = this.fs.writeFile(this.filename, fileContent);
        
        if (result.success) {
            this.modified = false;
            const lines = this.content.length;
            this.setMessage(`[ Wrote ${lines} line${lines !== 1 ? 's' : ''} ]`);
        } else {
            this.setMessage(`Error writing ${this.filename}: ${result.error}`);
        }
    }
    
    promptExit() {
        if (this.modified) {
            // In real nano, this would prompt. For simplicity, we'll just show message
            this.setMessage('Save modified buffer? (Ctrl+O to save, Ctrl+X again to exit without saving)');
            // Set a flag to allow immediate exit on next Ctrl+X
            this.exitConfirm = true;
            setTimeout(() => { this.exitConfirm = false; }, 3000);
        } else {
            this.exit();
        }
    }
    
    exit() {
        this.active = false;
        this.detachEventListeners();
        this.terminal.restoreFromEditor();
    }
    
    promptSearch() {
        // Simplified: just show message. Real implementation would need input prompt
        this.setMessage('Search: (simplified - feature not fully implemented)');
    }
    
    promptGoToLine() {
        this.setMessage('Go to line: (simplified - feature not fully implemented)');
    }
    
    showHelp() {
        const helpText = `GNU nano Help

Main Commands:
^G  Get Help     ^O  Write Out    ^W  Where Is     ^K  Cut Line
^X  Exit         ^R  Read File    ^\\  Replace      ^U  Uncut Line
^J  Justify      ^T  To Spell     ^C  Cur Pos      ^_  Go To Line

Navigation:
Arrow keys - Move cursor
Home/End - Start/end of line
PgUp/PgDn - Page up/down

^X to close help`;
        
        this.setMessage('Help displayed (press any key to continue)');
    }
    
    showPosition() {
        const line = this.cursorRow + 1;
        const col = this.cursorCol + 1;
        const total = this.content.length;
        this.setMessage(`line ${line}/${total} (${Math.round(line/total*100)}%), col ${col}`);
    }
    
    setMessage(msg) {
        this.message = msg;
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        this.messageTimeout = setTimeout(() => {
            this.message = '';
            this.render();
        }, 3000);
    }
    
    render() {
        if (!this.active) return;
        
        const output = this.terminal.output;
        output.innerHTML = '';
        
        // Header line
        const header = document.createElement('div');
        header.style.cssText = 'background: #000; color: #fff; padding: 2px 5px; font-weight: bold;';
        header.textContent = `  GNU nano 5.6.1         ${this.filename}${this.modified ? ' [Modified]' : ''}`;
        output.appendChild(header);
        
        // Content area
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'font-family: monospace; white-space: pre; padding: 5px; background: #000; color: #0f0; min-height: 400px;';
        
        const visibleLines = this.content.slice(this.scrollOffset, this.scrollOffset + this.visibleRows);
        
        for (let i = 0; i < visibleLines.length; i++) {
            const lineNum = this.scrollOffset + i;
            const line = visibleLines[i];
            const lineDiv = document.createElement('div');
            
            if (lineNum === this.cursorRow) {
                // Current line with cursor
                const before = line.slice(0, this.cursorCol);
                const cursor = line.charAt(this.cursorCol) || ' ';
                const after = line.slice(this.cursorCol + 1);
                
                lineDiv.innerHTML = `${this.escapeHtml(before)}<span style="background: #0f0; color: #000;">${this.escapeHtml(cursor)}</span>${this.escapeHtml(after)}`;
            } else {
                lineDiv.textContent = line;
            }
            
            contentDiv.appendChild(lineDiv);
        }
        
        output.appendChild(contentDiv);
        
        // Status bar
        const statusBar = document.createElement('div');
        statusBar.style.cssText = 'background: #fff; color: #000; padding: 2px 5px; font-weight: bold;';
        if (this.message) {
            statusBar.textContent = `  ${this.message}`;
        } else {
            statusBar.textContent = `  `;
        }
        output.appendChild(statusBar);
        
        // Command menu (bottom)
        const menu = document.createElement('div');
        menu.style.cssText = 'background: #000; color: #fff; padding: 5px; font-family: monospace; font-size: 11px;';
        menu.innerHTML = `^G Get Help  ^O Write Out ^W Where Is  ^K Cut Line   ^J Justify   ^C Cur Pos<br>^X Exit      ^R Read File ^\\\ Replace   ^U Uncut Line ^T To Spell  ^_ Go To Line`;
        output.appendChild(menu);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in terminal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NanoEditor;
}
