/**
 * Red Cat - Validation Engine Module
 * 
 * This module handles command parsing and validation.
 * It checks if user input matches expected command structure without
 * simulating actual Linux execution.
 */

/**
 * Split a command line into tokens, keeping quoted text together.
 * Quotes are removed from the resulting tokens.
 */
function tokenizeCommand(input) {
    const tokens = [];
    let current = '';
    let quote = null;
    let has = false;
    
    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (quote) {
            if (ch === quote) {
                quote = null;
            } else {
                current += ch;
            }
        } else if (ch === '"' || ch === "'") {
            quote = ch;
            has = true;
        } else if (ch === '\\' && i + 1 < input.length) {
            // Backslash escape outside quotes: \; -> ;
            current += input[++i];
            has = true;
        } else if (/\s/.test(ch)) {
            if (has || current !== '') {
                tokens.push(current);
                current = '';
                has = false;
            }
        } else {
            current += ch;
            has = true;
        }
    }
    if (has || current !== '') tokens.push(current);
    return tokens;
}

/**
 * Expand a flag-like token into its individual short flags.
 * "-czf" -> ["-c", "-z", "-f"]; long flags and "-x=val" stay as-is.
 */
function expandFlag(token) {
    if (token.startsWith('--') || token.includes('=') || token.length <= 2 || !/^-[A-Za-z]+$/.test(token)) {
        return [token];
    }
    return token.slice(1).split('').map(c => '-' + c);
}

/**
 * Parse a command string into components
 * @param {string} input - Raw command input from user
 * @returns {object} Parsed command object
 */
