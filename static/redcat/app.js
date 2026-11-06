/**
 * Red Cat - Main Application (Refactored)
 * 
 * Lightweight orchestrator that coordinates:
 * - Module initialization
 * - Event handling
 * - Section navigation
 * - Command processing workflow
 * 
 * Heavy lifting delegated to specialized modules:
 * - modules/state.js: State management & persistence
 * - modules/validation.js: Command parsing & validation
 * - modules/output.js: Simulated command output
 * - modules/ui.js: DOM rendering & updates
 */

// ==================== INITIALIZATION ====================

/**
 * Initialize the application on page load
 */
function initApp() {
    console.log('🚀 Initializing Red Cat...');
    
    // Show main app container
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.style.display = 'flex';
    }
    
    // Load saved progress from localStorage
    loadProgress();
    
    // Set total sections count
    elements.totalSections.textContent = getTotalSections();
    
    // Load current section
    loadSection(appState.currentSectionId);
    
    // Setup all event listeners
    setupEventListeners();
    
    // Focus terminal input
    elements.terminalInput.focus();
    scrollTerminalToBottom();
    
    // Ensure terminal scrolls to bottom after render
    setTimeout(() => scrollTerminalToBottom(), 0);
    setTimeout(() => scrollTerminalToBottom(), 100);
    
    console.log('✅ Application initialized successfully');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Submit command on Enter
    elements.terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
    
    // Command history navigation with arrow keys
    elements.terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const command = navigateCommandHistory('up');
            if (command !== null) {
                elements.terminalInput.value = command;
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const command = navigateCommandHistory('down');
            if (command !== null) {
                elements.terminalInput.value = command;
            }
        } else if (e.ctrlKey && e.key === 'u') {
            // Ctrl+U: Clear current line
            e.preventDefault();
            elements.terminalInput.value = '';
        } else if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            // Ctrl+Shift+C: Copy selected text
            e.preventDefault();
            const selectedText = window.getSelection().toString();
            if (selectedText) {
                navigator.clipboard.writeText(selectedText);
            }
        } else if (e.ctrlKey && e.shiftKey && e.key === 'V') {
            // Ctrl+Shift+V: Paste from clipboard
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const start = elements.terminalInput.selectionStart;
                const end = elements.terminalInput.selectionEnd;
                const currentValue = elements.terminalInput.value;
                elements.terminalInput.value = currentValue.substring(0, start) + text + currentValue.substring(end);
                elements.terminalInput.selectionStart = elements.terminalInput.selectionEnd = start + text.length;
            });
        } else if (e.ctrlKey && (e.key === 'i' || e.key === 'I')) {
            e.preventDefault();
            showHint();
        }
    });
    
    // Click terminal to focus input
    const terminalContent = document.querySelector('.terminal-content');
    if (terminalContent) {
        terminalContent.addEventListener('click', () => {
            elements.terminalInput.focus();
        });
    }
    
    // Section navigation
    elements.prevSectionBtn.addEventListener('click', () => navigateSection(-1));
    elements.nextSectionBtn.addEventListener('click', () => navigateSection(1));
    
    // Reset buttons
    elements.resetSectionBtn.addEventListener('click', handleResetSection);
    elements.resetAllBtn.addEventListener('click', handleResetAll);
    
    // Home button is now a link to landing.html (no event listener needed)
    
    // Clear terminal history
    elements.clearHistoryBtn.addEventListener('click', clearTerminalHistory);
    
    // Notes modal
    elements.notesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openNotesModal();
    });
    elements.notesCloseBtn.addEventListener('click', closeNotesModal);
    elements.notesModal.addEventListener('click', (e) => {
        if (e.target === elements.notesModal) {
            closeNotesModal();
        }
    });
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.notesModal.classList.contains('active')) {
            closeNotesModal();
        }
    });
}

// ==================== NOTES MODAL ====================

/**
 * Open the notes modal for the current section
 */
function openNotesModal() {
    const sectionId = appState.currentSectionId;
    const notes = getSectionNotes(sectionId);
    
    elements.notesModalTitle.textContent = `Notes: ${notes.title}`;
    elements.notesContent.innerHTML = notes.content;
    elements.notesModal.classList.add('active');
}

/**
 * Close the notes modal
 */
function closeNotesModal() {
    elements.notesModal.classList.remove('active');
}

// ==================== SECTION MANAGEMENT ====================

/**
 * Load a section by ID
 * @param {number} sectionId - The ID of the section to load
 */
