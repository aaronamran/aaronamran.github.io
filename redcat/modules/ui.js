/**
 * Red Cat - UI Rendering Module
 * 
 * Handles all UI updates and rendering logic
 */

// DOM Elements Cache
const elements = {
    // Left Panel
    sectionTitle: document.getElementById('section-title'),
    sectionDescription: document.getElementById('section-description'),
    currentPoints: document.getElementById('current-points'),
    totalPoints: document.getElementById('total-points'),
    currentSection: document.getElementById('current-section'),
    totalSections: document.getElementById('total-sections'),
    progressFill: document.getElementById('progress-fill'),
    taskList: document.getElementById('task-list'),
    prevSectionBtn: document.getElementById('prev-section'),
    nextSectionBtn: document.getElementById('next-section'),
    resetSectionBtn: document.getElementById('reset-section'),
    resetAllBtn: document.getElementById('reset-all'),
    
    // Right Panel
    terminalContent: document.querySelector('.terminal-content'),
    commandHistory: document.getElementById('command-history'),
    terminalInput: document.getElementById('terminal-input'),
    clearHistoryBtn: document.getElementById('clear-history'),
    headerStatus: document.getElementById('header-status')
};

/**
 * Update section UI elements
 */
function updateSectionUI(section) {
    elements.sectionTitle.textContent = section.title;
    elements.sectionDescription.textContent = section.description;
    elements.currentSection.textContent = section.id;
    
    const progress = appState.sectionProgress[section.id] || { score: 0 };
    elements.currentPoints.textContent = progress.score;
    elements.totalPoints.textContent = section.totalPoints;
    
    const percentage = (progress.score / section.totalPoints) * 100;
    elements.progressFill.style.width = `${percentage}%`;
}

/**
 * Update task list display
 */
function updateTaskList(section) {
    elements.taskList.innerHTML = '';
    
    const progress = appState.sectionProgress[section.id] || { completedTasks: [] };
    
    section.tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';
        
        const isCompleted = progress.completedTasks.includes(task.id);
        const isCurrent = index === appState.currentTaskIndex;
        const isLocked = index > appState.currentTaskIndex;
        
        if (isCompleted) {
            listItem.classList.add('completed');
        } else if (isCurrent) {
            listItem.classList.add('active');
        } else if (isLocked) {
            listItem.classList.add('locked');
        }
        
        // Add status icon
        const statusIcon = document.createElement('span');
        statusIcon.className = 'task-status';
        if (isCompleted) {
            statusIcon.classList.add('completed-icon');
        } else if (isCurrent) {
            statusIcon.classList.add('active-icon');
        } else if (isLocked) {
            statusIcon.classList.add('locked-icon');
        }
        
        const taskNumber = document.createElement('span');
        taskNumber.className = 'task-number';
        taskNumber.textContent = `${task.id}`;
        
        const taskDesc = document.createElement('span');
        taskDesc.className = 'task-description';
        taskDesc.textContent = task.description;
        
        listItem.appendChild(statusIcon);
        listItem.appendChild(taskNumber);
        listItem.appendChild(taskDesc);
        
        // Add reset button for completed tasks
        if (isCompleted) {
            const resetBtn = document.createElement('button');
            resetBtn.className = 'reset-task-btn-icon';
            resetBtn.innerHTML = '↻';
            resetBtn.title = 'Reset this task';
            resetBtn.onclick = (e) => {
                e.stopPropagation();
                resetTask(section, task.id);
            };
            listItem.appendChild(resetBtn);
        }
        
        elements.taskList.appendChild(listItem);
    });
}

/**
 * Update navigation buttons state
 */
function updateNavigationButtons() {
    elements.prevSectionBtn.disabled = appState.currentSectionId === 1;
    elements.nextSectionBtn.disabled = !canNavigateToNextSection();
}

/**
 * Check if user can navigate to next section
 */
function canNavigateToNextSection() {
    if (appState.currentSectionId >= getTotalSections()) {
        return false;
    }
    return appState.completedSections.includes(appState.currentSectionId);
}

/**
 * Update current task display
 */
function updateCurrentTask(section) {
    const task = section.tasks[appState.currentTaskIndex];
    if (task) {
        console.log(`📝 Current Task: #${task.id} - ${task.description}`);
    }
}

/**
 * Add command to terminal history display
 */
function addToHistory(input) {
    const historyEntry = document.createElement('div');
    historyEntry.className = 'history-entry';
    
    const commandLine = document.createElement('div');
    commandLine.className = 'history-command-line';
    
    const prompt = document.createElement('span');
    prompt.className = 'history-prompt';
    prompt.textContent = '[student@redcat ~]$ ';
    
    const command = document.createElement('span');
    command.className = 'history-command';
    command.textContent = input;
    
    commandLine.appendChild(prompt);
    commandLine.appendChild(command);
    historyEntry.appendChild(commandLine);
    elements.commandHistory.appendChild(historyEntry);
    
    scrollTerminalToBottom();
}

