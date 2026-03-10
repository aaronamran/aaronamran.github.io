// Sentinel-Auth Beta - API Authentication Debugger
// Version 2.1.4

// ============================================
// Configuration
// ============================================

const STAGING_SECRET = "snt_beta_9KmP8vQx2YhR3wNz7LcT6jFs4DgB5aEu"; // Staging secret
const API_CONFIG = {
    staging_endpoint: "https://staging-api.sentinel.internal/verify",
    production_endpoint: "https://api.sentinel.com/v1/auth",
    environment: "staging",
    debug_mode: true
};

// Load internal configuration (psst... check config.json)
let internalConfig = null;

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    initializeDebugMode();
    await loadInternalConfig();
    attachEventListeners();
    startNetworkMonitoring();
    simulateActivity();
});

// ============================================
// Debug Mode Console Logging
// ============================================

function initializeDebugMode() {
    if (API_CONFIG.debug_mode) {
        console.log("%cSentinel-Auth v2.1.4", "color: #00d4ff; font-weight: bold; font-size: 14px;");
        console.log("%cDebug Mode: Enabled", "color: #10b981; font-size: 12px;");
        console.log("%cEnvironment: " + API_CONFIG.environment, "color: #a1a1aa; font-size: 11px;");
    }
}

// ============================================
// Load Internal Configuration
// ============================================

async function loadInternalConfig() {
    try {
        const response = await fetch('config.json');
        internalConfig = await response.json();
        
        logToConsole('CONFIG', `Loaded ${internalConfig.test_accounts?.length || 0} test accounts from config.json`);
        
        // Update network status with "internal" IPs
        if (internalConfig.internal_ips) {
            document.getElementById('test-node-count').textContent = internalConfig.internal_ips.length;
        }
    } catch (error) {
        logToConsole('ERROR', 'Failed to load config.json. Using default configuration.');
        // Fallback config (in case they delete config.json)
        internalConfig = {
            env: "staging",
            internal_ips: ["10.0.0.5", "192.168.1.100"],
            test_accounts: [
                {"user": "dev_admin", "hint": "check_the_usual_git_history"}
            ]
        };
    }
}

// ============================================
// Event Listeners
// ============================================

function attachEventListeners() {
    document.getElementById('verify-btn').addEventListener('click', verifyToken);
    document.getElementById('decode-btn').addEventListener('click', decodeJWT);
    document.getElementById('clear-btn').addEventListener('click', clearToken);
    document.getElementById('docs-link').addEventListener('click', handleDocsClick);
    document.getElementById('admin-link').addEventListener('click', handleAdminClick);
    
    // Token input shortcuts
    document.getElementById('bearer-token').addEventListener('paste', (e) => {
        logToConsole('INFO', 'Token pasted, ready to decode or verify');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            verifyToken();
        } else if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            decodeJWT();
        } else if (e.key === 'Escape') {
            clearToken();
        }
    });
}

// ============================================
// Token Verification (Real Functionality!)
// ============================================

async function verifyToken() {
    const endpoint = document.getElementById('api-endpoint').value;
    const token = document.getElementById('bearer-token').value.trim();
    
    if (!token) {
        logToConsole('ERROR', 'Bearer token is required');
        return;
    }
    
    const btn = document.getElementById('verify-btn');
    btn.disabled = true;
    btn.classList.add('loading');
    
    logToConsole('INFO', `Verifying token against ${endpoint}...`);
    
    // Simulate API call delay
    await sleep(1500);
    
    // Actually validate JWT structure
    const isValidJWT = validateJWTStructure(token);
    
    if (isValidJWT) {
        // Decode and check expiration
        const decoded = decodeJWTPayload(token);
        const isExpired = decoded.exp && decoded.exp < Date.now() / 1000;
        
        if (isExpired) {
            logToConsole('WARN', 'Token signature valid but token is EXPIRED');
            logToConsole('INFO', `Token expired at: ${new Date(decoded.exp * 1000).toISOString()}`);
        } else {
            logToConsole('SUCCESS', '✓ Token verification successful');
            logToConsole('SUCCESS', `Valid for: ${decoded.sub || 'unknown user'}`);
            logToConsole('INFO', `Scopes: ${decoded.scope || 'N/A'}`);
            
            // Check if test account
            if (decoded.sub && internalConfig?.test_accounts) {
                const testUser = internalConfig.test_accounts.find(acc => acc.user === decoded.sub);
                if (testUser) {
                    logToConsole('INFO', `Test account: ${testUser.user} (${testUser.access_level})`);
                }
            }
        }
        
        // Increment active sessions counter
        updateActiveSessions(1);
    } else {
        logToConsole('ERROR', '✗ Invalid token format');
        logToConsole('ERROR', 'Expected JWT format: header.payload.signature');
    }
    
    btn.disabled = false;
    btn.classList.remove('loading');
}