function loadSection(sectionId) {
    // Get the assigned or randomly selected question set for this section
    const questionSetIndex = getQuestionSetForSection(sectionId);
    
    // Get section with the appropriate question set
    const section = getSectionById(sectionId, questionSetIndex);
    
    if (!section) {
        console.error('Section not found:', sectionId);
        return;
    }
    
    // Update current section ID
    appState.currentSectionId = sectionId;
    
    // Reset simulated user state for this section (isolate state per section)
    if (typeof resetSimulatedUsersForSection === 'function') {
        resetSimulatedUsersForSection(sectionId);
    }
    
    // Reset filesystem state for this section (isolate state per section)
    if (typeof resetFileSystemStateForSection === 'function') {
        resetFileSystemStateForSection(sectionId);
    }
    
    // Clear command history for new section
    appState.commandHistory = [];
    appState.historyPosition = -1;
    
    // Initialize section progress if not exists
    initializeSectionProgress(sectionId);
    
    // Set current task index (first incomplete task)
    const completedTasks = appState.sectionProgress[sectionId].completedTasks;
    appState.currentTaskIndex = completedTasks.length;
    
    // Update all UI elements
    updateSectionUI(section);
    updateTaskList(section);
    updateCurrentTask(section);
    updateNavigationButtons();
    
    // Clear terminal input placeholder
    elements.terminalInput.placeholder = '';
    
    // Save progress
    saveProgress();
    
    console.log(`📚 Loaded Section ${sectionId} - Question Set ${questionSetIndex}`);
}

/**
 * Update current task state
 * @param {object} section - The section object
 */
function updateCurrentTask(section) {
    const task = section.tasks[appState.currentTaskIndex];
    
    if (task) {
        elements.terminalInput.disabled = false;
    } else {
        // Section completed
        elements.terminalInput.disabled = true;
        elements.terminalInput.placeholder = 'Section completed! Navigate to next section.';
        
        // Mark section as completed
        if (!appState.completedSections.includes(section.id)) {
            appState.completedSections.push(section.id);
            saveProgress();
        }
    }
}

/**
 * Navigate between sections
 * @param {number} direction - -1 for previous, 1 for next
 */
function navigateSection(direction) {
    const newSectionId = appState.currentSectionId + direction;
    
    if (newSectionId >= 1 && newSectionId <= getTotalSections()) {
        loadSection(newSectionId);
        clearTerminalHistory();
    }
}

// ==================== COMMAND HANDLING ====================

/**
 * Handle command submission
 */
function handleSubmit() {
    const input = elements.terminalInput.value.trim();
    
    if (input === '') {
        return;
    }
    
    // Check for special 'clear' command first
    if (handleClearCommand(input)) {
        elements.terminalInput.value = '';
        elements.terminalInput.focus();
        return;
    }
    
    // Check for special 'history' command
    if (handleHistoryCommand(input)) {
        elements.terminalInput.value = '';
        elements.terminalInput.focus();
        return;
    }
    
    // Add command to terminal display first (before any validation)
    addToHistory(input);
    
    // Add to command history for arrow key navigation
    addToCommandHistory(input);
    
    // Clear input immediately after capturing it
    elements.terminalInput.value = '';
    elements.terminalInput.focus();
    
    // Parse grep if present
    const grepParsed = parseGrepCommand(input);
    
    // Get current section and task
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);
    const section = getSectionById(appState.currentSectionId, questionSetIndex);
    const task = section.tasks[appState.currentTaskIndex];
    
    if (!task) {
        return;
    }
    
    // Special handler for 'vi' command in Section 4 (Shell Scripting)
    if (appState.currentSectionId === 4 && handleViCommandSection4(input, task)) {
        return;
    }

    // Special handler for Section 19 Boot Simulator (Root Password Reset)
    if (appState.currentSectionId === 19 && handleBootSimulatorSection19(input, task)) {
        return;
    }

    // Special handler for Section 20 Boot Simulator (Root Password Reset - Bash Method)
    if (appState.currentSectionId === 20 && handleBootSimulatorSection20(input, task)) {
        return;
    }

    // Validate command (strip grep if present)
    // Some tasks expect the pipe itself (e.g. 'ps aux | grep httpd'), so try the full line first
    let validationResult = validateCommand(input, task.expected);
    if (!validationResult.valid && grepParsed) {
        validationResult = validateCommand(grepParsed.command, task.expected);
    }

    // The answer wins over a pre-check: a pre-check such as a bare 'umask' or 'hostnamectl'
    // must not swallow 'umask 0027' or 'hostnamectl set-hostname ...'
    if (validationResult.valid) {
        handleCorrectAnswer(task, input, grepParsed);
        return;
    }

    // Help shortcut (command -h / --help). Only after the answer check, because
    // legitimate answers such as 'df -h' or 'free -h' look the same.
    if (handleHelpCommand(input, task, grepParsed)) {
        return;
    }

    // Check for allowed pre-checks on Implementation tasks
    if (handlePreCheckCommand(input, task, grepParsed)) {
        return;
    }

    handleIncorrectAnswer(validationResult);
}

/**
 * Handle 'clear' command
 * @param {string} input - User input
 * @returns {boolean} - True if handled
 */
