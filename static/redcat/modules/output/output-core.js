/** Red Cat - Output Core */

/**
 * Red Cat - Output Generation Module
 * 
 * Generates simulated command output for audit tasks and pre-check commands
 * Enhanced with dynamic date/time calculations
 */

// Import datetime utilities if available
let datetimeUtils = null;
if (typeof require !== 'undefined') {
    try {
        datetimeUtils = require('../terminal/datetime.js');
    } catch (e) {
        console.warn('datetime.js not loaded, using static dates');
    }
}

// Version tracking for cache debugging
console.log('output.js loaded - Version: 2024-04-06-v2 (getfacl syntax fixed)');

/**
 * Helper function to get current date and calculate password-related dates
 * @returns {object} - Object with formatted dates
 */
function getPasswordDates() {
    const now = new Date();
    
    // Last password change: 7 days ago (simulating recent password set)
    const lastChange = new Date(now);
    lastChange.setDate(lastChange.getDate() - 7);
    
    // Helper to format date as YYYY-MM-DD for passwd -S
    const formatYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Helper to format date as "Mon DD, YYYY" for chage -l
    const formatMonDDYYYY = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };
    
    // Calculate expiration dates based on max days
    const calculateExpiry = (maxDays) => {
        const expiry = new Date(lastChange);
        expiry.setDate(expiry.getDate() + maxDays);
        return expiry;
    };
    
    return {
        lastChangeShort: formatYYYYMMDD(lastChange),
        lastChangeLong: formatMonDDYYYY(lastChange),
        expiry60: formatMonDDYYYY(calculateExpiry(60)),
        expiry45: formatMonDDYYYY(calculateExpiry(45)),
        expiry90: formatMonDDYYYY(calculateExpiry(90))
    };
}

/**
 * Helper function to get formatted date for login timestamps
 * @returns {object} - Object with various date formats
 */
function getLoginDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthShort = months[now.getMonth()];
    
    return {
        whoFormat: `${year}-${month}-${day}`,  // YYYY-MM-DD format for who command
        lsShortFormat: `${monthShort} ${day}`,  // "Mon DD" format for ls
    };
}

/**
 * Helper function to check if input contains specific flags regardless of order
 * @param {string} input - User's full input
 * @param {string} flagString - Flag string to check (e.g., 'ld', 'li', 'lR')
 * @returns {boolean} - True if all flags in flagString are present
 */
function hasFlags(input, flagString) {
    // Match all flag groups (e.g., -ld, -l, -d, --long)
    const flagMatches = input.match(/-[a-zA-Z]+/g);
    if (!flagMatches) return false;
    
    // Combine all single-dash flags into one string
    const allFlags = flagMatches
        .filter(f => !f.startsWith('--')) // Exclude long options
        .map(f => f.substring(1)) // Remove the dash
        .join('');
    
    // Check if all required flags are present
    return flagString.split('').every(flag => allFlags.includes(flag));
}

/**
 * Generate simulated command output for audit tasks (AFTER state)
 * @param {object} task - The task object
 * @param {string} input - User's full input
 * @param {object} grepParsed - Parsed grep info if present
 * @returns {string|null} - Simulated output or null
 */