/**
 * Add result message to history
 */
function addResultToHistory(message, type = 'success') {
    const lastEntry = elements.commandHistory.lastElementChild;
    
    if (type === 'error' && lastEntry) {
        // For errors, add to command line for hover effect
        const commandLine = lastEntry.querySelector('.history-command-line');
        if (commandLine) {
            const resultDiv = document.createElement('div');
            resultDiv.className = `history-result ${type}`;
            resultDiv.textContent = message;
            commandLine.appendChild(resultDiv);
            scrollTerminalToBottom();
            return;
        }
    }
    
    // For other types, append normally to the entry or history
    const resultDiv = document.createElement('div');
    resultDiv.className = `history-result ${type}`;
    resultDiv.textContent = message;
    
    if (lastEntry && type !== 'info') {
        lastEntry.appendChild(resultDiv);
    } else {
        elements.commandHistory.appendChild(resultDiv);
    }
    
    scrollTerminalToBottom();
}

/**
 * Add command output to history with optional grep highlighting
 */
function addCommandOutputToHistory(output, grepPattern) {
    const lastEntry = elements.commandHistory.lastElementChild;
    
    if (lastEntry) {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'history-output';
        
        if (grepPattern) {
            const lines = output.split('\n');
            const regex = new RegExp(`(${grepPattern})`, 'gi');
            const highlightedLines = lines.map(line => {
                if (line.match(regex)) {
                    return line.replace(regex, '<span class="grep-highlight">$1</span>');
                }
                return line;
            });
            outputDiv.innerHTML = highlightedLines.join('\n');
        } else {
            outputDiv.textContent = output;
        }
        
        lastEntry.after(outputDiv);
    }
    
    scrollTerminalToBottom();
}

/**
 * Add help text to history
 */
function addHelpToHistory(helpText) {
    const helpDiv = document.createElement('div');
    helpDiv.className = 'history-help';
    helpDiv.textContent = helpText;
    elements.commandHistory.appendChild(helpDiv);
    
    scrollTerminalToBottom();
}

/**
 * Show status message in header
 */
function showHeaderStatus(message, type = 'info', duration = 3000) {
    elements.headerStatus.textContent = message;
    elements.headerStatus.className = `header-status ${type} visible`;
    
    setTimeout(() => {
        elements.headerStatus.classList.remove('visible');
        setTimeout(() => {
            elements.headerStatus.textContent = '';
        }, 300);
    }, duration);
}

/**
 * Scroll terminal to bottom
 */
function scrollTerminalToBottom() {
    elements.terminalContent.scrollTop = elements.terminalContent.scrollHeight;
}

/**
 * Clear terminal history
 */
function clearTerminalHistory() {
    elements.commandHistory.innerHTML = '';
    showHeaderStatus('Terminal cleared', 'info', 2000);
}

/**
 * Add toggleable explanation
 */
function addToggleableResult(entry, explanationText) {
    // Remove any existing result in this entry
    const existingResult = entry.querySelector('.history-result.success, .history-result.explanation');
    if (existingResult) {
        existingResult.remove();
    }
    
    // Create the success div with button inline
    const correctDiv = document.createElement('div');
    correctDiv.className = 'history-result success';
    
    // Add checkmark icon (handled by CSS ::before)
    // Add "Correct!" text
    const textSpan = document.createElement('span');
    textSpan.textContent = 'Correct!';
    correctDiv.appendChild(textSpan);
    
    // Add the show/hide button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-explanation-btn';
    toggleBtn.textContent = 'Show Explanation';
    correctDiv.appendChild(toggleBtn);
    
    // Create the explanation detail div (hidden by default)
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation-detail';
    explanationDiv.textContent = explanationText;
    explanationDiv.style.display = 'none';
    
    // Toggle functionality
    let isExpanded = false;
    toggleBtn.onclick = () => {
        isExpanded = !isExpanded;
        explanationDiv.style.display = isExpanded ? 'block' : 'none';
        toggleBtn.textContent = isExpanded ? 'Hide Explanation' : 'Show Explanation';
    };
    
    // Append to entry
    entry.appendChild(correctDiv);
    entry.appendChild(explanationDiv);
    
    scrollTerminalToBottom();
}

/**
 * Show error overlay on hover
 */
function showErrorOverlay(entry, errorMessage) {
    entry.classList.add('has-error');
    entry.dataset.errorMessage = errorMessage;
}