function handleClearCommand(input) {
    const tokens = input.trim().split(/\s+/);
    const grepParsed = parseGrepCommand(input);
    
    if (tokens[0] !== 'clear') {
        return false;
    }
    
    // Check for help request
    const clearHelpMatch = grepParsed ? 
        grepParsed.command.match(/^clear\s+(-h|--help)$/) : 
        (tokens.length === 2 && (tokens[1] === '-h' || tokens[1] === '--help'));
    
    if (clearHelpMatch) {
        addToHistory(input);
        addToCommandHistory(input);
        
        let helpText = getCommandHelp('clear');
        if (helpText) {
            if (grepParsed) {
                helpText = grepFilter(helpText, grepParsed.grepPattern);
            }
            addHelpToHistory(helpText);
        }
    } else if (tokens.length === 1 && !grepParsed) {
        // Add to history before clearing the terminal
        addToHistory(input);
        addToCommandHistory(input);
        // Clear the terminal
        clearTerminalHistory();
    } else {
        // Invalid clear command
        addToHistory(input);
        addResultToHistory('clear: invalid option. Try \'clear -h\' for help', 'error');
        
        const lastEntry = elements.commandHistory.lastElementChild;
        if (lastEntry) {
            lastEntry.classList.add('has-error');
        }
    }
    
    return true;
}

/**
 * Handle 'history' command
 * @param {string} input - User input
 * @returns {boolean} - True if handled
 */
function handleHistoryCommand(input) {
    const tokens = input.trim().split(/\s+/);
    const grepParsed = parseGrepCommand(input);
    
    if (tokens[0] !== 'history') {
        return false;
    }
    
    // Check for help request
    const historyHelpMatch = grepParsed ? 
        grepParsed.command.match(/^history\s+(-h|--help)$/) : 
        (tokens.length === 2 && (tokens[1] === '-h' || tokens[1] === '--help'));
    
    if (historyHelpMatch) {
        addToHistory(input);
        addToCommandHistory(input);
        
        let helpText = getCommandHelp('history');
        if (helpText) {
            if (grepParsed) {
                helpText = grepFilter(helpText, grepParsed.grepPattern);
            }
            addHelpToHistory(helpText);
        }
    } else if (grepParsed && grepParsed.command.match(/^history\s+(-c|--clear)$/)) {
        // history -c | grep something - show help with grep
        addToHistory(input);
        addToCommandHistory(input);
        let helpText = getCommandHelp('history');
        if (helpText) {
            helpText = grepFilter(helpText, grepParsed.grepPattern);
            addHelpToHistory(helpText);
        }
    } else if (tokens.length === 2 && (tokens[1] === '-c' || tokens[1] === '--clear')) {
        // Clear history for current section
        addToHistory(input);
        addToCommandHistory(input);
        appState.commandHistory = [input]; // Keep only the history -c command
        addResultToHistory('History cleared for current section.', 'success');
    } else if (tokens.length === 1 && !grepParsed) {
        // Display command history
        addToHistory(input);
        addToCommandHistory(input);
        
        if (appState.commandHistory.length === 0) {
            addResultToHistory('No commands in history.', 'info');
        } else {
            let historyOutput = appState.commandHistory
                .map((cmd, index) => `  ${(index + 1).toString().padStart(3, ' ')}  ${cmd}`)
                .join('\n');
            addCommandOutputToHistory(historyOutput, null);
        }
    } else if (tokens.length === 1 && grepParsed) {
        // history | grep pattern
        addToHistory(input);
        addToCommandHistory(input);
        
        if (appState.commandHistory.length === 0) {
            // grep on empty history returns nothing
            return true;
        }
        
        let historyOutput = appState.commandHistory
            .map((cmd, index) => `  ${(index + 1).toString().padStart(3, ' ')}  ${cmd}`)
            .join('\n');
        
        // Apply grep filter
        historyOutput = grepFilter(historyOutput, grepParsed.grepPattern);
        
        if (historyOutput.trim()) {
            addCommandOutputToHistory(historyOutput, grepParsed.grepPattern);
        }
    } else {
        // Invalid history command
        addToHistory(input);
        addResultToHistory('history: invalid option. Try \'history -h\' for help', 'error');
        
        const lastEntry = elements.commandHistory.lastElementChild;
        if (lastEntry) {
            lastEntry.classList.add('has-error');
        }
    }
    
    return true;
}

/**
 * Handle help command (-h or --help flag)
 * @param {string} input - User input
 * @param {object} task - Current task
 * @param {object} grepParsed - Parsed grep info
 * @returns {boolean} - True if this was a help command
 */