function generateSimulatedOutput(task, input, grepParsed) {
    const sectionId = typeof appState !== 'undefined' ? appState.currentSectionId : null;
    const isSection1 = sectionId === 1;

    const baseCommand = grepParsed ? grepParsed.command : input;
    const tokens = baseCommand.trim().split(/\s+/);
    const command = tokens[0];

    // Script execution via ./ or bash/sh <script.sh> always gets output
    const isScriptExec = command.startsWith('./') ||
        ((command === 'bash' || command === 'sh') && tokens.some(t => t.endsWith('.sh') && !t.startsWith('-')));

    // Only generate output for: Section 1 tasks, Audit tasks, passwd task (id=5), or script execution
    if (!isSection1 && task.category !== 'Audit' && task.id !== 5 && !isScriptExec) {
        return null;
    }
    
    // For Section 1 Implementation tasks with output redirect, suppress output
    if (isSection1 && task.category === 'Implementation' && input.includes('>')) {
        return null;
    }
    
    if (sectionId === 1) {
        return generateSection1Output(command, input, tokens);
    } else if (sectionId === 2) {
        return generateSection2Output(command, input, tokens);
    } else if (sectionId === 3) {
        return generateSection3Output(command, input, tokens);
    } else if (sectionId === 4) {
        return generateSection4Output(command, input, tokens);
    } else if (sectionId === 5) {
        return generateSection5Output(command, input, tokens);
    } else if (sectionId === 6) {
        return generateSection6Output(command, input, tokens);
    } else if (sectionId === 7) {
        return generateSection7Output(command, input, tokens);
    } else if (sectionId === 8) {
        return generateSection8Output(command, input, tokens);
    } else if (sectionId === 9) {
        return generateSection9Output(command, input, tokens);
    } else if (sectionId === 10) {
        return generateSection10Output(command, input, tokens);
    } else if (sectionId === 11) {
        return generateSection11Output(command, input, tokens);
    } else if (sectionId === 12) {
        return generateSection12Output(command, input, tokens);
    } else if (sectionId === 13) {
        return generateSection13Output(command, input, tokens);
    } else if (sectionId === 14) {
        return generateSection14Output(command, input, tokens);
    } else if (sectionId === 15) {
        return generateSection15Output(command, input, tokens);
    } else if (sectionId === 16) {
        return generateSection16Output(command, input, tokens);
    } else if (sectionId === 17) {
        return generateSection17Output(command, input, tokens);
    } else if (sectionId === 18) {
        return generateSection18Output(input, tokens);
    } else if (sectionId === 19) {
        return generateSection19Output(command, input, tokens);
    } else if (sectionId === 20) {
        return generateSection20Output(command, input, tokens);
    }
    
    return null;
}

/**
 * Section 1: Essential Tools - Output Generator
 * Covers: find, grep, cat, wc, tar, ls, du, ps, man, apropos, whatis, vim, sed
 */
function generatePreCheckOutput(task, input, grepParsed) {
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);
    const section = getSectionById(appState.currentSectionId, questionSetIndex);
    const baseCommand = grepParsed ? grepParsed.command : input;
    const tokens = baseCommand.trim().split(/\s+/);
    const command = tokens[0];
    
    // Section-specific pre-check generators
    if (section.id === 1) {
        return generateSection1PreCheck(task, command, input, tokens);
    } else if (section.id === 2) {
        return generateSection2PreCheck(task, command, input, tokens);
    } else if (section.id === 3) {
        return generateSection3PreCheck(task, command, input, tokens);
    } else if (section.id === 4) {
        return generateSection4PreCheck(task, command, input, tokens);
    } else if (section.id === 5) {
        return generateSection5PreCheck(task, command, input, tokens);
    } else if (section.id === 6) {
        return generateSection6PreCheck(task, command, input, tokens);
    } else if (section.id === 7) {
        return generateSection7PreCheck(task, command, input, tokens);
    } else if (section.id === 8) {
        return generateSection8PreCheck(task, command, input, tokens);
    } else if (section.id === 9) {
        return generateSection9PreCheck(task, command, input, tokens);
    } else if (section.id === 10) {
        return generateSection10PreCheck(task, command, input, tokens);
    } else if (section.id === 11) {
        return generateSection11PreCheck(task, command, input, tokens);
    } else if (section.id === 13) {
        return generateSection13PreCheck(task, command, input, tokens);
    } else if (section.id === 14) {
        return generateSection14PreCheck(task, command, input, tokens);
    } else if (section.id === 15) {
        return generateSection15PreCheck(task, command, input, tokens);
    } else if (section.id === 18) {
        return generateSection18PreCheck(input, tokens);
    } else if (section.id === 19) {
        return generateSection19PreCheck(task, command, input, tokens);
    } else if (section.id === 20) {
        return generateSection20PreCheck(task, command, input, tokens);
    }
    
    return null;
}


/**
 * Section 1 Pre-Check Output (BEFORE state)
 */
