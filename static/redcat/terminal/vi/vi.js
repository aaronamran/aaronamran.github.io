// Vi/Vim Editor - Complete RHCSA Simulator
// Accurate emulation of vim for RHCSA exam practice

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
        this.modified = false;
        this.mode = 'normal'; // normal, insert, visual, command
        this.commandBuffer = '';
        this.message = '';
        this.messageTimeout = null;
        this.yankBuffer = [];
        this.visualStart = null;
        this.lastSearch = '';
        this.repeatCount = '';
        
        this.visibleRows = 21;
        this.maxCols = 80;
    }
    
    open(filename, initialContent = '') {
        this.filename = filename;
        this.content = initialContent.split('\n');
        if (this.content.length === 0) {
            this.content = [''];
        }
        this.cursorRow = 0;
        this.cursorCol = 0;
        this.scrollOffset = 0;
        this.modified = false;
        this.active = true;
        this.mode = 'normal';
        this.commandBuffer = '';
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
        
        const key = e.key;
        const ctrl = e.ctrlKey;
        const shift = e.shiftKey;
        
        if (this.mode === 'insert') {
            this.handleInsertMode(key, ctrl);
        } else if (this.mode === 'command') {
            this.handleCommandMode(key, ctrl);
        } else if (this.mode === 'visual') {
            this.handleVisualMode(key, ctrl, shift);
        } else {
            this.handleNormalMode(key, ctrl, shift);
        }
        
        // Only render if still active (in case exit() was called)
        if (this.active) {
            this.render();
        }
    }
    
    handleNormalMode(key, ctrl, shift) {
        // Don't process shift key by itself
        if (key === 'Shift' || key === 'Control' || key === 'Alt') {
            return;
        }
        
        if (key >= '0' && key <= '9') {
            this.repeatCount += key;
            return;
        }
        
        const count = parseInt(this.repeatCount) || 1;
        this.repeatCount = '';
        
        switch(key) {
            // Mode changes
            case 'i':
                this.enterInsertMode();
                break;
            case 'I':
                this.cursorCol = 0;
                this.enterInsertMode();
                break;
            case 'a':
                this.cursorCol = Math.min(this.cursorCol + 1, this.content[this.cursorRow].length);
                this.enterInsertMode();
                break;
            case 'A':
                this.cursorCol = this.content[this.cursorRow].length;
                this.enterInsertMode();
                break;
            case 'o':
                this.openLineBelow();
                this.enterInsertMode();
                break;
            case 'O':
                this.openLineAbove();
                this.enterInsertMode();
                break;
            case 'v':
                this.enterVisualMode();
                break;
            case 'V':
                this.enterVisualLineMode();
                break;
            case ':':
                this.enterCommandMode();
                break;
            
            // Movement
            case 'h':
            case 'ArrowLeft':
                for (let i = 0; i < count; i++) {
                    this.moveCursor(0, -1);
                }
                break;
            case 'j':
            case 'ArrowDown':
                for (let i = 0; i < count; i++) {
                    this.moveCursor(1, 0);
                }
                break;
            case 'k':
            case 'ArrowUp':
                for (let i = 0; i < count; i++) {
                    this.moveCursor(-1, 0);
                }
                break;
            case 'l':
            case 'ArrowRight':
                for (let i = 0; i < count; i++) {
                    this.moveCursor(0, 1);
                }
                break;
            case '0':
                this.cursorCol = 0;
                break;
            case '$':
                this.cursorCol = Math.max(0, this.content[this.cursorRow].length - 1);
                break;
            case 'w':
                for (let i = 0; i < count; i++) {
                    this.moveWordForward();
                }
                break;
            case 'b':
                for (let i = 0; i < count; i++) {
                    this.moveWordBackward();
                }
                break;
            case 'G':
                if (count > 1) {
                    this.goToLine(count);
                } else {
                    this.cursorRow = this.content.length - 1;
                    this.cursorCol = 0;
                    this.adjustScroll();
                }
                break;
            case 'g':
                if (this.commandBuffer === 'g') {
                    this.cursorRow = 0;
                    this.cursorCol = 0;
                    this.adjustScroll();
                    this.commandBuffer = '';
                } else {
                    this.commandBuffer = 'g';
                }
                break;
            
            // Editing
            case 'x':
                for (let i = 0; i < count; i++) {
                    this.deleteCharAtCursor();
                }
                break;
            case 'X':
                for (let i = 0; i < count; i++) {
                    this.deleteCharBeforeCursor();
                }
                break;
            case 'd':
                if (this.commandBuffer === 'd') {
                    for (let i = 0; i < count; i++) {
                        this.deleteLine();
                    }
                    this.commandBuffer = '';
                } else {
                    this.commandBuffer = 'd';
                }
                break;
            case 'D':
                this.deleteToEndOfLine();
                break;
            case 'y':
                if (this.commandBuffer === 'y') {
                    for (let i = 0; i < count; i++) {
                        this.yankLine();
                    }
                    this.commandBuffer = '';
                } else {
                    this.commandBuffer = 'y';
                }
                break;
            case 'Y':
                this.yankLine();
                break;
            case 'p':
                for (let i = 0; i < count; i++) {
                    this.pasteAfter();
                }
                break;
            case 'P':
                for (let i = 0; i < count; i++) {
                    this.pasteBefore();
                }
                break;
            case 'u':
                this.setMessage('[ Undo not available ]');
                break;
            case 'r':
                this.commandBuffer = 'r';
                break;
            case 'R':
                this.mode = 'replace';
                break;
            case 'c':
                if (this.commandBuffer === 'c') {
                    this.deleteLine();
                    this.enterInsertMode();
                    this.commandBuffer = '';
                }
                break;
            case 'C':
                this.deleteToEndOfLine();
                this.enterInsertMode();
                break;
            
            // Search
            case '/':
                this.enterCommandMode('/');
                break;
            case '?':
                this.enterCommandMode('?');
                break;
            case 'n':
                this.repeatSearch();
                break;
            case 'N':
                this.repeatSearchBackward();
                break;
            
            // Page navigation
            case 'PageUp':
                this.moveCursor(-this.visibleRows, 0);
                break;
            case 'PageDown':
                this.moveCursor(this.visibleRows, 0);
                break;
            
            default:
                if (this.commandBuffer === 'r' && key.length === 1) {
                    this.replaceChar(key);
                    this.commandBuffer = '';
                }
                break;
        }
        
        if (this.commandBuffer !== 'g' && this.commandBuffer !== 'd' && this.commandBuffer !== 'y' && this.commandBuffer !== 'r') {
            this.commandBuffer = '';
        }
    }
    
    handleInsertMode(key, ctrl) {
        // Don't process modifier keys by themselves
        if (key === 'Shift' || key === 'Control' || key === 'Alt') {
            return;
        }
        
        if (key === 'Escape' || (ctrl && key === 'c')) {
            this.exitInsertMode();
            return;
        }
        
        switch(key) {
            case 'Enter':
                this.insertNewline();
                break;
            case 'Backspace':
                this.deleteChar();
                break;
            case 'Delete':
                this.deleteCharAtCursor();
                break;
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
            case 'Tab':
                this.insertText('    ');
                break;
            default:
                if (key.length === 1) {
                    this.insertText(key);
                }
                break;
        }
    }
    
    handleVisualMode(key, ctrl, shift) {
        // Don't process modifier keys by themselves
        if (key === 'Shift' || key === 'Control' || key === 'Alt') {
            return;
        }
        
        if (key === 'Escape' || (ctrl && key === 'c')) {
            this.exitVisualMode();
            return;
        }
        
        switch(key) {
            case 'h':
            case 'ArrowLeft':
                this.moveCursor(0, -1);
                break;
            case 'j':
            case 'ArrowDown':
                this.moveCursor(1, 0);
                break;
            case 'k':
            case 'ArrowUp':
                this.moveCursor(-1, 0);
                break;
            case 'l':
            case 'ArrowRight':
                this.moveCursor(0, 1);
                break;
            case 'd':
            case 'x':
                this.deleteVisualSelection();
                break;
            case 'y':
                this.yankVisualSelection();
                this.exitVisualMode();
                break;
            case ':':
                this.enterCommandMode();
                break;
        }
    }
    
    handleCommandMode(key, ctrl) {
        // Don't process modifier keys by themselves
        if (key === 'Shift' || key === 'Control' || key === 'Alt') {
            return;
        }
        
        if (key === 'Escape' || (ctrl && key === 'c')) {
            this.mode = 'normal';
            this.commandBuffer = '';
            return;
        }
        
        if (key === 'Enter') {
            this.executeCommand();
            return;
        }
        
        if (key === 'Backspace') {
            this.commandBuffer = this.commandBuffer.slice(0, -1);
            if (this.commandBuffer.length === 0) {
                this.mode = 'normal';
            }
            return;
        }
        
        if (key.length === 1 && !ctrl) {
            this.commandBuffer += key;
        }
    }
    
    enterInsertMode() {
        this.mode = 'insert';
        this.setMessage('-- INSERT --');
    }
    
    exitInsertMode() {
        this.mode = 'normal';
        if (this.cursorCol > 0 && this.cursorCol >= this.content[this.cursorRow].length) {
            this.cursorCol = Math.max(0, this.content[this.cursorRow].length - 1);
        }
        this.message = '';
    }
    
    enterVisualMode() {
        this.mode = 'visual';
        this.visualStart = { row: this.cursorRow, col: this.cursorCol };
        this.setMessage('-- VISUAL --');
    }
    
    enterVisualLineMode() {
        this.mode = 'visual-line';
        this.visualStart = { row: this.cursorRow, col: 0 };
        this.setMessage('-- VISUAL LINE --');
    }
    
    exitVisualMode() {
        this.mode = 'normal';
        this.visualStart = null;
        this.message = '';
    }
    
    enterCommandMode(prefix = ':') {
        this.mode = 'command';
        this.commandBuffer = prefix;
    }
    
    executeCommand() {
        const cmd = this.commandBuffer.trim();
        
        this.mode = 'normal';
        this.commandBuffer = '';
        
        // Empty command
        if (!cmd) {
            return;
        }
        
        // Handle search commands
        if (cmd.startsWith('/')) {
            const searchTerm = cmd.slice(1);
            if (searchTerm) {
                this.searchForward(searchTerm);
            }
            return;
        }
        
        if (cmd.startsWith('?')) {
            const searchTerm = cmd.slice(1);
            if (searchTerm) {
                this.searchBackward(searchTerm);
            }
            return;
        }
        
        // Handle colon commands (remove leading : if present)
        const colonCmd = cmd.startsWith(':') ? cmd.slice(1) : cmd;
        
        if (!colonCmd) {
            return;
        }
        
        const parts = colonCmd.trim().split(/\s+/);
        const command = parts[0];
        
        // Line number (e.g., "123" to go to line 123)
        const lineMatch = colonCmd.match(/^(\d+)$/);
        if (lineMatch) {
            this.goToLine(parseInt(lineMatch[1]));
            return;
        }
        
        // Substitution (e.g., "s/find/replace/g")
        const substMatch = colonCmd.match(/^s?\/(.+?)\/(.*)\/([gi]*)$/);
        if (substMatch) {
            this.substitute(substMatch[1], substMatch[2], substMatch[3]);
            return;
        }
        
        switch(command) {
            case 'w':
            case 'write':
                if (parts[1]) {
                    this.filename = parts[1];
                }
                this.saveFile();
                break;
            case 'q':
            case 'quit':
                if (this.modified) {
                    this.setMessage('No write since last change (add ! to override)');
                } else {
                    this.exit();
                }
                break;
            case 'q!':
            case 'quit!':
                this.exit();
                break;
            case 'wq':
            case 'x':
                if (this.filename) {
                    this.saveFile();
                    this.exit();
                } else {
                    this.setMessage('No file name');
                }
                break;
            case 'wq!':
            case 'x!':
                this.saveFile();
                this.exit();
                break;
            case 'e':
            case 'edit':
                if (parts[1]) {
                    this.loadFile(parts[1]);
                }
                break;
            case 'set':
                this.setMessage(`[ set ${parts.slice(1).join(' ')} ]`);
                break;
            default:
                this.setMessage(`Not an editor command: ${command}`);
                break;
        }
    }
    
    moveCursor(rowDelta, colDelta) {
        this.cursorRow = Math.max(0, Math.min(this.content.length - 1, this.cursorRow + rowDelta));
        
        const maxCol = Math.max(0, this.content[this.cursorRow].length - (this.mode === 'normal' ? 1 : 0));
        this.cursorCol += colDelta;
        this.cursorCol = Math.max(0, Math.min(maxCol, this.cursorCol));
        
        this.adjustScroll();
    }
    
    adjustScroll() {
        if (this.cursorRow < this.scrollOffset) {
            this.scrollOffset = this.cursorRow;
        } else if (this.cursorRow >= this.scrollOffset + this.visibleRows) {
            this.scrollOffset = this.cursorRow - this.visibleRows + 1;
        }
    }
    
    moveWordForward() {
        const line = this.content[this.cursorRow];
        let col = this.cursorCol;
        
        while (col < line.length && /\s/.test(line[col])) col++;
        while (col < line.length && !/\s/.test(line[col])) col++;
        
        if (col >= line.length && this.cursorRow < this.content.length - 1) {
            this.cursorRow++;
            this.cursorCol = 0;
            this.adjustScroll();
        } else {
            this.cursorCol = col;
        }
    }
    
    moveWordBackward() {
        let col = this.cursorCol;
        
        if (col > 0) {
            col--;
            const line = this.content[this.cursorRow];
            while (col > 0 && /\s/.test(line[col])) col--;
            while (col > 0 && !/\s/.test(line[col - 1])) col--;
            this.cursorCol = col;
        } else if (this.cursorRow > 0) {
            this.cursorRow--;
            this.cursorCol = Math.max(0, this.content[this.cursorRow].length - 1);
            this.adjustScroll();
        }
    }
    
    goToLine(lineNum) {
        this.cursorRow = Math.max(0, Math.min(lineNum - 1, this.content.length - 1));
        this.cursorCol = 0;
        this.adjustScroll();
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
        
        this.adjustScroll();
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
    
    deleteCharAtCursor() {
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
    
    deleteCharBeforeCursor() {
        if (this.cursorCol > 0) {
            this.moveCursor(0, -1);
            this.deleteCharAtCursor();
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
        this.cursorCol = Math.min(this.cursorCol, Math.max(0, this.content[this.cursorRow].length - 1));
        this.modified = true;
    }
    
    deleteToEndOfLine() {
        const line = this.content[this.cursorRow];
        this.yankBuffer = [line.slice(this.cursorCol)];
        this.content[this.cursorRow] = line.slice(0, this.cursorCol);
        this.modified = true;
    }
    
    yankLine() {
        this.yankBuffer = [this.content[this.cursorRow]];
        this.setMessage('1 line yanked');
    }
    
    pasteAfter() {
        if (this.yankBuffer.length === 0) return;
        
        if (this.yankBuffer[0].includes('\n') || this.yankBuffer.length > 1) {
            this.content.splice(this.cursorRow + 1, 0, ...this.yankBuffer);
            this.cursorRow++;
        } else {
            const line = this.content[this.cursorRow];
            const pastePos = Math.min(this.cursorCol + 1, line.length);
            this.content[this.cursorRow] = line.slice(0, pastePos) + this.yankBuffer[0] + line.slice(pastePos);
            this.cursorCol = pastePos;
        }
        
        this.modified = true;
    }
    
    pasteBefore() {
        if (this.yankBuffer.length === 0) return;
        
        if (this.yankBuffer[0].includes('\n') || this.yankBuffer.length > 1) {
            this.content.splice(this.cursorRow, 0, ...this.yankBuffer);
        } else {
            const line = this.content[this.cursorRow];
            this.content[this.cursorRow] = line.slice(0, this.cursorCol) + this.yankBuffer[0] + line.slice(this.cursorCol);
        }
        
        this.modified = true;
    }
    
    replaceChar(char) {
        const line = this.content[this.cursorRow];
        if (this.cursorCol < line.length) {
            this.content[this.cursorRow] = line.slice(0, this.cursorCol) + char + line.slice(this.cursorCol + 1);
            this.modified = true;
        }
    }
    
    openLineBelow() {
        this.content.splice(this.cursorRow + 1, 0, '');
        this.cursorRow++;
        this.cursorCol = 0;
        this.modified = true;
        this.adjustScroll();
    }
    
    openLineAbove() {
        this.content.splice(this.cursorRow, 0, '');
        this.cursorCol = 0;
        this.modified = true;
    }
    
    deleteVisualSelection() {
        if (!this.visualStart) return;
        
        const start = this.visualStart.row;
        const end = this.cursorRow;
        const [first, last] = start <= end ? [start, end] : [end, start];
        
        this.yankBuffer = this.content.slice(first, last + 1);
        this.content.splice(first, last - first + 1);
        
        if (this.content.length === 0) {
            this.content = [''];
        }
        
        this.cursorRow = Math.min(first, this.content.length - 1);
        this.cursorCol = 0;
        this.exitVisualMode();
        this.modified = true;
    }
    
    yankVisualSelection() {
        if (!this.visualStart) return;
        
        const start = this.visualStart.row;
        const end = this.cursorRow;
        const [first, last] = start <= end ? [start, end] : [end, start];
        
        this.yankBuffer = this.content.slice(first, last + 1);
        this.setMessage(`${last - first + 1} lines yanked`);
    }
    
    searchForward(term) {
        this.lastSearch = term;
        const startRow = this.cursorRow;
        const startCol = this.cursorCol + 1;
        
        for (let i = startRow; i < this.content.length; i++) {
            const searchFrom = (i === startRow) ? startCol : 0;
            const index = this.content[i].indexOf(term, searchFrom);
            if (index !== -1) {
                this.cursorRow = i;
                this.cursorCol = index;
                this.adjustScroll();
                return;
            }
        }
        
        for (let i = 0; i <= startRow; i++) {
            const searchTo = (i === startRow) ? startCol : this.content[i].length;
            const index = this.content[i].indexOf(term);
            if (index !== -1 && index < searchTo) {
                this.cursorRow = i;
                this.cursorCol = index;
                this.adjustScroll();
                this.setMessage('search hit BOTTOM, continuing at TOP');
                return;
            }
        }
        
        this.setMessage(`Pattern not found: ${term}`);
    }
    
    searchBackward(term) {
        this.lastSearch = term;
        this.setMessage('Backward search not fully implemented');
    }
    
    repeatSearch() {
        if (this.lastSearch) {
            this.searchForward(this.lastSearch);
        }
    }
    
    repeatSearchBackward() {
        this.setMessage('Backward search not fully implemented');
    }
    
    substitute(pattern, replacement, flags) {
        const global = flags.includes('g');
        let count = 0;
        
        if (global) {
            for (let i = 0; i < this.content.length; i++) {
                const newLine = this.content[i].replace(new RegExp(pattern, 'g'), replacement);
                if (newLine !== this.content[i]) {
                    this.content[i] = newLine;
                    count++;
                }
            }
        } else {
            const line = this.content[this.cursorRow];
            const newLine = line.replace(new RegExp(pattern), replacement);
            if (newLine !== line) {
                this.content[this.cursorRow] = newLine;
                count = 1;
            }
        }
        
        if (count > 0) {
            this.modified = true;
            this.setMessage(`${count} substitution${count !== 1 ? 's' : ''} on ${count} line${count !== 1 ? 's' : ''}`);
        } else {
            this.setMessage('Pattern not found');
        }
    }
    
    saveFile() {
        if (!this.filename) {
            this.setMessage('No file name');
            return;
        }
        
        const fileContent = this.content.join('\n');
        
        // Get parent directory and filename
        const parentPath = this.fs.getParentPath(this.filename);
        const basename = this.fs.getBasename(this.filename);
        const parent = this.fs.getNode(parentPath);
        
        if (!parent) {
            this.setMessage(`Error: Directory ${parentPath} not found`);
            return;
        }
        
        if (!this.fs.hasPermission(parent, 'w')) {
            this.setMessage(`Error: Permission denied`);
            return;
        }
        
        // Create or update file
        const existingFile = parent.children[basename];
        if (existingFile && existingFile.type === 'file') {
            existingFile.content = fileContent;
            existingFile.size = fileContent.length;
            existingFile.modified = new Date();
        } else {
            parent.children[basename] = {
                type: 'file',
                permissions: '0644',
                owner: this.fs.currentUser,
                group: this.fs.users[this.fs.currentUser].group,
                size: fileContent.length,
                modified: new Date(),
                content: fileContent
            };
        }
        
        this.modified = false;
        const lines = this.content.length;
        const chars = fileContent.length;
        this.setMessage(`"${this.filename}" ${lines}L, ${chars}C written`);
    }
    
    loadFile(filename) {
        const node = this.fs.getNode(filename);
        
        if (!node) {
            this.setMessage(`Error: ${filename}: No such file or directory`);
            return;
        }
        
        if (node.type !== 'file') {
            this.setMessage(`Error: ${filename}: Not a file`);
            return;
        }
        
        if (!this.fs.hasPermission(node, 'r')) {
            this.setMessage(`Error: Permission denied`);
            return;
        }
        
        this.filename = filename;
        this.content = (node.content || '').split('\n');
        if (this.content.length === 0) {
            this.content = [''];
        }
        this.cursorRow = 0;
        this.cursorCol = 0;
        this.scrollOffset = 0;
        this.modified = false;
        const chars = node.content ? node.content.length : 0;
        this.setMessage(`"${filename}" ${this.content.length}L, ${chars}C`);
    }
    
    exit() {
        this.active = false;
        this.detachEventListeners();
        this.terminal.restoreFromEditor();
    }
    
    setMessage(msg) {
        this.message = msg;
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        if (msg && !msg.includes('INSERT') && !msg.includes('VISUAL')) {
            this.messageTimeout = setTimeout(() => {
                if (!this.message.includes('INSERT') && !this.message.includes('VISUAL')) {
                    this.message = '';
                    this.render();
                }
            }, 3000);
        }
    }
    
    render() {
        if (!this.active) return;
        
        const output = this.terminal.output;
        output.innerHTML = '';
        
        const container = document.createElement('div');
        container.style.cssText = 'font-family: "Courier New", Courier, monospace; font-size: 13px; background: #000; color: #c0c0c0; height: 100%; display: flex; flex-direction: column;';
        
        // Content
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'flex: 1; padding: 0; background: #000; overflow: hidden; white-space: pre; font-family: "Courier New", Courier, monospace;';
        
        for (let i = 0; i < this.visibleRows; i++) {
            const lineNum = this.scrollOffset + i;
            const lineDiv = document.createElement('div');
            lineDiv.style.cssText = 'padding: 0 2px; line-height: 1.3;';
            
            if (lineNum < this.content.length) {
                const line = this.content[lineNum];
                const isVisualSelected = this.mode.startsWith('visual') && this.visualStart && 
                    ((this.visualStart.row <= lineNum && lineNum <= this.cursorRow) ||
                     (this.cursorRow <= lineNum && lineNum <= this.visualStart.row));
                
                if (lineNum === this.cursorRow && this.mode !== 'command') {
                    const before = this.escapeHtml(line.slice(0, this.cursorCol));
                    const cursorChar = line.charAt(this.cursorCol) || ' ';
                    const after = this.escapeHtml(line.slice(this.cursorCol + 1));
                    
                    const cursorStyle = isVisualSelected ? 
                        'background: #808080; color: #000;' : 
                        'background: #00ff00; color: #000; font-weight: bold;';
                    
                    lineDiv.innerHTML = `${before}<span style="${cursorStyle}">${this.escapeHtml(cursorChar)}</span>${after}`;
                } else {
                    if (isVisualSelected) {
                        lineDiv.innerHTML = `<span style="background: #404040; color: #fff;">${this.escapeHtml(line) || ' '}</span>`;
                    } else {
                        lineDiv.textContent = line || ' ';
                    }
                }
            } else {
                lineDiv.innerHTML = '<span style="color: #0000ff;">~</span>';
            }
            
            contentDiv.appendChild(lineDiv);
        }
        
        container.appendChild(contentDiv);
        
        // Status line
        const statusLine = document.createElement('div');
        statusLine.style.cssText = 'background: #c0c0c0; color: #000; padding: 2px 4px; font-weight: bold; white-space: nowrap;';
        
        if (this.mode === 'command') {
            // Display command buffer with colon prefix if not present
            const displayCmd = this.commandBuffer.startsWith(':') || this.commandBuffer.startsWith('/') || this.commandBuffer.startsWith('?')
                ? this.commandBuffer 
                : ':' + this.commandBuffer;
            statusLine.textContent = displayCmd;
        } else {
            const modFlag = this.modified ? '[+]' : '';
            const filename = this.filename || '[No Name]';
            const lineInfo = `${this.cursorRow + 1},${this.cursorCol + 1}`;
            const percent = Math.round(((this.cursorRow + 1) / this.content.length) * 100);
            
            statusLine.textContent = ` ${filename} ${modFlag} ${this.content.length} lines --${percent}%-- ${lineInfo}`;
        }
        
        container.appendChild(statusLine);
        
        // Message/mode line
        const messageLine = document.createElement('div');
        messageLine.style.cssText = 'background: #000; color: #c0c0c0; padding: 2px 4px; min-height: 18px;';
        messageLine.textContent = this.message || '';
        container.appendChild(messageLine);
        
        output.appendChild(container);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViEditor;
}