function handleHelpCommand(input, task, grepParsed) {
    const commandToCheck = grepParsed ? grepParsed.command : input;
    const tokens = commandToCheck.trim().split(/\s+/);
    
    // Check if this is a help command format (command -h, command --help, or command --longhelp)
    const validHelpFlags = ['-h', '--help', '--longhelp'];
    if (tokens.length !== 2 || !validHelpFlags.includes(tokens[1])) {
        return false;
    }
    
    const commandName = tokens[0];
    const helpFlag = tokens[1];
    
    // Get and display help text for ANY command (help works globally like clear/history)
    let helpText = getCommandHelp(commandName, helpFlag);
    if (helpText) {
        if (grepParsed) {
            helpText = grepFilter(helpText, grepParsed.grepPattern);
        }
        addHelpToHistory(helpText);
    } else {
        // Check if command exists but flag is wrong
        const altFlag = helpFlag === '-h' ? '--help' : '-h';
        const altHelpText = getCommandHelp(commandName, altFlag);
        if (altHelpText) {
            addResultToHistory(`'${commandName}' does not support ${helpFlag}. Try '${commandName} ${altFlag}' instead.`, 'info');
        } else {
            if (helpFlag === '-h') {
                return false;   // -h is just a normal flag for this command (df -h, free -h...)
            }
            addResultToHistory(`Help not available for '${commandName}'`, 'info');
        }
    }
    
    return true;
}

// ==================== SECTION 19: BOOT SIMULATOR ====================

// (section 20 handler is defined further below)
/**
 * @param {string} input - User input
 * @param {object} task  - Current task
 * @returns {boolean} - True if handled
 */
function handleBootSimulatorSection19(input, task) {
    // If the current task is a bootModal task (tasks 2-8), intercept all terminal input
    if (task.bootModal) {
        const tokens  = input.trim().split(/\s+/);
        const command = tokens[0];
        const isReboot = command === 'reboot' ||
                         (command === 'systemctl' && tokens.includes('reboot'));
        if (isReboot) {
            addResultToHistory('Relaunching boot simulator...', 'info');
            openBootSimulator();
        } else {
            addResultToHistory(
                'This task is completed inside the Boot Simulator. Type \'reboot\' to open it.',
                'info'
            );
        }
        return true;
    }

    // Task 1: triggersBootModal — validate reboot then open simulator
    if (!task.triggersBootModal) return false;

    const tokens  = input.trim().split(/\s+/);
    const command = tokens[0];
    const isReboot = command === 'reboot' ||
                     (command === 'systemctl' && tokens.includes('reboot'));
    if (!isReboot) return false;

    const validationResult = validateCommand(input, task.expected);
    if (!validationResult.valid) return false;

    handleCorrectAnswer(task, input, null);
    openBootSimulator();
    return true;
}

/**
 * Create and open the BootSimulator modal for Section 19
 */
function openBootSimulator() {
    if (typeof BootSimulator === 'undefined') {
        addResultToHistory('Boot simulator not available.', 'error');
        return;
    }
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);
    const section          = getSectionById(appState.currentSectionId, questionSetIndex);
    const bootTasks        = section.tasks.filter(t => t.bootModal === true);
    const completedIds     = appState.sectionProgress[appState.currentSectionId].completedTasks;

    const simulator = new BootSimulator({
        tasks:            bootTasks,
        completedTaskIds: completedIds,
        onTaskComplete:   (taskId, explanation) => completeBootModalTask(taskId, explanation),
        onAllComplete:    () => { if (elements.terminalInput) elements.terminalInput.focus(); }
    });
    simulator.open();
}

/**
 * Mark a boot-simulator task complete, updating score and UI
 * @param {number} taskId      - The task id completed inside the boot modal
 * @param {string} explanation - The task explanation
 */
function completeBootModalTask(taskId, explanation) {
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);
    const section          = getSectionById(appState.currentSectionId, questionSetIndex);

    // Skip if already completed
    if (appState.sectionProgress[section.id].completedTasks.includes(taskId)) return;

    const task = section.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Award points
    appState.sectionProgress[section.id].score += task.points;
    appState.sectionProgress[section.id].completedTasks.push(taskId);
    appState.totalScore += task.points;

    // Advance currentTaskIndex to the next non-completed task
    const nextIdx = section.tasks.findIndex(
        t => !appState.sectionProgress[section.id].completedTasks.includes(t.id)
    );
    appState.currentTaskIndex = nextIdx >= 0 ? nextIdx : section.tasks.length;

    updateTaskList(section);
    updateSectionUI(section);

    // Handle section completion
    if (appState.currentTaskIndex >= section.tasks.length) {
        if (!appState.completedSections.includes(section.id)) {
            appState.completedSections.push(section.id);
        }
        updateCurrentTask(section);
        updateNavigationButtons();
    }

    saveProgress();
}

// ==================== SECTION 20: BOOT SIMULATOR (BASH METHOD) ====================

/**
 * Handle reboot / boot-modal tasks in Section 20 (Root Password Reset — Bash Method)
 */