// ============================================
// JWT Decoder (Real Functionality!)
// ============================================

function decodeJWT() {
    const token = document.getElementById('bearer-token').value.trim();
    
    if (!token) {
        logToConsole('ERROR', 'Bearer token is required');
        return;
    }
    
    logToConsole('INFO', 'Decoding JWT token...');
    
    if (!validateJWTStructure(token)) {
        logToConsole('ERROR', 'Invalid JWT structure');
        return;
    }
    
    try {
        const parts = token.split('.');
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        
        // Display decoded token
        document.getElementById('token-header').textContent = JSON.stringify(header, null, 2);
        document.getElementById('token-payload').textContent = JSON.stringify(payload, null, 2);
        document.getElementById('token-signature').textContent = 
            `Signature: ${parts[2].substring(0, 20)}...\nAlgorithm: ${header.alg}\nVerification: Requires secret key`;
        
        logToConsole('SUCCESS', 'Token decoded successfully');
        logToConsole('INFO', `Algorithm: ${header.alg}, Type: ${header.typ}`);
        
        // Analyze token claims
        if (payload.role === 'admin' || payload.role === 'superuser') {
            logToConsole('INFO', 'Administrative privileges detected');
        }
        
        // Check expiration status
        if (payload.exp) {
            const expiryDate = new Date(payload.exp * 1000);
            const now = new Date();
            const timeLeft = expiryDate - now;
            
            if (timeLeft > 0) {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                logToConsole('SUCCESS', `Token valid for ${hours}h ${minutes}m`);
            } else {
                logToConsole('WARN', 'Token is expired');
            }
        }
        
        // Save to history
        saveTokenToHistory(token, payload);
        
    } catch (error) {
        logToConsole('ERROR', `Decoding failed: ${error.message}`);
    }
}

// ============================================
// Clear Token
// ============================================

function clearToken() {
    document.getElementById('bearer-token').value = '';
    document.getElementById('token-header').textContent = '';
    document.getElementById('token-payload').textContent = '';
    document.getElementById('token-signature').textContent = '';
    logToConsole('INFO', 'Token cleared');
}

// ============================================
// Token History Management
// ============================================

function saveTokenToHistory(token, payload) {
    try {
        const history = JSON.parse(localStorage.getItem('tokenHistory') || '[]');
        const entry = {
            timestamp: new Date().toISOString(),
            subject: payload.sub || 'unknown',
            issuer: payload.iss || 'N/A',
            truncated: token.substring(0, 20) + '...'
        };
        
        history.unshift(entry);
        if (history.length > 10) history.pop();
        localStorage.setItem('tokenHistory', JSON.stringify(history));
    } catch (e) {
        // Silent fail if localStorage not available
    }
}

// ============================================
// JWT Validation Utilities
// ============================================

function validateJWTStructure(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
        atob(parts[0]);
        atob(parts[1]);
        return true;
    } catch {
        return false;
    }
}

function decodeJWTPayload(token) {
    try {
        const parts = token.split('.');
        return JSON.parse(atob(parts[1]));
    } catch {
        return {};
    }
}