function parseCommand(input) {
    const trimmed = input.trim();
    
    if (trimmed === '') {
        return { command: '', flags: [], values: [], tokens: [], words: [], raw: input };
    }
    
    const tokens = tokenizeCommand(input.trim());
    const command = tokens[0];
    const flags = [];
    const values = [];
    
    for (let i = 1; i < tokens.length; i++) {
        const token = tokens[i];
        
        if (token.startsWith('-') && token.length > 1) {
            flags.push(...expandFlag(token));
        } else {
            values.push(token);
        }
    }
    
    // Plain whitespace-split words with quote characters removed, so that task data
    // written as split fragments ("'2024-12-25", "10:30:00'") still matches quoted input
    const words = trimmed.replace(/['"]/g, '').split(' ').slice(1);
    
    return { command, flags, values, tokens: tokens.slice(1), words, raw: trimmed };
}

/**
 * Check whether one required item (flag or value) appears in the command.
 * Task data is not always strict about whether an item is listed under
 * requiredFlags or requiredValues (e.g. "--reload", "aux", "/dev/sdb"),
 * so both lists are matched against every argument the user typed.
 */
function hasArgument(parsed, required) {
    const wanted = tokenizeCommand(String(required));
    const want = wanted.length === 1 ? wanted[0] : wanted.join(' ');
    
    if (parsed.tokens.includes(want) || parsed.values.includes(want) || parsed.flags.includes(want)) {
        return true;
    }

    const bare = String(required).replace(/['"]/g, '');
    if (bare !== '' && parsed.words.includes(bare)) {
        return true;
    }
    
    if (wanted.length > 1 && parsed.raw.replace(/['"]/g, '').includes(bare)) {
        return true;
    }
    
    // Size arguments are case-insensitive in practice (8m / 8M, 500mb / 500MB)
    if (/^\+?\d+[A-Za-z]+$/.test(want) &&
        parsed.tokens.some(t => t.toLowerCase() === want.toLowerCase())) {
        return true;
    }
    
    const requiredFlags = expandFlag(want);
    
    // tar accepts its options without a dash: tar czf archive.tgz dir
    if (parsed.command === 'tar' && /^-[A-Za-z]+$/.test(want) && /^[A-Za-z]+$/.test(parsed.values[0] || '')) {
        if (requiredFlags.every(f => parsed.values[0].includes(f[1]))) return true;
    }

    // Combined short flags: required "-aG" is satisfied by "-Ga" or "-a -G"
    if (requiredFlags.length > 1 || (want.startsWith('-') && !want.startsWith('--'))) {
        return requiredFlags.every(f => parsed.flags.includes(f));
    }
    
    // Bare options like "aux" or "ef" typed with a dash (ps -aux), or vice versa
    if (/^[A-Za-z]+$/.test(want) && parsed.flags.length > 0) {
        const letters = want.split('').map(c => '-' + c);
        if (letters.every(f => parsed.flags.includes(f))) return true;
    }
    
    return false;
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
    
    for (const requiredFlag of expected.requiredFlags || []) {
        if (!hasArgument(parsed, requiredFlag)) {
            result.missingFlags.push(requiredFlag);
        }
    }
    
    if (result.missingFlags.length > 0) {
        result.message = `Missing required flags or incorrect syntax.`;
        return result;
    }
    
    for (const requiredValue of expected.requiredValues || []) {
        if (!hasArgument(parsed, requiredValue)) {
            result.missingValues.push(requiredValue);
        }
    }
    
    if (result.missingValues.length > 0) {
        result.message = `Missing required arguments or incorrect values.`;
        return result;
    }

    // Check ordered values if specified (values must appear in exact order)
    if (expected.orderedValues && expected.orderedValues.length > 0) {
        let lastIndex = -1;
        for (const orderedValue of expected.orderedValues) {
            // task data may spell an escaped token as typed ("\\;"); the parsed command holds it unescaped (";")
            const unescaped = tokenizeCommand(String(orderedValue));
            const wanted = unescaped.length === 1 ? unescaped[0] : orderedValue;
            const currentIndex = parsed.values.indexOf(wanted);
            if (currentIndex === -1) {
                result.missingValues.push(orderedValue);
            } else if (currentIndex <= lastIndex) {
                result.message = `Arguments must be in the correct order.`;
                return result;
            }
            lastIndex = currentIndex;
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
    const variants = (Array.isArray(expected) ? expected : [expected]).filter(Boolean);

    if (parsed.command === '') {
        return {
            valid: false,
            message: 'No command entered. Type a command and try again.',
            parsed
        };
    }

    // Allow script execution via ./ prefix (e.g. ./hello.sh)
    const isScriptExec = parsed.command.startsWith('./');

    // "Write the line" tasks: the answer is the text itself (cron entry, unit directive,
    // shell construct...). A variant with 'match' lists regular expressions for the
    // whitespace-normalized input.
    const text = input.trim().replace(/\s+/g, ' ');
    const lineVariants = variants.filter(x => x.match);
    for (const variant of lineVariants) {
        for (const re of variant.match) {
            if (new RegExp(re).test(text)) {
                return { valid: true, message: 'Correct! Syntax is valid.', parsed };
            }
        }
    }

    const cmdVariants = variants.filter(x => !x.match);
    if (cmdVariants.length === 0) {
        return {
            valid: false,
            message: variants.length ? 'That is not the line this task asks for. Check the syntax and try again.' : 'Invalid or incomplete command.',
            parsed
        };
    }

    if (!isScriptExec && !isCommandSupported(parsed.command)) {
        return {
            valid: false,
            message: lineVariants.length ? 'Not quite. Check the task description and try again.' : `Command '${parsed.command}' is not supported in this trainer.`,
            parsed
        };
    }

    for (const variant of cmdVariants) {
        const result = checkRequirements(parsed, variant);
        if (result.valid) {
            return { valid: true, message: result.message, parsed };
        }
    }

    const lastResult = checkRequirements(parsed, cmdVariants[cmdVariants.length - 1]);
    return { valid: false, message: lastResult.message, parsed };
}

/**
 * Generate helpful hints based on validation errors
 */
function generateHint(validationResult, expected) {
    if (validationResult.valid) return '';
    
    const parsed = validationResult.parsed;
    const first = Array.isArray(expected) ? expected[0] : expected;
    if (first && first.match) return 'Hint: Type the line itself, exactly as it would appear in the file or script.';
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