function handleBootSimulatorSection20(input, task) {
    if (task.bootModal) {
        const tokens  = input.trim().split(/\s+/);
        const command = tokens[0];
        const isReboot = command === 'reboot' ||
                         (command === 'systemctl' && tokens.includes('reboot'));
        if (isReboot) {
            addResultToHistory('Relaunching boot simulator...', 'info');
            openBootSimulatorSection20();
        } else {
            addResultToHistory(
                'This task is completed inside the Boot Simulator. Type \'reboot\' to open it.',
                'info'
            );
        }
        return true;
    }

    if (!task.triggersBootModal) return false;

    const tokens  = input.trim().split(/\s+/);
    const command = tokens[0];
    const isReboot = command === 'reboot' ||
                     (command === 'systemctl' && tokens.includes('reboot'));
    if (!isReboot) return false;

    const validationResult = validateCommand(input, task.expected);
    if (!validationResult.valid) return false;

    handleCorrectAnswer(task, input, null);
    openBootSimulatorSection20();
    return true;
}

/**
 * Create and open the BootSimulator modal for Section 20 (init=/bin/bash method)
 */
function openBootSimulatorSection20() {
    if (typeof BootSimulator === 'undefined') {
        addResultToHistory('Boot simulator not available.', 'error');
        return;
    }
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);
    const section          = getSectionById(appState.currentSectionId, questionSetIndex);
    const bootTasks        = section.tasks.filter(t => t.bootModal === true);
    const completedIds     = appState.sectionProgress[appState.currentSectionId].completedTasks;

    const simulator = new BootSimulator({
        tasks:            bootTasks,
        completedTaskIds: completedIds,
        onTaskComplete:   (taskId, explanation) => completeBootModalTask(taskId, explanation),
        onAllComplete:    () => { if (elements.terminalInput) elements.terminalInput.focus(); },

        // Section 20 — RHEL 10 init=/bin/bash config
        appendCommand:   'init=/bin/bash',
        initialPrompt:   'bash-5.2# ',
        grubVersion:     '2.12',
        grubTitle:       'Red Hat Enterprise Linux (6.12.0-55.29.1.el10_0.x86_64) 10.0 (Coughlan)',
        grubRescue:      'Red Hat Enterprise Linux (0-rescue-...) 10.0 (Coughlan)',
        grubEditorLines: [
            'load_video',
            'set gfxpayload=keep',
            'insmod gzio',
            'insmod part_gpt',
            'insmod xfs',
            "set root='hd0,gpt2'",
            "search --no-floppy --label --set=root 'boot'",
            "echo 'Loading Red Hat Enterprise Linux...'",
            'linux   ($root)/vmlinuz-6.12.0-55.29.1.el10_0.x86_64 root=/dev/mapper/rhel-root ro crashkernel=1G-4G:192M,4G-64G:256M,64G-:512M resume=/dev/mapper/rhel-swap rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet',
            'initrd ($root)/initramfs-6.12.0-55.29.1.el10_0.x86_64.img $tuned_initrd'
        ],
        bootMessages: [
            '[    0.000000] Linux version 6.12.0-55.29.1.el10_0.x86_64',
            '[    0.123456] Command line: BOOT_IMAGE=... init=/bin/bash',
            '[    1.482345] EXT4-fs: mounted filesystem',
            '[    2.001234] Run /bin/bash as init process',
            '',
        ],
        shellIntro: [''],
        chrootTaskId: null   // no chroot in this method
    });
    simulator.open();
}

/**
 * Handle vi command in Section 4 (Shell Scripting)
 * Opens modal editor instead of normal validation
 * @param {string} input - User input
 * @param {object} task - Current task
 * @returns {boolean} - True if this was a vi command that was handled
 */
