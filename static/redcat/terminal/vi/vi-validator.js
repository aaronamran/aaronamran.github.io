// Script Validator for Shell Scripting Section
// Validates bash script content against expected patterns

/**
 * Validate script content based on requirements
 * @param {string} filepath - Path to the script file
 * @param {object} fs - Filesystem object
 * @param {object} requirements - Validation requirements
 * @returns {object} Validation result
 */
function validateScript(filepath, fs, requirements) {
    const fileNode = fs.getNode(filepath);
    
    if (!fileNode) {
        return {
            valid: false,
            message: `File ${filepath} does not exist`
        };
    }

    if (fileNode.type !== 'file') {
        return {
            valid: false,
            message: `${filepath} is not a file`
        };
    }

    const content = fileNode.content || '';
    const lines = content.split('\n');

    // Helper functions for validation
    const checks = {
        // Check if content contains all required strings
        mustContain: (patterns) => {
            const missing = [];
            for (const pattern of patterns) {
                if (typeof pattern === 'string') {
                    // Simple string match (case-insensitive)
                    if (!content.toLowerCase().includes(pattern.toLowerCase())) {
                        missing.push(pattern);
                    }
                } else if (pattern instanceof RegExp) {
                    // Regex match
                    if (!pattern.test(content)) {
                        missing.push(pattern.toString());
                    }
                }
            }
            return missing;
        },

        // Check if content contains any of the patterns
        mustContainAny: (patterns) => {
            for (const pattern of patterns) {
                if (typeof pattern === 'string') {
                    if (content.toLowerCase().includes(pattern.toLowerCase())) {
                        return true;
                    }
                } else if (pattern instanceof RegExp) {
                    if (pattern.test(content)) {
                        return true;
                    }
                }
            }
            return false;
        },

        // Check for shebang
        hasShebang: () => {
            return lines[0] && lines[0].trim().startsWith('#!');
        },

        // Check for bash shebang specifically
        hasBashShebang: () => {
            return lines[0] && /^#!.*bash/.test(lines[0].trim());
        },

        // Check if file is executable
        isExecutable: () => {
            const perms = fileNode.permissions || 'rw-r--r--';
            return perms[2] === 'x' || perms[5] === 'x' || perms[8] === 'x';
        },

        // Check minimum number of lines
        minLines: (count) => {
            return lines.filter(l => l.trim() !== '').length >= count;
        },

        // Check for specific function definition
        hasFunction: (funcName) => {
            const funcPattern = new RegExp(`(function\\s+${funcName}|${funcName}\\s*\\(\\s*\\))`, 'i');
            return funcPattern.test(content);
        },

        // Check for specific variable usage
        hasVariable: (varName) => {
            const varPattern = new RegExp(`\\$${varName}|\\$\\{${varName}`, 'i');
            return varPattern.test(content);
        },

        // Check for control structures
        hasIfStatement: () => {
            return /if\s+\[/.test(content) || /if\s+\[\[/.test(content) || /if\s+test/.test(content);
        },

        hasElseStatement: () => {
            return /else/.test(content);
        },

        hasFiClosing: () => {
            return /fi/.test(content);
        },

        hasForLoop: () => {
            return /for\s+\w+\s+in/.test(content) || /for\s*\(\(/.test(content);
        },

        hasWhileLoop: () => {
            return /while\s+/.test(content);
        },

        hasUntilLoop: () => {
            return /until\s+/.test(content);
        },

        hasCaseStatement: () => {
            return /case\s+.*\s+in/.test(content);
        },

        // Check for specific patterns (more flexible)
        matchesPattern: (pattern, minOccurrences = 1) => {
            const regex = new RegExp(pattern, 'gi');
            const matches = content.match(regex);
            return matches && matches.length >= minOccurrences;
        }
    };

    // Perform validation based on requirements
    try {
        // Check mustContain patterns
        if (requirements.mustContain) {
            const missing = checks.mustContain(requirements.mustContain);
            if (missing.length > 0) {
                return {
                    valid: false,
                    message: `Script is missing required content: ${missing.join(', ')}`
                };
            }
        }

        // Check mustContainAny patterns
        if (requirements.mustContainAny) {
            if (!checks.mustContainAny(requirements.mustContainAny)) {
                return {
                    valid: false,
                    message: `Script must contain at least one of: ${requirements.mustContainAny.join(', ')}`
                };
            }
        }

        // Check for shebang
        if (requirements.hasShebang && !checks.hasShebang()) {
            return {
                valid: false,
                message: 'Script must start with a shebang line (#!/bin/bash)'
            };
        }

        if (requirements.hasBashShebang && !checks.hasBashShebang()) {
            return {
                valid: false,
                message: 'Script must start with bash shebang (#!/bin/bash)'
            };
        }

        // Check executable permission
        if (requirements.mustBeExecutable && !checks.isExecutable()) {
            return {
                valid: false,
                message: 'Script must be executable (use chmod +x)'
            };
        }

        // Check minimum lines
        if (requirements.minLines && !checks.minLines(requirements.minLines)) {
            return {
                valid: false,
                message: `Script must have at least ${requirements.minLines} non-empty lines`
            };
        }

        // Check for function
        if (requirements.hasFunction) {
            const funcs = Array.isArray(requirements.hasFunction) 
                ? requirements.hasFunction 
                : [requirements.hasFunction];
            
            for (const func of funcs) {
                if (!checks.hasFunction(func)) {
                    return {
                        valid: false,
                        message: `Script must define function: ${func}`
                    };
                }
            }
        }

        // Check for variable
        if (requirements.hasVariable) {
            const vars = Array.isArray(requirements.hasVariable) 
                ? requirements.hasVariable 
                : [requirements.hasVariable];
            
            for (const varName of vars) {
                if (!checks.hasVariable(varName)) {
                    return {
                        valid: false,
                        message: `Script must use variable: $${varName}`
                    };
                }
            }
        }

        // Check for control structures
        if (requirements.hasIfStatement && !checks.hasIfStatement()) {
            return {
                valid: false,
                message: 'Script must contain an if statement'
            };
        }

        if (requirements.hasElseStatement && !checks.hasElseStatement()) {
            return {
                valid: false,
                message: 'Script must contain an else statement'
            };
        }

        if (requirements.hasFiClosing && !checks.hasFiClosing()) {
            return {
                valid: false,
                message: 'Script must properly close if statement with fi'
            };
        }

        if (requirements.hasForLoop && !checks.hasForLoop()) {
            return {
                valid: false,
                message: 'Script must contain a for loop'
            };
        }

        if (requirements.hasWhileLoop && !checks.hasWhileLoop()) {
            return {
                valid: false,
                message: 'Script must contain a while loop'
            };
        }

        if (requirements.hasUntilLoop && !checks.hasUntilLoop()) {
            return {
                valid: false,
                message: 'Script must contain an until loop'
            };
        }

        if (requirements.hasCaseStatement && !checks.hasCaseStatement()) {
            return {
                valid: false,
                message: 'Script must contain a case statement'
            };
        }

        // Check custom patterns
        if (requirements.matchesPattern) {
            for (const [pattern, minOccurrences] of Object.entries(requirements.matchesPattern)) {
                if (!checks.matchesPattern(pattern, minOccurrences)) {
                    return {
                        valid: false,
                        message: `Script must contain pattern: ${pattern}`
                    };
                }
            }
        }

        // Custom validator function
        if (requirements.customValidator && typeof requirements.customValidator === 'function') {
            const result = requirements.customValidator(content, lines, fileNode);
            if (!result.valid) {
                return result;
            }
        }

        // All checks passed
        return {
            valid: true,
            message: 'Script validation successful'
        };

    } catch (error) {
        return {
            valid: false,
            message: `Validation error: ${error.message}`
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.validateScript = validateScript;
}
