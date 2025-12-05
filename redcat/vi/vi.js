// RHCSA Vi/Vim Editor
// Simulates vi/vim modal text editor for RHCSA practice

class ViEditor {
    constructor(terminal, filesystem) {
        this.terminal = terminal;
        this.fs = filesystem;
        this.active = false;
        this.filename = '';
        this.content = [];
        this.cursorRow = 0;
        this.cursorCol = 0;
        this.scrollOffset = 0;
        this.mode = 'normal'; // normal, insert, visual, command
        this.modified = false;
        this.message = '';
        this.commandBuffer = '';
        this.yankBuffer = [];
        this.searchTerm = '';
        this.lastCommand = '';
        
        // Visible area
        this.visibleRows = 22;
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
        this.mode = 'normal';
        this.modified = false;
        this.active = true;
        this.message = '';
        this.commandBuffer = '';
        
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
        
        const key = e.key;
        const ctrl = e.ctrlKey;
        const shift = e.shiftKey;
        
        // Command mode
        if (this.mode === 'command') {
            e.preventDefault();
            this.handleCommandMode(key, e);
            this.render();
            return;
        }
        
        // Insert mode
        if (this.mode === 'insert') {
            if (key === 'Escape') {
                e.preventDefault();
                this.mode = 'normal';
                if (this.cursorCol > 0) this.cursorCol--;
                this.setMessage('');
            } else if (key === 'Backspace') {
                e.preventDefault();
                this.deleteChar();
            } else if (key === 'Delete') {
                e.preventDefault();
                this.deleteCharForward();
            } else if (key === 'Enter') {
                e.preventDefault();
                this.insertNewline();
            } else if (key === 'ArrowUp') {
                e.preventDefault();
                this.moveCursor(-1, 0);
            } else if (key === 'ArrowDown') {
                e.preventDefault();
                this.moveCursor(1, 0);
            } else if (key === 'ArrowLeft') {
                e.preventDefault();
                this.moveCursor(0, -1);
            } else if (key === 'ArrowRight') {
                e.preventDefault();
                this.moveCursor(0, 1);
            } else if (key === 'Tab') {
                e.preventDefault();
                this.insertText('    ');
            } else if (key.length === 1 && !ctrl) {
                e.preventDefault();
                this.insertText(key);
            }
            this.render();
            return;
        }
        
        // Normal mode
        if (this.mode === 'normal') {
            e.preventDefault();
            this.handleNormalMode(key, ctrl, shift);
            this.render();
            return;
        }
        
        // Visual mode (basic)
        if (this.mode === 'visual') {
            e.preventDefault();
            if (key === 'Escape') {
                this.mode = 'normal';
                this.setMessage('');
            } else if (key === 'y') {
                this.yankSelection();
            } else if (key === 'd') {
                this.deleteSelection();
            }
            this.render();
            return;
        }
    }
    