function handleViCommandSection4(input, task) {
    const parsed = parseCommand(input);
    
    // Check if this is a vi or vim command
    if (parsed.command !== 'vi' && parsed.command !== 'vim') {
        return false;
    }
    
    // Check if filename is provided
    if (parsed.values.length === 0) {
        addResultToHistory('vim: Missing filename\nUsage: vim <filename>', 'error');
        return true;
    }
    
    const filename = parsed.values[0];
    
    // Open modal editor
    if (typeof ViModal !== 'undefined') {
        // Create a mock filesystem object for the modal
        const mockFs = {
            resolvePath: (path) => {
                // Just return the path as-is for Section 4
                // Users work in their current directory
                if (!path.startsWith('/')) {
                    return `/${path}`;
                }
                return path;
            },
            getNode: (path) => {
                // Check if file exists in our virtual state
                const fsState = getFileSystemState();
                if (fsState[path]) {
                    return {
                        type: 'file',
                        content: fsState[path].content || '',
                        permissions: fsState[path].mode || 'rw-r--r--',
                        owner: fsState[path].owner || 'root',
                        group: fsState[path].group || 'root'
                    };
                }
                // Return current directory
                if (path === '/' || path === '.') {
                    return {
                        type: 'directory',
                        children: {}
                    };
                }
                return null;
            },
            checkPermission: () => true // Always allow in practice mode
        };
        
        // Create a mock terminal object
        const mockTerminal = {
            addOutput: (text) => {
                addResultToHistory(text, 'info');
            },
            restoreFromEditor: (shouldValidate = false) => {
                // Only validate if the modal was closed with "Save & Exit"
                if (shouldValidate) {
                    const fullPath = mockFs.resolvePath(filename);
                    const fileNode = mockFs.getNode(fullPath);
                    
                    if (fileNode && fileNode.content) {
                        // Check if this task has script validation requirements
                        const scriptValidation = findScriptValidationInTask(task, fullPath);
                        
                        if (scriptValidation) {
                            // Validate the script content
                            const validationResult = validateScript(fullPath, mockFs, scriptValidation);
                            
                            if (validationResult.valid) {
                                handleCorrectAnswer(task, input, null);
                            } else {
                                addResultToHistory(validationResult.message, 'error');
                            }
                        } else {
                            // If we can't find validation requirements for a vi task, something is wrong
                            addResultToHistory(`Error: No validation requirements found for ${filename}. Please report this issue.`, 'error');
                        }
                    } else {
                        addResultToHistory('No script content found. Please write your script and click "Save & Exit".', 'error');
                    }
                }
                
                elements.terminalInput.focus();
            }
        };
        
        const fullPath = mockFs.resolvePath(filename);
        const existingContent = mockFs.getNode(fullPath)?.content || '';
        
        const modal = new ViModal(mockTerminal, mockFs);
        modal.open(fullPath, existingContent);
        
        return true;
    }
    
    // Fallback if modal not available
    addResultToHistory('vim: Editor not available', 'error');
    return true;
}

/**
 * Find script validation requirements in task
 * @param {object} task - Current task
 * @param {string} filepath - Script file path
 * @returns {object|null} - Validation requirements or null
 */
function findScriptValidationInTask(task, filepath) {
    if (!task.expected || !Array.isArray(task.expected)) {
        return null;
    }
    
    // Normalize filepath for comparison (remove leading slash if present)
    const normalizedPath = filepath.startsWith('/') ? filepath.substring(1) : filepath;
    
    for (const expected of task.expected) {
        if (expected.command === 'vi' || expected.command === 'vim') {
            // Check if this expected command matches the filepath
            if (expected.requiredValues) {
                for (const reqValue of expected.requiredValues) {
                    const normalizedReqValue = reqValue.startsWith('/') ? reqValue.substring(1) : reqValue;
                    if (normalizedReqValue === normalizedPath) {
                        return expected.scriptValidation || null;
                    }
                }
            }
        }
    }
    
    return null;
}

/**
 * Handle pre-check commands for Implementation tasks
 * @param {string} input - User input
 * @param {object} task - Current task
 * @param {object} grepParsed - Parsed grep info
 * @returns {boolean} - True if this was a pre-check command
 */
function handlePreCheckCommand(input, task, grepParsed) {
    if (task.category !== 'Implementation' || !task.allowedPreChecks) {
        return false;
    }
    
    let preCheckResult = validateCommand(input, task.allowedPreChecks);
    if (!preCheckResult.valid && grepParsed) {
        preCheckResult = validateCommand(grepParsed.command, task.allowedPreChecks);
    }
    
    if (!preCheckResult.valid) {
        return false;
    }
    
    // This is a valid pre-check - update state if needed (before showing output)
    updateSimulatedUserState(input);
    updateFileSystemStateFromCommand(input);
    
    // Show output
    const preCheckOutput = generatePreCheckOutput(task, input, grepParsed);
    
    if (preCheckOutput) {
        addCommandOutputToHistory(preCheckOutput, grepParsed ? grepParsed.grepPattern : null);
    }
    
    return true;
}

/**
 * Handle correct answer
 * @param {object} task - Current task
 * @param {string} input - User's input
 * @param {object} grepParsed - Parsed grep info
 */
function handleCorrectAnswer(task, input, grepParsed) {
    // Update simulated user state if this is a chage command
    updateSimulatedUserState(input);
    
    // Update filesystem state if this is a chmod/chown/chgrp/setfacl command
    updateFileSystemStateFromCommand(input);
    
    // Generate and show simulated output for audit tasks
    const simulatedOutput = generateSimulatedOutput(task, input, grepParsed);
    
    if (simulatedOutput) {
        addCommandOutputToHistory(simulatedOutput, grepParsed ? grepParsed.grepPattern : null);
    }
    
    // Update score
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);
    const section = getSectionById(appState.currentSectionId, questionSetIndex);
    appState.sectionProgress[section.id].score += task.points;
    appState.sectionProgress[section.id].completedTasks.push(task.id);
    appState.totalScore += task.points;
    
    // Update UI
    updateSectionUI(section);
    
    // Add success message with explanation if available
    const lastEntry = elements.commandHistory.lastElementChild;
    if (task.explanation && lastEntry) {
        addToggleableResult(lastEntry, task.explanation);
    } else {
        addResultToHistory('Correct!', 'success');
    }
    
    // Move to next task
    appState.currentTaskIndex++;
    updateTaskList(section);
    updateCurrentTask(section);
    updateNavigationButtons();
    saveProgress();
}

