/**
 * PanelManager - Handles collapsible panel functionality
 * Provides smooth expand/collapse animations and state persistence
 */
class PanelManager {
    constructor() {
        this.panels = new Map();
        this.storageKey = 'waifu_panel_states';
        this.isInitialized = false;
    }

    /**
     * Initialize the panel manager
     */
    async init() {
        if (this.isInitialized) return;
        
        // Load saved panel states
        await this.loadPanelStates();
        
        // Set up event listeners for all panels
        this.setupPanelListeners();
        
        // Apply saved states
        this.applyPanelStates();
        
        this.isInitialized = true;
        console.log('PanelManager initialized');
    }

    /**
     * Set up event listeners for panel headers
     */
    setupPanelListeners() {
        const headers = document.querySelectorAll('.panel-header');
        
        headers.forEach(header => {
            const collapseBtn = header.querySelector('.collapse-btn');
            if (collapseBtn) {
                collapseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.togglePanel(header.closest('.collapsible-panel'));
                });
            }
            
            // Allow clicking the header itself to toggle (except on buttons)
            header.addEventListener('click', (e) => {
                if (e.target.classList.contains('collapse-btn') || 
                    e.target.closest('.collapse-btn')) {
                    return;
                }
                this.togglePanel(header.closest('.collapsible-panel'));
            });
        });
    }

    /**
     * Toggle a panel's collapsed state
     * @param {HTMLElement} panel - The panel element to toggle
     */
    togglePanel(panel) {
        if (!panel) return;
        
        const panelId = panel.id || panel.dataset.panelId;
        if (!panelId) {
            console.warn('Panel missing ID for state management');
            return;
        }
        
        const isCollapsed = panel.classList.contains('collapsed');
        
        if (isCollapsed) {
            this.expandPanel(panel);
        } else {
            this.collapsePanel(panel);
        }
        
        // Save state
        this.savePanelState(panelId, !isCollapsed);
    }

    /**
     * Expand a panel
     * @param {HTMLElement} panel - The panel to expand
     */
    expandPanel(panel) {
        const content = panel.querySelector('.panel-content');
        const collapseBtn = panel.querySelector('.collapse-btn');
        
        if (!content) return;
        
        // Remove collapsed class
        panel.classList.remove('collapsed');
        
        // Update button text
        if (collapseBtn) {
            collapseBtn.textContent = '−';
            collapseBtn.title = 'Collapse section';
        }
        
        // Get the natural height
        content.style.height = 'auto';
        const targetHeight = content.scrollHeight + 'px';
        content.style.height = '0px';
        
        // Force reflow
        content.offsetHeight;
        
        // Animate to target height
        content.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
        content.style.height = targetHeight;
        content.style.opacity = '1';
        
        // Clean up after animation
        setTimeout(() => {
            content.style.height = 'auto';
            content.style.transition = '';
        }, 300);
    }

    /**
     * Collapse a panel
     * @param {HTMLElement} panel - The panel to collapse
     */
    collapsePanel(panel) {
        const content = panel.querySelector('.panel-content');
        const collapseBtn = panel.querySelector('.collapse-btn');
        
        if (!content) return;
        
        // Set current height
        content.style.height = content.scrollHeight + 'px';
        
        // Force reflow
        content.offsetHeight;
        
        // Animate to collapsed state
        content.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
        content.style.height = '0px';
        content.style.opacity = '0';
        
        // Add collapsed class after animation starts
        setTimeout(() => {
            panel.classList.add('collapsed');
        }, 10);
        
        // Update button text
        if (collapseBtn) {
            collapseBtn.textContent = '+';
            collapseBtn.title = 'Expand section';
        }
        
        // Clean up after animation
        setTimeout(() => {
            content.style.transition = '';
        }, 300);
    }

    /**
     * Set a panel's state programmatically
     * @param {string} panelId - The panel ID
     * @param {boolean} expanded - Whether the panel should be expanded
     */
    setPanelState(panelId, expanded) {
        const panel = document.getElementById(panelId) || 
                     document.querySelector(`[data-panel-id="${panelId}"]`);
        
        if (!panel) return;
        
        if (expanded) {
            this.expandPanel(panel);
        } else {
            this.collapsePanel(panel);
        }
        
        this.savePanelState(panelId, !expanded);
    }

    /**
     * Get current panel states
     * @returns {Object} Panel states object
     */
    getPanelStates() {
        const states = {};
        const panels = document.querySelectorAll('.collapsible-panel');
        
        panels.forEach(panel => {
            const panelId = panel.id || panel.dataset.panelId;
            if (panelId) {
                states[panelId] = panel.classList.contains('collapsed');
            }
        });
        
        return states;
    }

    /**
     * Load panel states from storage
     */
    async loadPanelStates() {
        try {
            const result = await chrome.storage.local.get(this.storageKey);
            this.panels = new Map(Object.entries(result[this.storageKey] || {}));
        } catch (error) {
            console.error('Failed to load panel states:', error);
            this.panels = new Map();
        }
    }

    /**
     * Save a panel's state
     * @param {string} panelId - The panel ID
     * @param {boolean} collapsed - Whether the panel is collapsed
     */
    async savePanelState(panelId, collapsed) {
        this.panels.set(panelId, collapsed);
        
        try {
            const states = Object.fromEntries(this.panels);
            await chrome.storage.local.set({
                [this.storageKey]: states
            });
        } catch (error) {
            console.error('Failed to save panel state:', error);
        }
    }

    /**
     * Apply saved panel states to the UI
     */
    applyPanelStates() {
        this.panels.forEach((collapsed, panelId) => {
            const panel = document.getElementById(panelId) || 
                         document.querySelector(`[data-panel-id="${panelId}"]`);
            
            if (panel) {
                if (collapsed) {
                    // Apply collapsed state without animation
                    const content = panel.querySelector('.panel-content');
                    const collapseBtn = panel.querySelector('.collapse-btn');
                    
                    if (content) {
                        content.style.height = '0px';
                        content.style.opacity = '0';
                        panel.classList.add('collapsed');
                    }
                    
                    if (collapseBtn) {
                        collapseBtn.textContent = '+';
                        collapseBtn.title = 'Expand section';
                    }
                } else {
                    // Ensure expanded state
                    panel.classList.remove('collapsed');
                    const content = panel.querySelector('.panel-content');
                    const collapseBtn = panel.querySelector('.collapse-btn');
                    
                    if (content) {
                        content.style.height = 'auto';
                        content.style.opacity = '1';
                    }
                    
                    if (collapseBtn) {
                        collapseBtn.textContent = '−';
                        collapseBtn.title = 'Collapse section';
                    }
                }
            }
        });
    }

    /**
     * Expand all panels
     */
    expandAll() {
        const panels = document.querySelectorAll('.collapsible-panel');
        panels.forEach(panel => {
            if (panel.classList.contains('collapsed')) {
                this.expandPanel(panel);
            }
        });
    }

    /**
     * Collapse all panels
     */
    collapseAll() {
        const panels = document.querySelectorAll('.collapsible-panel');
        panels.forEach(panel => {
            if (!panel.classList.contains('collapsed')) {
                this.collapsePanel(panel);
            }
        });
    }

    /**
     * Reset all panels to their default state
     */
    async resetPanelStates() {
        this.panels.clear();
        
        try {
            await chrome.storage.local.remove(this.storageKey);
        } catch (error) {
            console.error('Failed to reset panel states:', error);
        }
        
        // Expand all panels by default
        this.expandAll();
    }

    /**
     * Add keyboard shortcuts for panel management
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+E: Expand all panels
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                this.expandAll();
            }
            
            // Ctrl+Shift+C: Collapse all panels
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.collapseAll();
            }
            
            // Ctrl+Shift+R: Reset panel states
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.resetPanelStates();
            }
        });
    }

/**
 * Cleanup method
 */
cleanup() {
    // Remove event listeners if needed
    this.isInitialized = false;
}
}

// Create global instance
window.PanelManager = new PanelManager();