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
    
    // Check if this is a help command (-h flag)
    if (handleHelpCommand(input, task, grepParsed)) {
        return;
    }
    
    // Check for allowed pre-checks on Implementation tasks
    if (handlePreCheckCommand(input, task, grepParsed)) {
        return;
    }
    
    // Validate command (strip grep if present)
    const commandToValidate = grepParsed ? grepParsed.command : input;
    const validationResult = validateCommand(commandToValidate, task.expected);
    
    if (validationResult.valid) {
        handleCorrectAnswer(task, input, grepParsed);
    } else {
        handleIncorrectAnswer(validationResult);
    }
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
    
    // Check if this is a help command format (command -h or command --help)
    if (tokens.length !== 2 || (tokens[1] !== '-h' && tokens[1] !== '--help')) {
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
            addResultToHistory(`Help not available for '${commandName}'`, 'info');
        }
    }
    
    return true;
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
    
    const commandToValidate = grepParsed ? grepParsed.command : input;
    const preCheckResult = validateCommand(commandToValidate, task.allowedPreChecks);
    
    if (!preCheckResult.valid) {
        return false;
    }
    
    // This is a valid pre-check - show output but don't complete task
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
    let hintMessage = `Hint: Use the ${expected.command} command`;
    
    if (expected.requiredFlags && expected.requiredFlags.length > 0) {
        hintMessage += ` with flags: ${expected.requiredFlags.join(', ')}`;
    }
    
    if (expected.requiredValues && expected.requiredValues.length > 0) {
        hintMessage += `. Required values: ${expected.requiredValues.join(', ')}`;
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

