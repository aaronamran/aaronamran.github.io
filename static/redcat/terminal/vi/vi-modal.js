// Vi Modal Editor for Section 4 - Shell Scripting
// Provides a popup text editor for creating bash scripts

class ViModal {
    constructor(terminal, filesystem) {
        this.terminal = terminal;
        this.fs = filesystem;
        this.filename = '';
        this.content = '';
        this.active = false;
        this.modal = null;
        this.textarea = null;
    }

    open(filename, initialContent = '') {
        this.filename = filename;
        this.content = initialContent;
        this.active = true;
        
        this.createModal();
        this.attachEventListeners();
    }

    createModal() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'vi-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-right: 2%;
            z-index: 10000;
        `;

        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = 'vi-modal-container';
        this.modal.style.cssText = `
            background: var(--bg-panel);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            width: 62%;
            max-width: 900px;
            height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 32px var(--shadow);
        `;

        // Create header
        const header = document.createElement('div');
        header.className = 'vi-modal-header';
        header.style.cssText = `
            background: var(--bg-panel);
            color: var(--text-primary);
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 15px;
            border-radius: 6px 6px 0 0;
        `;
        header.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Vi Editor - ${this.filename}</span>
                <span style="color: var(--text-muted); font-size: 12px;">Press Esc to exit without saving</span>
            </div>
        `;

        // Create textarea for content
        this.textarea = document.createElement('textarea');
        this.textarea.className = 'vi-modal-textarea';
        this.textarea.value = this.content;
        this.textarea.style.cssText = `
            flex: 1;
            background: var(--bg-terminal);
            color: var(--text-secondary);
            border: none;
            padding: 16px;
            font-family: Consolas, 'Courier New', monospace;
            font-size: 15px;
            line-height: 1.8;
            resize: none;
            outline: none;
            overflow-y: auto;
        `;
        this.textarea.placeholder = 'Type your bash script here...\n\nExample:\n#!/bin/bash\necho "Hello World"';

        // Tab key inserts 4 spaces for indentation (visual only, doesn't affect script logic)
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.textarea.selectionStart;
                const end = this.textarea.selectionEnd;
                const val = this.textarea.value;
                this.textarea.value = val.substring(0, start) + '    ' + val.substring(end);
                this.textarea.selectionStart = this.textarea.selectionEnd = start + 4;
            }
        });

        // Create footer with buttons
        const footer = document.createElement('div');
        footer.className = 'vi-modal-footer';
        footer.style.cssText = `
            background: var(--bg-panel);
            padding: 12px 16px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 0 0 6px 6px;
        `;

        const helpText = document.createElement('div');
        helpText.style.cssText = `
            color: var(--text-muted);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
        `;
        helpText.textContent = 'Esc to cancel without saving';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 8px;';

        const saveButton = document.createElement('button');
        saveButton.className = 'vi-modal-button vi-save';
        saveButton.textContent = 'Save & Exit (:wq)';
        saveButton.style.cssText = `
            background: var(--accent-red);
            color: var(--text-secondary);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        `;
        saveButton.onmouseover = () => saveButton.style.background = 'var(--accent-coral)';
        saveButton.onmouseout = () => saveButton.style.background = 'var(--accent-red)';
        saveButton.onclick = () => this.save();
        saveButton.tabIndex = -1;

        const cancelButton = document.createElement('button');
        cancelButton.className = 'vi-modal-button vi-cancel';
        cancelButton.textContent = 'Cancel (:q!)';
        cancelButton.style.cssText = `
            background: var(--bg-terminal);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 10px 20px;
            border-radius: 4px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        `;
        cancelButton.onmouseover = () => cancelButton.style.background = 'var(--bg-panel)';
        cancelButton.onmouseout = () => cancelButton.style.background = 'var(--bg-terminal)';
        cancelButton.onclick = () => this.cancel();
        cancelButton.tabIndex = -1;

        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(cancelButton);
        footer.appendChild(helpText);
        footer.appendChild(buttonContainer);

        // Assemble modal
        this.modal.appendChild(header);
        this.modal.appendChild(this.textarea);
        this.modal.appendChild(footer);
        overlay.appendChild(this.modal);

        // Add to document
        document.body.appendChild(overlay);
        this.overlay = overlay;

        // Focus textarea
        setTimeout(() => this.textarea.focus(), 100);
    }

    attachEventListeners() {
        this.keyHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.cancel();
            } else if (e.key === 'Tab') {
                // Always intercept Tab at document level and insert spaces into textarea
                e.preventDefault();
                const ta = this.textarea;
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                ta.value = ta.value.substring(0, start) + '    ' + ta.value.substring(end);
                ta.selectionStart = ta.selectionEnd = start + 4;
                ta.focus();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    detachEventListeners() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
    }

    save() {
        if (!this.active) return;

        const content = this.textarea.value;
        this.savedContent = content; // Store for validation after close
        
        // For practice mode, update the filesystem state
        if (typeof updateFileSystemState !== 'undefined') {
            updateFileSystemState(this.filename, { 
                content: content,
                mode: '0644',
                owner: 'root',
                group: 'root'
            });
            this.close(true); // Pass true to indicate Save & Exit
            return;
        }
        
        // For free terminal mode, write to actual filesystem
        const dir = this.filename.substring(0, this.filename.lastIndexOf('/'));
        const dirNode = this.fs.getNode(dir);
        
        if (!dirNode) {
            this.terminal.addOutput(`Error: Directory ${dir} does not exist`);
            this.close();
            return;
        }

        // Check write permission on directory
        if (!this.fs.checkPermission(dirNode, 'w')) {
            this.terminal.addOutput(`Error: Permission denied to write in ${dir}`);
            this.close();
            return;
        }

        // Create or update file
        const existingFile = this.fs.getNode(this.filename);
        if (existingFile) {
            // Update existing file
            if (!this.fs.checkPermission(existingFile, 'w')) {
                this.terminal.addOutput(`Error: Permission denied to write ${this.filename}`);
                this.close();
                return;
            }
            existingFile.content = content;
            existingFile.modified = new Date();
        } else {
            // Create new file
            const filename = this.filename.substring(this.filename.lastIndexOf('/') + 1);
            dirNode.children[filename] = {
                type: 'file',
                content: content,
                permissions: 'rw-r--r--',
                owner: 'root',
                group: 'root',
                modified: new Date()
            };
        }

        this.close(true); // Pass true to indicate Save & Exit
    }

    cancel() {
        if (!this.active) return;
        this.close(false); // Pass false to indicate cancel (no validation)
    }

    close(shouldValidate = false) {
        this.active = false;
        this.shouldValidate = shouldValidate; // Store validation flag
        this.detachEventListeners();
        
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        
        this.modal = null;
        this.textarea = null;
        this.overlay = null;
        
        // Restore terminal and trigger validation only if saved
        if (this.terminal && this.terminal.restoreFromEditor) {
            this.terminal.restoreFromEditor(shouldValidate);
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ViModal = ViModal;
}