/**
 * Update simulated user state based on command
 * @param {string} input - User's input command
 */
function updateSimulatedUserState(input) {
    // Parse chage commands to update user state
    const chageMatch = input.match(/chage\s+(.+)/);
    if (!chageMatch) return;
    
    const args = chageMatch[1].trim().split(/\s+/);
    let username = null;
    let updates = {};
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-M' || arg === '--maxdays') {
            updates.maxPasswordAge = parseInt(args[i + 1]);
            i++;
        } else if (arg === '-m' || arg === '--mindays') {
            updates.minPasswordAge = parseInt(args[i + 1]);
            i++;
        } else if (arg === '-W' || arg === '--warndays') {
            updates.warnDays = parseInt(args[i + 1]);
            i++;
        } else if (arg === '-I' || arg === '--inactive') {
            updates.passwordInactive = parseInt(args[i + 1]);
            i++;
        } else if (arg === '-E' || arg === '--expiredate') {
            updates.accountExpiry = args[i + 1];
            i++;
        } else if (!arg.startsWith('-')) {
            username = arg;
        }
    }
    
    // Apply updates to current section's user state
    if (username && typeof getSimulatedUsers === 'function') {
        const simulatedUsers = getSimulatedUsers();
        if (simulatedUsers[username]) {
            Object.assign(simulatedUsers[username], updates);
            console.log(`📝 Updated simulated user state for ${username} (Section ${appState.currentSectionId}):`, updates);
        }
    }
}

/**
 * Update filesystem state based on command
 * @param {string} input - User's input command
 */
function updateFileSystemStateFromCommand(input) {
    if (typeof updateFileSystemState !== 'function') return;
    
    const tokens = input.trim().split(/\s+/);
    const command = tokens[0];
    
    // Parse chmod commands
    if (command === 'chmod') {
        const modeIdx = tokens.findIndex(t => !t.startsWith('-') && t !== 'chmod');
        if (modeIdx !== -1) {
            const mode = tokens[modeIdx];
            const path = tokens[modeIdx + 1];
            if (path) {
                // Normalize octal mode (755 -> 0755)
                const normalizedMode = mode.match(/^\d{3}$/) ? '0' + mode : mode;
                updateFileSystemState(path, { mode: normalizedMode });
            }
        }
    }
    
    // Parse chown commands
    else if (command === 'chown') {
        // Identify path by leading '/', owner/group by not starting with '/' or '-'
        const pathIdx = tokens.findIndex((t, i) => i > 0 && t.startsWith('/'));
        const ownerIdx = tokens.findIndex((t, i) => i > 0 && !t.startsWith('-') && !t.startsWith('/'));
        if (pathIdx !== -1 && ownerIdx !== -1) {
            const path = tokens[pathIdx];
            const ownerGroup = tokens[ownerIdx];
            const updates = {};
            if (ownerGroup.includes(':')) {
                const [owner, group] = ownerGroup.split(':');
                if (owner) updates.owner = owner;
                if (group) updates.group = group;
            } else {
                updates.owner = ownerGroup;
            }
            if (Object.keys(updates).length > 0) {
                updateFileSystemState(path, updates);
            }
        }
    }
    
    // Parse chgrp commands
    else if (command === 'chgrp') {
        const groupIdx = tokens.findIndex(t => !t.startsWith('-') && t !== 'chgrp');
        if (groupIdx !== -1) {
            const group = tokens[groupIdx];
            const path = tokens[groupIdx + 1];
            if (path && group) {
                updateFileSystemState(path, { group: group });
            }
        }
    }
    
    // Parse setfacl commands
    else if (command === 'setfacl') {
        const mIdx = tokens.indexOf('-m');
        const xIdx = tokens.indexOf('-x');
        const pathIdx = tokens.length - 1;
        const path = tokens[pathIdx];
        
        if (path && (mIdx !== -1 || xIdx !== -1)) {
            const aclIdx = mIdx !== -1 ? mIdx + 1 : xIdx + 1;
            const aclSpec = tokens[aclIdx];
            
            if (aclSpec) {
                const fsState = getFileSystemState();
                if (fsState && fsState[path]) {
                    if (!fsState[path].acls) fsState[path].acls = [];
                    
                    if (mIdx !== -1) {
                        // Add/modify ACL
                        fsState[path].acls.push(aclSpec);
                        console.log(`📝 Added ACL ${aclSpec} to ${path} (Section ${appState.currentSectionId})`);
                    } else {
                        // Remove ACL
                        fsState[path].acls = fsState[path].acls.filter(a => !a.startsWith(aclSpec.split(':')[0]));
                        console.log(`📝 Removed ACL ${aclSpec} from ${path} (Section ${appState.currentSectionId})`);
                    }
                }
            }
        }
    }
}

