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

        // Free terminal button (commented out of index.html while the mode is hidden)
        if (this.elements.freeTerminalBtn) {
            this.elements.freeTerminalBtn.addEventListener('click', () => {
                this.openFreeTerminal();
            });
        }

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
        
        // Set practice mode in sessionStorage for practice.html to read
        sessionStorage.setItem('redcat-practice-mode', 'default');
        sessionStorage.setItem('redcat-start-section', '1');
        
        // Navigate to practice page
        window.location.href = 'practice.html';
    },

    /**
     * Open free terminal (redirect to Red-Cat)
     */
    openFreeTerminal() {
        console.log('🖥️ Opening Free Terminal');
        
        // Redirect to terminal
        window.location.href = 'terminal.html';
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

        // Compute stats across all available question sets
        let totalTaskCount = 0;
        let totalPointsSum = 0;
        let setCount = 0;
        if (section.questionSets) {
            for (let i = 1; i <= 6; i++) {
                const set = section.questionSets[`set${i}`];
                if (set) {
                    totalTaskCount += set.length;
                    totalPointsSum += set.reduce((sum, t) => sum + (t.points || 0), 0);
                    setCount++;
                }
            }
        }
        const avgTaskCount = setCount > 0 ? Math.round(totalTaskCount / setCount) : 0;
        const avgPoints = setCount > 0 ? Math.round(totalPointsSum / setCount) : 0;

        card.innerHTML = `
            <div class="chapter-number">Section ${section.id}</div>
            <div class="chapter-title">${section.title}</div>
            <div class="chapter-description">${section.description}</div>
            <div class="chapter-stats">
                <div class="chapter-stat">
                    <strong>${avgTaskCount}</strong> Tasks
                </div>
                <div class="chapter-stat">
                    <strong>${avgPoints}</strong> Points
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
        
        // Set practice mode in sessionStorage for practice.html to read
        sessionStorage.setItem('redcat-practice-mode', 'custom');
        sessionStorage.setItem('redcat-start-section', String(sectionId));
        
        // Navigate to practice page
        window.location.href = 'practice.html';
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