    handleNormalMode(key, ctrl, shift) {
        switch(key) {
            // Mode switches
            case 'i':
                this.mode = 'insert';
                this.setMessage('-- INSERT --');
                break;
            case 'I':
                this.cursorCol = 0;
                this.mode = 'insert';
                this.setMessage('-- INSERT --');
                break;
            case 'a':
                this.cursorCol = Math.min(this.content[this.cursorRow].length, this.cursorCol + 1);
                this.mode = 'insert';
                this.setMessage('-- INSERT --');
                break;
            case 'A':
                this.cursorCol = this.content[this.cursorRow].length;
                this.mode = 'insert';
                this.setMessage('-- INSERT --');
                break;
            case 'o':
                this.content.splice(this.cursorRow + 1, 0, '');
                this.cursorRow++;
                this.cursorCol = 0;
                this.mode = 'insert';
                this.modified = true;
                this.setMessage('-- INSERT --');
                break;
            case 'O':
                this.content.splice(this.cursorRow, 0, '');
                this.cursorCol = 0;
                this.mode = 'insert';
                this.modified = true;
                this.setMessage('-- INSERT --');
                break;
            case 'v':
                this.mode = 'visual';
                this.setMessage('-- VISUAL --');
                break;
            case ':':
                this.mode = 'command';
                this.commandBuffer = ':';
                break;
            case '/':
                this.mode = 'command';
                this.commandBuffer = '/';
                break;
                
            // Navigation
            case 'h':
            case 'ArrowLeft':
                this.moveCursor(0, -1);
                break;
            case 'l':
            case 'ArrowRight':
                this.moveCursor(0, 1);
                break;
            case 'j':
            case 'ArrowDown':
                this.moveCursor(1, 0);
                break;
            case 'k':
            case 'ArrowUp':
                this.moveCursor(-1, 0);
                break;
            case 'w':
                this.moveWordForward();
                break;
            case 'b':
                this.moveWordBackward();
                break;
            case '0':
            case 'Home':
                this.cursorCol = 0;
                break;
            case '$':
            case 'End':
                this.cursorCol = Math.max(0, this.content[this.cursorRow].length - 1);
                break;
            case 'g':
                if (this.lastKey === 'g') {
                    this.cursorRow = 0;
                    this.cursorCol = 0;
                    this.scrollOffset = 0;
                }
                break;
            case 'G':
                this.cursorRow = this.content.length - 1;
                this.cursorCol = 0;
                this.scrollOffset = Math.max(0, this.content.length - this.visibleRows);
                break;
                
            // Editing
            case 'x':
                this.deleteCharForward();
                this.modified = true;
                break;
            case 'X':
                this.deleteChar();
                this.modified = true;
                break;
            case 'd':
                if (this.lastKey === 'd') {
                    this.deleteLine();
                }
                break;
            case 'y':
                if (this.lastKey === 'y') {
                    this.yankLine();
                }
                break;
            case 'p':
                this.pasteLine();
                break;
            case 'P':
                this.pasteLineBefore();
                break;
            case 'u':
                this.setMessage('Undo not implemented in this version');
                break;
            case 'r':
                ctrl && this.setMessage('Redo not implemented in this version');
                break;
            case 'J':
                this.joinLines();
                break;
                
            // Page navigation
            case 'PageUp':
                this.moveCursor(-this.visibleRows, 0);
                break;
            case 'PageDown':
                this.moveCursor(this.visibleRows, 0);
                break;
        }
        
        this.lastKey = key;
    }
    
    handleCommandMode(key, event) {
        if (key === 'Escape') {
            this.mode = 'normal';
            this.commandBuffer = '';
            this.setMessage('');
            return;
        }
        
        if (key === 'Enter') {
            this.executeCommand(this.commandBuffer);
            this.commandBuffer = '';
            this.mode = 'normal';
            return;
        }
        
        if (key === 'Backspace') {
            this.commandBuffer = this.commandBuffer.slice(0, -1);
            if (this.commandBuffer === '') {
                this.mode = 'normal';
            }
            return;
        }
        
        if (key.length === 1 && !event.ctrlKey) {
            this.commandBuffer += key;
        }
    }
    
    executeCommand(cmd) {
        if (cmd.startsWith(':')) {
            const command = cmd.slice(1).trim();
            
            // Parse command
            if (command === 'q' || command === 'quit') {
                if (this.modified) {
                    this.setMessage('No write since last change (add ! to override)');
                } else {
                    this.exit();
                }
            } else if (command === 'q!' || command === 'quit!') {
                this.exit();
            } else if (command === 'w' || command === 'write') {
                this.saveFile();
            } else if (command === 'wq' || command === 'x') {
                this.saveFile();
                if (!this.modified) { // Only exit if save succeeded
                    this.exit();
                }
            } else if (command.startsWith('w ')) {
                const filename = command.slice(2).trim();
                this.filename = filename;
                this.saveFile();
            } else if (command.match(/^\d+$/)) {
                // Go to line number
                const lineNum = parseInt(command) - 1;
                this.cursorRow = Math.max(0, Math.min(this.content.length - 1, lineNum));
                this.cursorCol = 0;
            } else if (command === 'help') {
                this.setMessage('Vi commands: :q :w :wq :q! | i a o O | h j k l | dd yy p u');
            } else if (command.startsWith('s/')) {
                // Simple substitute (current line only)
                this.substituteCurrentLine(command);
            } else {
                this.setMessage(`Not an editor command: ${command}`);
            }
        } else if (cmd.startsWith('/')) {
            const searchTerm = cmd.slice(1);
            this.searchForward(searchTerm);
        }
    }
    