/**
 * Handle incorrect answer
 * @param {object} validationResult - Validation result with error message
 */
function handleIncorrectAnswer(validationResult) {
    addResultToHistory(validationResult.message, 'error');
    
    // Mark entry as having error for styling
    const lastEntry = elements.commandHistory.lastElementChild;
    if (lastEntry) {
        lastEntry.classList.add('has-error');
    }
}

/**
 * Show hint for current task
 */
function showHint() {
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);
    const section = getSectionById(appState.currentSectionId, questionSetIndex);
    const task = section.tasks[appState.currentTaskIndex];
    
    if (!task) {
        return;
    }
    
    const expected = Array.isArray(task.expected) ? task.expected[0] : task.expected;
    
    // Build hint message
    let hintMessage;
    if (task.hint) {
        hintMessage = `Hint: ${task.hint}`;
    } else if (expected.match) {
        hintMessage = 'Hint: Type the line itself, exactly as it would appear in the file or script.';
    } else {
        hintMessage = `Hint: Use the ${expected.command} command`;
        
        if (expected.requiredFlags && expected.requiredFlags.length > 0) {
            hintMessage += ` with flags: ${expected.requiredFlags.join(', ')}`;
        }
        
        if (expected.requiredValues && expected.requiredValues.length > 0) {
            hintMessage += `. Required values: ${expected.requiredValues.join(', ')}`;
        }
    }
    
    // Find last history entry and replace error with hint
    const lastEntry = elements.commandHistory.lastElementChild;
    
    if (lastEntry) {
        const errorResult = lastEntry.querySelector('.history-result.error');
        
        if (errorResult) {
            errorResult.remove();
            
            const hintDiv = document.createElement('div');
            hintDiv.className = 'history-result hint';
            hintDiv.textContent = hintMessage;
            lastEntry.appendChild(hintDiv);
            
            lastEntry.classList.remove('has-error');
            lastEntry.classList.add('has-hint');
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
                hintDiv.style.opacity = '0';
                hintDiv.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    hintDiv.remove();
                    lastEntry.classList.remove('has-hint');
                }, 500);
            }, 8000);
        }
    }
}

/**
 * Filter text by grep pattern (case-insensitive)
 * @param {string} text - Text to filter
 * @param {string} pattern - Pattern to search for
 * @returns {string} - Filtered text with only matching lines
 */
function grepFilter(text, pattern) {
    const lines = text.split('\n');
    const matchedLines = lines.filter(line => 
        line.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (matchedLines.length === 0) {
        return `(no matches found for '${pattern}')`;
    }
    
    return matchedLines.join('\n');
}

// ==================== RESET FUNCTIONS ====================

/**
 * Reset a specific task for practice
 * @param {object} section - The section containing the task
 * @param {number} taskId - The ID of the task to reset
 */
function resetTask(section, taskId) {
    const taskIndex = section.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = section.tasks[taskIndex];
    const progress = appState.sectionProgress[section.id];
    
    if (!progress || !progress.completedTasks.includes(taskId)) {
        return;
    }
    
    // Remove task from completed tasks
    progress.completedTasks = progress.completedTasks.filter(id => id !== taskId);
    
    // Deduct points
    progress.score -= task.points;
    appState.totalScore -= task.points;
    
    // Update current task index if needed
    if (taskIndex < appState.currentTaskIndex) {
        appState.currentTaskIndex = taskIndex;
    }
    
    // Update UI
    updateSectionUI(section);
    updateTaskList(section);
    updateCurrentTask(section);
    updateNavigationButtons();
    saveProgress();
    
    showHeaderStatus(`Task ${taskId} reset - ready to practice!`, 'success', 2500);
}

/**
 * Reset current section
 */
function handleResetSection() {
    const confirmed = confirm('Are you sure you want to reset this section? All progress will be lost.');
    
    if (!confirmed) return;
    
    resetSectionProgress(appState.currentSectionId);
    
    const section = getSectionById(appState.currentSectionId);
    loadSection(section.id);
    clearTerminalHistory();
    
    showHeaderStatus('Section reset successfully', 'success', 2000);
}

/**
 * Reset all progress
 */
function handleResetAll() {
    const confirmed = confirm('WARNING: This will reset ALL progress across all sections. Are you sure?');
    
    if (!confirmed) return;
    
    resetAllProgress();
    
    loadSection(1);
    clearTerminalHistory();
    
    showHeaderStatus('All progress reset', 'info', 2000);
}

// ==================== STARTUP ====================

// Note: App initialization is now handled by landing.js
// initApp() will be called after user selects practice mode
// If user has existing progress, landing.js will call initApp() immediately