// ============================================
// Console Logging System
// ============================================

function logToConsole(type, message) {
    const console = document.getElementById('console-output');
    const line = document.createElement('div');
    line.className = `console-line ${type.toLowerCase()}`;
    
    const timestamp = new Date().toLocaleTimeString();
    line.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    
    console.appendChild(line);
    console.scrollTop = console.scrollHeight;
    
    // Keep console from growing infinitely
    if (console.children.length > 50) {
        console.removeChild(console.firstChild);
    }
}

// ============================================
// Network Monitoring (Adds Realism)
// ============================================

function startNetworkMonitoring() {
    // Simulate periodic network checks
    setInterval(() => {
        const randomChange = Math.random() > 0.7;
        if (randomChange) {
            updateActiveSessions(Math.random() > 0.5 ? 1 : -1);
        }
    }, 8000);
}

function updateActiveSessions(delta) {
    const sessionsEl = document.getElementById('active-sessions');
    let current = parseInt(sessionsEl.textContent) || 0;
    current = Math.max(0, current + delta);
    sessionsEl.textContent = current;
}

// ============================================
// Simulated Activity (Makes it Feel Alive)
// ============================================

function simulateActivity() {
    const activities = [
        { delay: 3000, msg: 'Background heartbeat check completed', type: 'INFO' },
        { delay: 7000, msg: 'Refreshing internal DNS cache...', type: 'SYS' },
        { delay: 12000, msg: 'Checking for configuration updates...', type: 'INFO' },
        { delay: 18000, msg: 'Connection pool status: 4/10 active', type: 'SYS' }
    ];
    
    activities.forEach(activity => {
        setTimeout(() => {
            logToConsole(activity.type, activity.msg);
        }, activity.delay);
    });
}

// ============================================
// Admin Panel Link
// ============================================

function handleAdminClick(e) {
    e.preventDefault();
    
    // Show token history
    try {
        const history = JSON.parse(localStorage.getItem('tokenHistory') || '[]');
        if (history.length === 0) {
            logToConsole('INFO', 'No token history available');
        } else {
            logToConsole('INFO', `Token History (${history.length} entries):`);
            history.forEach((entry, i) => {
                logToConsole('INFO', `  ${i + 1}. ${entry.subject} - ${new Date(entry.timestamp).toLocaleString()}`);
            });
        }
    } catch (e) {
        logToConsole('ERROR', 'Unable to load token history');
    }
}

function handleDocsClick(e) {
    e.preventDefault();
    logToConsole('INFO', 'Keyboard Shortcuts:');
    logToConsole('INFO', '  Ctrl+Enter - Verify Token');
    logToConsole('INFO', '  Ctrl+D - Decode JWT');
    logToConsole('INFO', '  Esc - Clear Token');
    logToConsole('INFO', '');
    logToConsole('INFO', 'Sample Tokens: window.SAMPLE_TOKENS.valid / .expired');
    logToConsole('INFO', 'Token History: Click Token History to view');
    logToConsole('INFO', '');
    logToConsole('INFO', 'JWT Format: header.payload.signature (Base64URL encoded)');
}

// ============================================
// Utility Functions
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Sample JWT Tokens (For Testing)
// ============================================

// They can use these to test the decoder
const SAMPLE_TOKENS = {
    valid: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZfYWRtaW4iLCJuYW1lIjoiRGV2IEFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTksInNjb3BlIjoicmVhZDp1c2VycyB3cml0ZTp1c2VycyBhZG1pbjphbGwifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    expired: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXIiLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vQz_bVb7g5h0Qq4tEq0q8YfF4V4Qb4Q8XQZQY"
};

// Sample tokens available for quick testing
if (API_CONFIG.debug_mode) {
    console.log("%cSample tokens available:", "color: #a1a1aa; font-size: 10px;");
    console.log("  window.SAMPLE_TOKENS.valid");
    console.log("  window.SAMPLE_TOKENS.expired");
}
window.SAMPLE_TOKENS = SAMPLE_TOKENS;