    substituteCurrentLine(cmd) {
        // Parse s/pattern/replacement/flags
        const match = cmd.match(/^s\/(.+?)\/(.*)\/?(g?)$/);
        if (!match) {
            this.setMessage('Invalid substitute syntax');
            return;
        }
        
        const pattern = match[1];
        const replacement = match[2];
        const global = match[3] === 'g';
        
        const line = this.content[this.cursorRow];
        try {
            const regex = new RegExp(pattern, global ? 'g' : '');
            const newLine = line.replace(regex, replacement);
            if (newLine !== line) {
                this.content[this.cursorRow] = newLine;
                this.modified = true;
                this.setMessage('Substitution complete');
            } else {
                this.setMessage('Pattern not found');
            }
        } catch (e) {
            this.setMessage('Invalid regex pattern');
        }
    }
    
    searchForward(term) {
        this.searchTerm = term;
        for (let i = this.cursorRow; i < this.content.length; i++) {
            const startCol = (i === this.cursorRow) ? this.cursorCol + 1 : 0;
            const index = this.content[i].indexOf(term, startCol);
            if (index !== -1) {
                this.cursorRow = i;
                this.cursorCol = index;
                this.setMessage(`Found: ${term}`);
                return;
            }
        }
        this.setMessage(`Pattern not found: ${term}`);
    }
    
    moveCursor(rowDelta, colDelta) {
        this.cursorRow = Math.max(0, Math.min(this.content.length - 1, this.cursorRow + rowDelta));
        const maxCol = this.mode === 'insert' ? 
            this.content[this.cursorRow].length : 
            Math.max(0, this.content[this.cursorRow].length - 1);
        this.cursorCol = Math.max(0, Math.min(maxCol, this.cursorCol + colDelta));
        
        // Adjust scroll offset
        if (this.cursorRow < this.scrollOffset) {
            this.scrollOffset = this.cursorRow;
        } else if (this.cursorRow >= this.scrollOffset + this.visibleRows) {
            this.scrollOffset = this.cursorRow - this.visibleRows + 1;
        }
    }
    
    moveWordForward() {
        const line = this.content[this.cursorRow];
        let pos = this.cursorCol + 1;
        while (pos < line.length && /\s/.test(line[pos])) pos++;
        while (pos < line.length && !/\s/.test(line[pos])) pos++;
        this.cursorCol = Math.min(line.length - 1, pos);
    }
    
    moveWordBackward() {
        const line = this.content[this.cursorRow];
        let pos = this.cursorCol - 1;
        while (pos > 0 && /\s/.test(line[pos])) pos--;
        while (pos > 0 && !/\s/.test(line[pos])) pos--;
        this.cursorCol = Math.max(0, pos);
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
        
        if (this.cursorRow >= this.scrollOffset + this.visibleRows) {
            this.scrollOffset++;
        }
    }
    
    deleteChar() {
        if (this.cursorCol > 0) {
            const line = this.content[this.cursorRow];
            this.content[this.cursorRow] = line.slice(0, this.cursorCol - 1) + line.slice(this.cursorCol);
            this.cursorCol--;
            this.modified = true;
        } else if (this.cursorRow > 0) {
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
            this.content[this.cursorRow] += this.content[this.cursorRow + 1];
            this.content.splice(this.cursorRow + 1, 1);
            this.modified = true;
        }
    }
    
