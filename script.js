// ===== GAME STATE =====
const gameState = {
    mood: 3, // 0 = angry, 3 = happy
    actionsCompleted: [],
    requiredActions: ['restart-vm', 'scale-server', 'balance-traffic'],
    wrongAttempts: 0,
    gameOver: false
};

// ===== CHAT MESSAGES =====
const messages = {
    initial: "Hey! I can't access the website. I have a deadline in 30 minutes! Can you help? 😫",
    success: "It's working again! Thanks so much! You're a lifesaver! 😄"
};

// ===== SCENARIO CONFIGURATION =====
const scenarios = [
    {
        id: 'vm-loadbalancer',
        required: ['restart-vm', 'scale-server', 'balance-traffic'],
        degradedServices: ['vm', 'loadbalancer'],
        description: 'VM degraded and load balancer overloaded'
    },
    {
        id: 'hardware-patch',
        required: ['replace-hardware', 'apply-patch'],
        degradedServices: ['vm', 'storage'],
        description: 'Hardware failure and OS patch needed'
    },
    {
        id: 'capacity-scaling',
        required: ['scale-server', 'balance-traffic'],
        degradedServices: ['vm', 'loadbalancer'],
        description: 'Capacity issues and traffic imbalance'
    }
];

let currentScenario;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    initializeTheme();
});

function initializeGame() {
    // Select random scenario
    currentScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    gameState.requiredActions = [...currentScenario.required];
    
    // Reset game state
    gameState.mood = 3;
    gameState.actionsCompleted = [];
    gameState.wrongAttempts = 0;
    gameState.gameOver = false;
    
    // Clear chat
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    // Add initial message
    addChatMessage(messages.initial, 'user');
    
    // Update mood display
    updateMoodDisplay();
    
    // Reset service status
    resetServiceStatus();
    
    // Enable all action buttons
    enableAllActions();
    
    // Clear feedback
    document.getElementById('feedbackSection').innerHTML = '';
}

function resetServiceStatus() {
    // Reset all to healthy first
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        const indicator = card.querySelector('.status-indicator');
        indicator.className = 'status-indicator status-healthy';
        indicator.querySelector('.status-text').textContent = 'Healthy';
    });
    
    // Set website to down
    const websiteCard = document.querySelector('[data-service="website"]');
    const websiteIndicator = websiteCard.querySelector('.status-indicator');
    websiteIndicator.className = 'status-indicator status-down';
    websiteIndicator.querySelector('.status-text').textContent = 'Down';
    
    // Set degraded services based on scenario
    currentScenario.degradedServices.forEach(service => {
        const card = document.querySelector(`[data-service="${service}"]`);
        const indicator = card.querySelector('.status-indicator');
        indicator.className = 'status-indicator status-degraded';
        
        if (service === 'loadbalancer') {
            indicator.querySelector('.status-text').textContent = 'High Load';
        } else {
            indicator.querySelector('.status-text').textContent = 'Degraded';
        }
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', handleAction);
    });
    
    // Play again button
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        document.getElementById('winOverlay').classList.remove('show');
        initializeGame();
    });
    
    // Theme toggle button
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

// ===== ACTION HANDLING =====
function handleAction(event) {
    if (gameState.gameOver) return;
    
    const button = event.currentTarget;
    const action = button.dataset.action;
    const isCorrect = button.classList.contains('action-correct');
    
    // Disable button
    button.disabled = true;
    
    if (isCorrect && gameState.requiredActions.includes(action)) {
        handleCorrectAction(action);
    } else {
        handleWrongAction(action);
    }
}

function handleCorrectAction(action) {
    gameState.actionsCompleted.push(action);
    
    // Player action messages (short, clear)
    const playerMessages = {
        'restart-vm': 'Restarting virtual machine...',
        'scale-server': 'Scaling server capacity...',
        'balance-traffic': 'Balancing traffic across servers...',
        'replace-hardware': 'Replacing failing hardware...',
        'apply-patch': 'Applying OS patch...'
    };
    
    // User response messages (shows impact)
    const userResponses = {
        'restart-vm': 'Okay, I can see some improvement... 🤔',
        'scale-server': 'It\'s getting faster! Keep going! 😊',
        'balance-traffic': 'Much better now! 😌',
        'replace-hardware': 'That helped! Thanks! 😊',
        'apply-patch': 'Looking better! 😌'
    };
    
    // Show feedback in UI
    const feedbacks = {
        'restart-vm': '✅ Virtual machine restarted. Service stability improving.',
        'scale-server': '✅ Server capacity increased. Performance improving.',
        'balance-traffic': '✅ Traffic balanced across servers. Load normalized.',
        'replace-hardware': '✅ Hardware replaced successfully. System operational.',
        'apply-patch': '✅ OS patch applied. Security and stability improved.'
    };
    
    showFeedback(feedbacks[action], 'correct');
    
    // Send player message first
    addChatMessage(playerMessages[action], 'player');
    
    // Update service status
    updateServiceStatus(action);
    
    // User responds after seeing the fix
    setTimeout(() => {
        addChatMessage(userResponses[action], 'user');
    }, 800);
    
    // Check win condition
    const allCompleted = gameState.requiredActions.every(req => 
        gameState.actionsCompleted.includes(req)
    );
    
    if (allCompleted) {
        setTimeout(() => {
            addChatMessage('Let me check if it\'s working now... 🤞', 'user');
            setTimeout(() => {
                winGame();
            }, 2000);
        }, 2000);
    }
}

