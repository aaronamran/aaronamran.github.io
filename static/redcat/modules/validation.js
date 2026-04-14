/**
 * Red Cat - Validation Engine Module
 * 
 * This module handles command parsing and validation.
 * It checks if user input matches expected command structure without
 * simulating actual Linux execution.
 */

/**
 * Parse a command string into components
 * @param {string} input - Raw command input from user
 * @returns {object} Parsed command object
 */
function parseCommand(input) {
    const trimmed = input.trim().replace(/\s+/g, ' ');
    
    if (trimmed === '') {
        return {
            command: '',
            flags: [],
            values: [],
            raw: input
        };
    }
    
    const tokens = trimmed.split(' ');
    const command = tokens[0];
    const flags = [];
    const values = [];
    
    for (let i = 1; i < tokens.length; i++) {
        const token = tokens[i];
        
        if (token.startsWith('-')) {
            if (token.startsWith('--')) {
                flags.push(token);
            } else if (token.length > 2 && !token.includes('=')) {
                // Combined short flags: -czf -> -c, -z, -f
                for (let j = 1; j < token.length; j++) {
                    flags.push('-' + token[j]);
                }
            } else {
                flags.push(token);
            }
        } else {
            values.push(token);
        }
    }
    
    return { command, flags, values, raw: trimmed };
}

/**
 * Check if all required elements are present in the parsed command
 */
function checkRequirements(parsed, expected) {
    const result = {
        valid: false,
        missingFlags: [],
        missingValues: [],
        wrongCommand: false,
        message: ''
    };
    
    if (parsed.command !== expected.command) {
        result.wrongCommand = true;
        result.message = `Invalid or incomplete command.`;
        return result;
    }
    
    if (expected.requiredFlags && expected.requiredFlags.length > 0) {
        for (const requiredFlag of expected.requiredFlags) {
            if (!parsed.flags.includes(requiredFlag)) {
                result.missingFlags.push(requiredFlag);
            }
        }
        
        if (result.missingFlags.length > 0) {
            result.message = `Missing required flags or incorrect syntax.`;
            return result;
        }
    }
    
    if (expected.requiredValues && expected.requiredValues.length > 0) {
        for (const requiredValue of expected.requiredValues) {
            if (!parsed.values.includes(requiredValue)) {
                result.missingValues.push(requiredValue);
            }
        }
        
        if (result.missingValues.length > 0) {
            result.message = `Missing required arguments or incorrect values.`;
            return result;
        }
    }
    
    result.valid = true;
    result.message = 'Correct! Command structure is valid.';
    return result;
}

/**
 * Validate user input against expected command(s)
 */
function validateCommand(input, expected) {
    const parsed = parseCommand(input);
    
    if (parsed.command === '') {
        return {
            valid: false,
            message: 'No command entered. Type a command and try again.',
            parsed
        };
    }
    
    if (!isCommandSupported(parsed.command)) {
        return {
            valid: false,
            message: `Command '${parsed.command}' is not supported in this trainer.`,
            parsed
        };
    }
    
    if (Array.isArray(expected)) {
        for (const variant of expected) {
            const result = checkRequirements(parsed, variant);
            if (result.valid) {
                return { valid: true, message: result.message, parsed };
            }
        }
        
        const lastResult = checkRequirements(parsed, expected[expected.length - 1]);
        return { valid: false, message: lastResult.message, parsed };
    }
    
    const result = checkRequirements(parsed, expected);
    return { valid: result.valid, message: result.message, parsed };
}

/**
 * Generate helpful hints based on validation errors
 */
function generateHint(validationResult, expected) {
    if (validationResult.valid) return '';
    
    const parsed = validationResult.parsed;
    const expectedCmd = Array.isArray(expected) ? expected[0].command : expected.command;
    
    if (parsed.command !== expectedCmd) {
        return `Hint: Try using the '${expectedCmd}' command for this task.`;
    }
    
    const expectedFlags = Array.isArray(expected) ? expected[0].requiredFlags : expected.requiredFlags;
    if (expectedFlags && expectedFlags.length > 0 && parsed.flags.length === 0) {
        return `Hint: This command requires flags. Check the required flags: ${expectedFlags.join(', ')}`;
    }
    
    const expectedValues = Array.isArray(expected) ? expected[0].requiredValues : expected.requiredValues;
    if (expectedValues && expectedValues.length > 0) {
        return `Hint: Make sure you include all required values: ${expectedValues.join(', ')}`;
    }
    
    return 'Hint: Check the task description carefully and try again.';
}

/**
 * Parse grep command to extract base command and grep pattern
 */
function parseGrepCommand(input) {
    const pipeIndex = input.indexOf('|');
    if (pipeIndex === -1) {
        return null;
    }
    
    const beforePipe = input.substring(0, pipeIndex).trim();
    const afterPipe = input.substring(pipeIndex + 1).trim();
    
    if (!afterPipe.startsWith('grep')) {
        return null;
    }
    
    const grepTokens = afterPipe.split(/\s+/);
    const grepPattern = grepTokens[1] || '';
    
    return {
        command: beforePipe,
        grepPattern: grepPattern.replace(/['"]/g, '')
    };
}