    deleteLine() {
        this.yankBuffer = [this.content[this.cursorRow]];
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
    
    yankLine() {
        this.yankBuffer = [this.content[this.cursorRow]];
        this.setMessage('1 line yanked');
    }
    
    pasteLine() {
        if (this.yankBuffer.length > 0) {
            this.content.splice(this.cursorRow + 1, 0, ...this.yankBuffer);
            this.cursorRow++;
            this.modified = true;
        }
    }
    
    pasteLineBefore() {
        if (this.yankBuffer.length > 0) {
            this.content.splice(this.cursorRow, 0, ...this.yankBuffer);
            this.modified = true;
        }
    }
    
    joinLines() {
        if (this.cursorRow < this.content.length - 1) {
            this.content[this.cursorRow] += ' ' + this.content[this.cursorRow + 1];
            this.content.splice(this.cursorRow + 1, 1);
            this.modified = true;
        }
    }
    
    yankSelection() {
        this.setMessage('Visual yank not fully implemented');
        this.mode = 'normal';
    }
    
    deleteSelection() {
        this.setMessage('Visual delete not fully implemented');
        this.mode = 'normal';
    }
    
    saveFile() {
        const fileContent = this.content.join('\n');
        const result = this.fs.writeFile(this.filename, fileContent);
        
        if (result.success) {
            this.modified = false;
            const lines = this.content.length;
            const chars = fileContent.length;
            this.setMessage(`"${this.filename}" ${lines}L, ${chars}C written`);
        } else {
            this.setMessage(`Error writing ${this.filename}: ${result.error}`);
        }
    }
    
    exit() {
        this.active = false;
        this.detachEventListeners();
        this.terminal.restoreFromEditor();
    }
    
    setMessage(msg) {
        this.message = msg;
    }
    
    render() {
        if (!this.active) return;
        
        const output = this.terminal.output;
        output.innerHTML = '';
        
        // Content area
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'font-family: monospace; white-space: pre; padding: 5px; background: #000; color: #0f0; min-height: 450px;';
        
        const visibleLines = this.content.slice(this.scrollOffset, this.scrollOffset + this.visibleRows);
        
        for (let i = 0; i < this.visibleRows; i++) {
            const lineNum = this.scrollOffset + i;
            const lineDiv = document.createElement('div');
            
            if (lineNum < this.content.length) {
                const line = this.content[lineNum];
                
                if (lineNum === this.cursorRow && this.mode !== 'command') {
                    // Current line with cursor
                    const before = line.slice(0, this.cursorCol);
                    const cursor = line.charAt(this.cursorCol) || ' ';
                    const after = line.slice(this.cursorCol + 1);
                    
                    const cursorStyle = this.mode === 'insert' ? 
                        'background: #0f0; color: #000; border-left: 2px solid #0f0;' :
                        'background: #0f0; color: #000;';
                    
                    lineDiv.innerHTML = `${this.escapeHtml(before)}<span style="${cursorStyle}">${this.escapeHtml(cursor)}</span>${this.escapeHtml(after)}`;
                } else {
                    lineDiv.textContent = line;
                }
            } else {
                lineDiv.innerHTML = '<span style="color: #00f;">~</span>';
            }
            
            contentDiv.appendChild(lineDiv);
        }
        
        output.appendChild(contentDiv);
        
        // Status line
        const statusLine = document.createElement('div');
        statusLine.style.cssText = 'background: #fff; color: #000; padding: 2px 5px; font-weight: bold;';
        
        if (this.mode === 'command') {
            statusLine.textContent = this.commandBuffer;
        } else if (this.message) {
            statusLine.textContent = this.message;
        } else {
            const modFlag = this.modified ? '[+]' : '';
            const lineInfo = `${this.cursorRow + 1},${this.cursorCol + 1}`;
            const totalLines = this.content.length;
            statusLine.textContent = `"${this.filename}" ${modFlag} ${lineInfo}  ${totalLines}L`;
        }
        
        output.appendChild(statusLine);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in terminal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViEditor;
}