function handleWrongAction(action) {
    gameState.wrongAttempts++;
    gameState.mood = Math.max(0, gameState.mood - 1);
    
    // Player wrong action messages
    const playerMessages = {
        'check-app-code': 'Checking application code...',
        'security-scan': 'Running security scan...',
        'firewall-rules': 'Adjusting firewall rules...'
    };
    
    // User frustrated responses
    const userFrustratedResponses = [
        'That didn\'t help... Can you try something else? 😠',
        'Still not working! This is urgent! 😡',
        'I\'m running out of time here! 😤'
    ];
    
    // Show feedback
    const feedbacks = {
        'check-app-code': '❌ This is handled by the Application Development team. Time wasted...',
        'security-scan': '❌ This is handled by the Security team. Time wasted...',
        'firewall-rules': '❌ This is handled by the Network team. Time wasted...'
    };
    
    const defaultFeedback = '❌ This is handled by another team. Time wasted...';
    showFeedback(feedbacks[action] || defaultFeedback, 'wrong');
    
    // Send player message
    const defaultPlayerMsg = 'Working on it...';
    addChatMessage(playerMessages[action] || defaultPlayerMsg, 'player');
    
    // Update mood
    updateMoodDisplay();
    
    // User responds with frustration
    setTimeout(() => {
        const responseIndex = Math.min(gameState.wrongAttempts - 1, userFrustratedResponses.length - 1);
        addChatMessage(userFrustratedResponses[responseIndex], 'user');
    }, 800);
}

// ===== SERVICE STATUS UPDATES =====
function updateServiceStatus(action) {
    const updates = {
        'restart-vm': { service: 'vm', status: 'healthy' },
        'scale-server': { service: 'vm', status: 'healthy' },
        'balance-traffic': { service: 'loadbalancer', status: 'healthy' },
        'replace-hardware': { service: 'storage', status: 'healthy' },
        'apply-patch': { service: 'vm', status: 'healthy' }
    };
    
    if (updates[action]) {
        const { service, status } = updates[action];
        const card = document.querySelector(`[data-service="${service}"]`);
        const indicator = card.querySelector('.status-indicator');
        indicator.className = `status-indicator status-${status}`;
        indicator.querySelector('.status-text').textContent = 'Healthy';
    }
    
    // Check if all required services are healthy
    const allCompleted = gameState.requiredActions.every(req => 
        gameState.actionsCompleted.includes(req)
    );
    
    if (allCompleted) {
        // Update website to healthy
        setTimeout(() => {
            const websiteCard = document.querySelector('[data-service="website"]');
            const websiteIndicator = websiteCard.querySelector('.status-indicator');
            websiteIndicator.className = 'status-indicator status-healthy';
            websiteIndicator.querySelector('.status-text').textContent = 'Online';
        }, 500);
    }
}

// ===== UI UPDATES =====
function addChatMessage(text, type = 'user') {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateMoodDisplay() {
    const moodIcons = document.querySelectorAll('.mood-icon');
    const avatar = document.querySelector('.avatar');
    
    moodIcons.forEach((icon, index) => {
        if (index === gameState.mood) {
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    });
    
    // Update avatar
    const moods = ['😡', '😠', '😐', '😊'];
    avatar.textContent = moods[gameState.mood];
}

function showFeedback(message, type) {
    const feedbackSection = document.getElementById('feedbackSection');
    feedbackSection.innerHTML = `
        <div class="feedback-message ${type}">
            ${message}
        </div>
    `;
    
    // Clear after 3 seconds
    setTimeout(() => {
        feedbackSection.innerHTML = '';
    }, 3000);
}

function enableAllActions() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.disabled = false;
    });
}

// ===== WIN CONDITION =====
function winGame() {
    gameState.gameOver = true;
    
    // Player confirms service is restored
    addChatMessage('Service restored! You should be good now. ✅', 'player');
    
    // User confirms and thanks
    setTimeout(() => {
        addChatMessage(messages.success, 'user');
        
        // Update mood to maximum happiness
        gameState.mood = 3;
        updateMoodDisplay();
        
        // Show win overlay with confetti
        setTimeout(() => {
            const winOverlay = document.getElementById('winOverlay');
            winOverlay.classList.add('show');
            startConfetti();
        }, 1000);
    }, 800);
}

// ===== CONFETTI ANIMATION =====
function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const confettiCount = 150;
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    
    // Create confetti particles
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * confettiCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    let animationFrame;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((particle, index) => {
            ctx.beginPath();
            ctx.lineWidth = particle.r / 2;
            ctx.strokeStyle = particle.color;
            ctx.moveTo(particle.x + particle.tilt + particle.r / 4, particle.y);
            ctx.lineTo(particle.x + particle.tilt, particle.y + particle.tilt + particle.r / 4);
            ctx.stroke();
            
            // Update
            particle.tiltAngle += particle.tiltAngleIncremental;
            particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
            particle.x += Math.sin(particle.d);
            particle.tilt = Math.sin(particle.tiltAngle - index / 3) * 15;
            
            // Reset if out of bounds
            if (particle.y > canvas.height) {
                confetti[index] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    r: particle.r,
                    d: particle.d,
                    color: particle.color,
                    tilt: particle.tilt,
                    tiltAngleIncremental: particle.tiltAngleIncremental,
                    tiltAngle: particle.tiltAngle
                };
            }
        });
        
        animationFrame = requestAnimationFrame(draw);
    }
    
    draw();
    
    // Stop confetti after 10 seconds
    setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 10000);
}

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
}

// ===== KEYBOARD SHORTCUTS (for demo/testing) =====
document.addEventListener('keydown', (e) => {
    // Press 'R' to restart game
    if (e.key.toLowerCase() === 'r' && e.ctrlKey) {
        e.preventDefault();
        document.getElementById('winOverlay').classList.remove('show');
        initializeGame();
    }
    
    // Press 'D' to toggle dark mode
    if (e.key.toLowerCase() === 'd' && e.ctrlKey) {
        e.preventDefault();
        toggleTheme();
    }
});
