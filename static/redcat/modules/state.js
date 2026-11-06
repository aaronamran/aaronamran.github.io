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
    historyPosition: -1, // Current position in command history (-1 = not navigating)
    
    // Section-isolated simulated user state (resets when switching sections)
    simulatedUsersBySection: {}, // { sectionId: { username: { ...passwordAgingProps } } }
    
    // Section-isolated filesystem state (resets when switching sections)
    fileSystemStateBySection: {} // { sectionId: { '/path/to/file': { mode, owner, group, acls } } }
};

/**
 * Get default user state for password aging simulation
 * @returns {object} - Default user state object
 */
function getDefaultUserState() {
    return {
        'root': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 99999,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'aaron': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 99999,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'student': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 99999,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'bob': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'alice': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'sarah': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'contractor': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: '2026-12-31'
        },
        'operator': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: '2027-12-31'
        },
        'sysadmin': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'appadmin': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 99999,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'appuser': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'admin1': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'developer': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        },
        'dbadmin': {
            lastPasswordChange: '2026-03-30',
            minPasswordAge: 0,
            maxPasswordAge: 90,
            warnDays: 7,
            passwordInactive: -1,
            accountExpiry: null
        }
    };
}

/**
 * Initialize or reset simulated user state for a section
 * @param {number} sectionId - The section ID
 */
function resetSimulatedUsersForSection(sectionId) {
    appState.simulatedUsersBySection[sectionId] = getDefaultUserState();
    console.log(`🔄 Reset simulated user state for Section ${sectionId}`);
}

/**
 * Get simulated users for current section (creates if doesn't exist)
 * @returns {object} - Simulated users for current section
 */
function getSimulatedUsers() {
    const sectionId = appState.currentSectionId;
    if (!appState.simulatedUsersBySection[sectionId]) {
        resetSimulatedUsersForSection(sectionId);
    }
    return appState.simulatedUsersBySection[sectionId];
}

/**
 * Get default filesystem state for a section
 * Contains initial ownership/permissions for files used in tasks
 * @param {number} sectionId - The section ID
 * @returns {object} - Default file system state
 */
function getDefaultFileSystemState(sectionId) {
    // Section 2: Permissions and ACLs
    if (sectionId === 2) {
        return {
            '/opt/webapp': { mode: '0755', owner: 'root', group: 'root', acls: [] },
            '/var/backup': { mode: '0755', owner: 'root', group: 'backup', acls: [] },
            '/etc/appconfig': { mode: '0640', owner: 'root', group: 'root', acls: [] },
            '/shared/projects': { mode: '0755', owner: 'root', group: 'root', acls: [], sgid: false },
            '/data/reports': { mode: '0755', owner: 'root', group: 'root', acls: [] },
            '/tmp/shared': { mode: '1777', owner: 'root', group: 'root', acls: [], sticky: true },
            '/srv/files': { mode: '0755', owner: 'root', group: 'root', acls: [] },
            '/opt/myapp': { mode: '0755', owner: 'root', group: 'root', acls: [] },
            '/shared/docs': { mode: '0755', owner: 'root', group: 'root', acls: [] },
            '/opt/data': { mode: '0750', owner: 'root', group: 'root', acls: [] },
            '/var/logs': { mode: '0755', owner: 'root', group: 'root', acls: [] },
            '/opt/app': { mode: '0755', owner: 'root', group: 'root', acls: [] },
            '/data/project': { mode: '0755', owner: 'root', group: 'root', acls: [] }
        };
    }
    
    // Other sections can be added here as needed
    return {};
}

/**
 * Reset filesystem state for a section
 * @param {number} sectionId - The section ID
 */
function resetFileSystemStateForSection(sectionId) {
    appState.fileSystemStateBySection[sectionId] = getDefaultFileSystemState(sectionId);
    console.log(`🔄 Reset filesystem state for Section ${sectionId}`);
}

/**
 * Get filesystem state for current section (creates if doesn't exist)
 * @returns {object} - Filesystem state for current section
 */
function getFileSystemState() {
    const sectionId = appState.currentSectionId;
    if (!appState.fileSystemStateBySection[sectionId]) {
        resetFileSystemStateForSection(sectionId);
    }
    return appState.fileSystemStateBySection[sectionId];
}

/**
 * Update file/directory properties
 * @param {string} path - File/directory path
 * @param {object} updates - Properties to update (mode, owner, group, acls, etc.)
 */
function updateFileSystemState(path, updates) {
    const fsState = getFileSystemState();
    if (!fsState[path]) {
        // Initialize with defaults if file doesn't exist in state
        fsState[path] = { mode: '0644', owner: 'root', group: 'root', acls: [] };
    }
    Object.assign(fsState[path], updates);
    console.log(`📝 Updated filesystem state for ${path}:`, updates);
}

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
    appState.simulatedUsersBySection = {}; // Clear all section user states
    appState.fileSystemStateBySection = {}; // Clear all section filesystem states
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
        
        // Reset simulated user state for this section
        if (appState.simulatedUsersBySection[sectionId]) {
            delete appState.simulatedUsersBySection[sectionId];
        }
        
        // Reset filesystem state for this section
        if (appState.fileSystemStateBySection[sectionId]) {
            delete appState.fileSystemStateBySection[sectionId];
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
