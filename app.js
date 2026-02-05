// DorkIndex - Simple client-side dorking tool
// No backend, no tracking, OPSEC-safe

class DorkIndex {
    constructor() {
        this.dorkData = null;
        this.selectedEngine = 'google';
        this.engines = {
            google: 'https://www.google.com/search?q=',
            bing: 'https://www.bing.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q=',
            yandex: 'https://yandex.com/search/?text=',
            brave: 'https://search.brave.com/search?q=',
            baidu: 'https://www.baidu.com/s?wd=',
            mojeek: 'https://www.mojeek.com/search?q='
        };
        this.init();
    }
    
    async init() {
        await this.loadDorks();
        this.setupEventListeners();
        this.renderDorks();
    }
    
    async loadDorks() {
        try {
            const response = await fetch('dorks.json');
            this.dorkData = await response.json();
        } catch (error) {
            console.error('Failed to load dorks:', error);
        }
    }
    
    setupEventListeners() {
        const input = document.getElementById('domainInput');
        input.addEventListener('input', () => this.renderDorks());
        
        // Engine tab switching
        document.querySelectorAll('.engine-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchEngine(e.currentTarget));
        });
    }
    
    switchEngine(tab) {
        // Remove active class from all tabs
        document.querySelectorAll('.engine-tab').forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Update selected engine
        this.selectedEngine = tab.dataset.engine;
        
        // Re-render dorks with new engine
        this.renderDorks();
    }
    
    getDomains() {
        const input = document.getElementById('domainInput').value.trim();
        if (!input) return ['example.com'];
        
        // Support comma-separated domains
        return input.split(',').map(d => d.trim()).filter(d => d.length > 0);
    }
    
    replaceDomain(query, domain) {
        // Replace example.com with actual domain
        return query.replace(/example\.com/g, domain);
    }
    
    renderDorks() {
        const container = document.getElementById('dorksList');
        if (!this.dorkData || !container) return;
        
        const domains = this.getDomains();
        let html = '';
        
        this.dorkData.dorks.forEach(dork => {
            html += `<div class="dork-item">`;
            html += `<h3>${dork.title}</h3>`;
            
            domains.forEach(domain => {
                // Get engine-specific query or fallback to google
                const engineQuery = dork[this.selectedEngine] || dork.google || dork.query;
                const processedQuery = this.replaceDomain(engineQuery, domain);
                const searchUrl = `${this.engines[this.selectedEngine]}${encodeURIComponent(processedQuery)}`;
                
                // Handle multi-line queries (like Code Leaks, Cloud Storage)
                if (processedQuery.includes('\n')) {
                    const queries = processedQuery.split('\n').filter(q => q.trim());
                    queries.forEach(q => {
                        const url = `${this.engines[this.selectedEngine]}${encodeURIComponent(q)}`;
                        html += `<div class="dork-query">`;
                        html += `<code>${this.escapeHtml(q)}</code>`;
                        html += `<a href="${url}" target="_blank" rel="noopener noreferrer" class="search-link">Search</a>`;
                        html += `</div>`;
                    });
                } else {
                    html += `<div class="dork-query">`;
                    html += `<code>${this.escapeHtml(processedQuery)}</code>`;
                    html += `<a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="search-link">Search</a>`;
                    html += `</div>`;
                }
            });
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DorkIndex();
    });
} else {
    new DorkIndex();
}
