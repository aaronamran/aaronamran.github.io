/**
 * Date/Time Utilities for Terminal Simulation
 * Handles dynamic date calculations for password aging, account expiry, etc.
 */

/**
 * Get the current simulation date
 * @returns {Date} - Current date (April 6, 2026)
 */
function getCurrentDate() {
    return new Date('2026-04-06T00:00:00');
}

/**
 * Format date as "Mon DD, YYYY" for chage -l output
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatMonDDYYYY(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

/**
 * Format date as "YYYY-MM-DD" for passwd -S output
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Calculate password expiry date based on last change and max days
 * @param {Date} lastChangeDate - Date of last password change
 * @param {number} maxDays - Maximum number of days before password expires
 * @returns {Date} - Expiry date
 */
function calculateExpiryDate(lastChangeDate, maxDays) {
    const expiry = new Date(lastChangeDate);
    expiry.setDate(expiry.getDate() + maxDays);
    return expiry;
}

/**
 * Add days to a date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Subtract days from a date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {Date} - New date
 */
function subtractDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}

/**
 * Get user-specific password aging dates
 * @param {object} user - User object from filesystem
 * @param {Date} currentDate - Current simulation date
 * @returns {object} - Formatted date strings for chage output
 */
function getUserPasswordDates(user, currentDate = getCurrentDate()) {
    // Use stored lastPasswordChange or default to 7 days ago
    const lastChange = user.lastPasswordChange 
        ? new Date(user.lastPasswordChange) 
        : subtractDays(currentDate, 7);
    
    // Get max password age (default 99999 means never expires)
    const maxDays = user.maxPasswordAge !== undefined ? user.maxPasswordAge : 99999;
    
    // Calculate expiry date
    let expiryDate;
    let expiryString;
    if (maxDays === 99999 || maxDays === -1) {
        expiryString = 'never';
    } else {
        expiryDate = calculateExpiryDate(lastChange, maxDays);
        expiryString = formatMonDDYYYY(expiryDate);
    }
    
    // Get account expiry date
    const accountExpiryString = user.accountExpiry 
        ? formatMonDDYYYY(new Date(user.accountExpiry))
        : 'never';
    
    // Get password inactive period
    const inactiveString = user.passwordInactive !== undefined && user.passwordInactive !== -1
        ? user.passwordInactive.toString()
        : 'never';
    
    // Get min days between password change
    const minDays = user.minPasswordAge !== undefined ? user.minPasswordAge : 0;
    
    // Get warning days
    const warnDays = user.warnDays !== undefined ? user.warnDays : 7;
    
    return {
        lastChangeFormatted: formatMonDDYYYY(lastChange),
        lastChangeShort: formatYYYYMMDD(lastChange),
        expiryFormatted: expiryString,
        accountExpiryFormatted: accountExpiryString,
        inactiveFormatted: inactiveString,
        minDays: minDays,
        maxDays: maxDays === 99999 ? 99999 : maxDays,
        warnDays: warnDays
    };
}

/**
 * Generate chage -l output for a user
 * @param {object} user - User object from filesystem
 * @returns {string} - Formatted chage -l output
 */
function generateChageOutput(user) {
    const dates = getUserPasswordDates(user);
    
    return `Last password change\t\t\t\t\t: ${dates.lastChangeFormatted}
Password expires\t\t\t\t\t: ${dates.expiryFormatted}
Password inactive\t\t\t\t\t: ${dates.inactiveFormatted}
Account expires\t\t\t\t\t\t: ${dates.accountExpiryFormatted}
Minimum number of days between password change\t\t: ${dates.minDays}
Maximum number of days between password change\t\t: ${dates.maxDays}
Number of days of warning before password expires\t: ${dates.warnDays}`;
}

/**
 * Generate passwd -S output for a user
 * @param {string} username - Username
 * @param {object} user - User object from filesystem
 * @returns {string} - Formatted passwd -S output
 */
function generatePasswdStatusOutput(username, user) {
    const dates = getUserPasswordDates(user);
    return `${username} PS ${dates.lastChangeShort} ${dates.minDays} ${dates.maxDays} ${dates.warnDays} -1 (Password set, SHA512 crypt.)`;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCurrentDate,
        formatMonDDYYYY,
        formatYYYYMMDD,
        calculateExpiryDate,
        addDays,
        subtractDays,
        getUserPasswordDates,
        generateChageOutput,
        generatePasswdStatusOutput
    };
}

// Also make functions globally available for browser usage
if (typeof window !== 'undefined') {
    window.getCurrentDate = getCurrentDate;
    window.formatMonDDYYYY = formatMonDDYYYY;
    window.formatYYYYMMDD = formatYYYYMMDD;
    window.calculateExpiryDate = calculateExpiryDate;
    window.addDays = addDays;
    window.subtractDays = subtractDays;
    window.getUserPasswordDates = getUserPasswordDates;
    window.generateChageOutput = generateChageOutput;
    window.generatePasswdStatusOutput = generatePasswdStatusOutput;
}
