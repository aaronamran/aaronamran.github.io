/**
 * Red Cat - Landing Page Module
 * 
 * Handles the landing page overlay that allows users to:
 * - Start default practice (continuous from section 1)
 * - Select specific chapters to practice
 */

const LandingPage = {
    elements: {
        overlay: null,
        defaultPracticeBtn: null,
        selectChapterBtn: null,
        freeTerminalBtn: null,
        practiceMode: null,
        chapterSelection: null,
        chapterGrid: null,
        backBtn: null
    },

    /**
     * Initialize landing page
     */
    init() {
        console.log('🎯 Initializing Landing Page...');
        
        // Get DOM elements
        this.elements.overlay = document.getElementById('landing-overlay');
        this.elements.defaultPracticeBtn = document.getElementById('default-practice-btn');
        this.elements.selectChapterBtn = document.getElementById('select-chapter-btn');
        this.elements.freeTerminalBtn = document.getElementById('free-terminal-btn');
        this.elements.practiceMode = document.querySelector('.practice-mode-section');
        this.elements.chapterSelection = document.getElementById('chapter-selection');
        this.elements.chapterGrid = document.getElementById('chapter-grid');
        this.elements.backBtn = document.getElementById('back-to-mode');

        // Always show landing page on initial load
        this.show();

        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Landing Page initialized');
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Default practice button
        this.elements.defaultPracticeBtn.addEventListener('click', () => {
            this.startDefaultPractice();
        });

        // Select chapter button
        this.elements.selectChapterBtn.addEventListener('click', () => {
            this.showChapterSelection();
        });

        // Free terminal button
        this.elements.freeTerminalBtn.addEventListener('click', () => {
            this.openFreeTerminal();
        });

        // Back to mode selection
        this.elements.backBtn.addEventListener('click', () => {
            this.showModeSelection();
        });
    },

    /**
     * Show landing overlay
     */
    show() {
        if (this.elements.overlay) {
            this.elements.overlay.classList.remove('hidden');
        }
    },

    /**
     * Hide landing overlay
     */
    hide() {
        if (this.elements.overlay) {
            this.elements.overlay.classList.add('hidden');
        }
    },

    /**
     * Start default practice (Section 1, sequential)
     */
    startDefaultPractice() {
        console.log('🚀 Starting Default Practice from Section 1');
        
        // Initialize app state with section 1
        appState.currentSectionId = 1;
        appState.practiceMode = 'default';
        
        // Save initial state
        saveProgress();
        
        // Hide landing and start app
        this.hide();
        
        // Initialize the main app
        if (typeof initApp === 'function') {
            initApp();
        }
    },

    /**
     * Open free terminal (redirect to Red-Cat)
     */
    openFreeTerminal() {
        console.log('🖥️ Opening Free Terminal');
        
        // Redirect to terminal
        window.location.href = 'terminal/terminal.html';
    },

    /**
     * Show chapter selection view
     */
    showChapterSelection() {
        // Hide mode selection
        this.elements.practiceMode.style.display = 'none';
        
        // Show chapter selection
        this.elements.chapterSelection.style.display = 'block';
        
        // Generate chapter cards
        this.generateChapterCards();
    },

    /**
     * Show mode selection view
     */
    showModeSelection() {
        // Show mode selection
        this.elements.practiceMode.style.display = 'block';
        
        // Hide chapter selection
        this.elements.chapterSelection.style.display = 'none';
    },

    /**
     * Generate chapter cards from sections data
     */
    generateChapterCards() {
        // Clear existing cards
        this.elements.chapterGrid.innerHTML = '';

        // Get all sections from data.js
        if (typeof sections === 'undefined') {
            console.error('❌ Sections data not loaded');
            return;
        }

        // Create a card for each section
        sections.forEach(section => {
            const card = this.createChapterCard(section);
            this.elements.chapterGrid.appendChild(card);
        });
    },

    /**
     * Create a single chapter card
     */
    createChapterCard(section) {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.dataset.sectionId = section.id;

        // Calculate task count from first question set (all sets have same count)
        const taskCount = section.questionSets && section.questionSets.set1 ? section.questionSets.set1.length : 0;

        card.innerHTML = `
            <div class="chapter-number">Section ${section.id}</div>
            <div class="chapter-title">${section.title}</div>
            <div class="chapter-description">${section.description}</div>
            <div class="chapter-stats">
                <div class="chapter-stat">
                    <strong>${taskCount}</strong> Tasks
                </div>
                <div class="chapter-stat">
                    <strong>${section.totalPoints || 0}</strong> Points
                </div>
            </div>
        `;

        // Add click event to start from this section
        card.addEventListener('click', () => {
            this.startFromSection(section.id);
        });

        return card;
    },

    /**
     * Start practice from selected section
     */
    startFromSection(sectionId) {
        console.log(`🚀 Starting practice from Section ${sectionId}`);
        
        // Initialize app state with selected section
        appState.currentSectionId = sectionId;
        appState.practiceMode = 'custom';
        
        // Save initial state
        saveProgress();
        
        // Hide landing and start app
        this.hide();
        
        // Initialize the main app
        if (typeof initApp === 'function') {
            initApp();
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        LandingPage.init();
    });
} else {
    LandingPage.init();
}
