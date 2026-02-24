/**
 * Red Cat - State Management Module
 * 
 * Handles application state and localStorage persistence
 */

// ==================== APPLICATION STATE ====================
const appState = {
    currentSectionId: 1,
    currentTaskIndex: 0,
    completedSections: [],
    sectionProgress: {}, // { sectionId: { completedTasks: [], score: 0 } }
    sectionQuestionSets: {}, // { sectionId: questionSetIndex } - tracks which set (1-3) is active per section
    totalScore: 0,
    commandHistory: [], // Store all entered commands for navigation
    historyPosition: -1 // Current position in command history (-1 = not navigating)
};

/**
 * Initialize section progress for a section
 * @param {number} sectionId - The section ID
 */
function initializeSectionProgress(sectionId) {
    if (!appState.sectionProgress[sectionId]) {
        appState.sectionProgress[sectionId] = {
            completedTasks: [],
            score: 0
        };
    }
}

/**
 * Load progress from localStorage
 */
function loadProgress() {
    const saved = localStorage.getItem('rhcsaProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            appState.currentSectionId = data.currentSectionId || 1;
            appState.currentTaskIndex = data.currentTaskIndex || 0;
            appState.completedSections = data.completedSections || [];
            appState.sectionProgress = data.sectionProgress || {};
            appState.sectionQuestionSets = data.sectionQuestionSets || {};
            appState.totalScore = data.totalScore || 0;
            console.log('✅ Progress loaded from localStorage');
        } catch (e) {
            console.error('❌ Error loading progress:', e);
        }
    }
}

/**
 * Save progress to localStorage
 */
function saveProgress() {
    const data = {
        currentSectionId: appState.currentSectionId,
        currentTaskIndex: appState.currentTaskIndex,
        completedSections: appState.completedSections,
        sectionProgress: appState.sectionProgress,
        sectionQuestionSets: appState.sectionQuestionSets,
        totalScore: appState.totalScore
    };
    localStorage.setItem('rhcsaProgress', JSON.stringify(data));
    console.log('💾 Progress saved');
}

/**
 * Reset all progress
 */
function resetAllProgress() {
    appState.currentSectionId = 1;
    appState.currentTaskIndex = 0;
    appState.completedSections = [];
    appState.sectionProgress = {};
    appState.sectionQuestionSets = {};
    appState.totalScore = 0;
    appState.commandHistory = [];
    appState.historyPosition = -1;
    localStorage.removeItem('rhcsaProgress');
    console.log('🔄 All progress reset');
}

/**
 * Reset a specific section
 * @param {number} sectionId - The section to reset
 */
function resetSectionProgress(sectionId) {
    if (appState.sectionProgress[sectionId]) {
        appState.totalScore -= appState.sectionProgress[sectionId].score;
        appState.sectionProgress[sectionId] = {
            completedTasks: [],
            score: 0
        };
        
        // Remove question set assignment (will be randomly selected again)
        delete appState.sectionQuestionSets[sectionId];
        
        // Remove from completed sections
        const index = appState.completedSections.indexOf(sectionId);
        if (index > -1) {
            appState.completedSections.splice(index, 1);
        }
        
        // If resetting current section, reset task index and clear history
        if (sectionId === appState.currentSectionId) {
            appState.currentTaskIndex = 0;
            appState.commandHistory = [];
            appState.historyPosition = -1;
        }
        
        saveProgress();
        console.log(`🔄 Section ${sectionId} reset`);
    }
}

/**
 * Get or assign a question set for a section
 * If the section doesn't have an assigned set, randomly select one
 * @param {number} sectionId - The section ID
 * @returns {number} The question set index (1, 2, or 3)
 */
function getQuestionSetForSection(sectionId) {
    if (!appState.sectionQuestionSets[sectionId]) {
        // Randomly assign a question set (1, 2, or 3)
        appState.sectionQuestionSets[sectionId] = Math.floor(Math.random() * 3) + 1;
        saveProgress();
        console.log(`🎲 Randomly assigned question set ${appState.sectionQuestionSets[sectionId]} to section ${sectionId}`);
    }
    return appState.sectionQuestionSets[sectionId];
}

/**
 * Add command to history
 * @param {string} command - Command to add
 */
function addToCommandHistory(command) {
    if (appState.commandHistory.length === 0 || 
        appState.commandHistory[appState.commandHistory.length - 1] !== command) {
        appState.commandHistory.push(command);
    }
    appState.historyPosition = -1;
}

/**
 * Navigate command history
 * @param {string} direction - 'up' or 'down'
 * @returns {string|null} - Command from history or null
 */
function navigateCommandHistory(direction) {
    if (appState.commandHistory.length === 0) return null;
    
    if (direction === 'up') {
        if (appState.historyPosition === -1) {
            appState.historyPosition = appState.commandHistory.length - 1;
        } else if (appState.historyPosition > 0) {
            appState.historyPosition--;
        }
        return appState.commandHistory[appState.historyPosition];
    } else if (direction === 'down') {
        if (appState.historyPosition === -1) {
            return null;
        } else if (appState.historyPosition < appState.commandHistory.length - 1) {
            appState.historyPosition++;
            return appState.commandHistory[appState.historyPosition];
        } else {
            appState.historyPosition = -1;
            return '';
        }
    }
    return null;
}
