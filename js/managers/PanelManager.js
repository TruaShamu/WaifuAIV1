/**
 * PanelManager - Handles collapsible panel functionality
 * Provides smooth expand/collapse animations and state persistence
 */
class PanelManager {
    constructor() {
        this.panels = new Map();
        this.storageKey = 'waifu_panel_states';
        this.isInitialized = false;
        this.animatingPanels = new Set(); // Track panels currently animating
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
        
        // Set up mutation observer to detect content changes
        this.setupContentObserver();
        
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
        
        // Prevent rapid clicking during animation
        if (this.animatingPanels.has(panelId)) {
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
        
        const panelId = panel.id || panel.dataset.panelId;
        if (panelId) {
            this.animatingPanels.add(panelId);
        }
        
        // Clear any ongoing transitions
        content.style.transition = '';
        
        // Remove collapsed class immediately
        panel.classList.remove('collapsed');
        
        // Update button text
        if (collapseBtn) {
            collapseBtn.textContent = '−';
            collapseBtn.title = 'Collapse section';
        }
        
        // Force layout recalculation to get accurate height
        document.body.offsetHeight; // Force reflow of entire document
        
        // Get the natural height by temporarily showing content with proper visibility
        content.style.height = 'auto';
        content.style.opacity = '1';
        content.style.visibility = 'visible';
        
        // Force reflow to ensure accurate measurement
        document.body.offsetHeight;
        let targetHeight = content.scrollHeight;
        
        // Double-check with getBoundingClientRect if scrollHeight seems wrong
        if (targetHeight <= 0) {
            const rect = content.getBoundingClientRect();
            targetHeight = rect.height;
        }
        
        // Ensure we have a valid target height
        if (targetHeight <= 0) {
            targetHeight = 200; // Reasonable fallback
        }
        
        // Start from collapsed state
        content.style.height = '0px';
        content.style.opacity = '0';
        
        // Force reflow
        content.offsetHeight;
        
        // Set up and start animation
        content.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
        content.style.height = targetHeight + 'px';
        content.style.opacity = '1';
        
        // Clean up after animation completes
        setTimeout(() => {
            content.style.height = 'auto';
            content.style.transition = '';
            content.style.visibility = '';
            if (panelId) {
                this.animatingPanels.delete(panelId);
            }
        }, 320); // Slightly longer than animation to ensure completion
    }

    /**
     * Collapse a panel
     * @param {HTMLElement} panel - The panel to collapse
     */
    collapsePanel(panel) {
        const content = panel.querySelector('.panel-content');
        const collapseBtn = panel.querySelector('.collapse-btn');
        
        if (!content) return;
        
        const panelId = panel.id || panel.dataset.panelId;
        if (panelId) {
            this.animatingPanels.add(panelId);
        }
        
        // Clear any ongoing transitions
        content.style.transition = '';
        
        // Force layout recalculation to get accurate height
        // This ensures we measure the height after any sibling panel state changes
        document.body.offsetHeight; // Force reflow of entire document
        
        // Get current height with multiple fallbacks for accuracy
        let currentHeight = content.scrollHeight;
        
        // Debug logging for edge cases
        console.log(`Collapsing ${panelId}: initial scrollHeight = ${currentHeight}`);
        
        // If scrollHeight seems wrong, try getBoundingClientRect
        if (currentHeight <= 0) {
            const rect = content.getBoundingClientRect();
            currentHeight = rect.height;
            console.log(`${panelId}: Using getBoundingClientRect height = ${currentHeight}`);
        }
        
        // Final fallback: force content to be visible and measure
        if (currentHeight <= 0) {
            const originalDisplay = content.style.display;
            const originalHeight = content.style.height;
            const originalOpacity = content.style.opacity;
            const originalVisibility = content.style.visibility;
            
            content.style.display = 'block';
            content.style.height = 'auto';
            content.style.opacity = '1';
            content.style.visibility = 'hidden'; // Hidden but still takes space
            
            // Force reflow
            document.body.offsetHeight;
            currentHeight = content.scrollHeight;
            console.log(`${panelId}: Fallback measurement height = ${currentHeight}`);
            
            // Restore original state
            content.style.display = originalDisplay;
            content.style.height = originalHeight;
            content.style.opacity = originalOpacity;
            content.style.visibility = originalVisibility;
        }
        
        // Ensure we have a valid height
        if (currentHeight <= 0) {
            currentHeight = 200; // Reasonable fallback
            console.log(`${panelId}: Using fallback height = ${currentHeight}`);
        }
        
        // Set explicit height and ensure it's set
        content.style.height = currentHeight + 'px';
        content.style.opacity = '1';
        
        // Force reflow
        content.offsetHeight;
        
        // Set up and start animation
        content.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
        content.style.height = '0px';
        content.style.opacity = '0';
        
        // Update button text immediately
        if (collapseBtn) {
            collapseBtn.textContent = '+';
            collapseBtn.title = 'Expand section';
        }
        
        // Add collapsed class immediately (no delay)
        panel.classList.add('collapsed');
        
        // Clean up after animation completes
        setTimeout(() => {
            content.style.transition = '';
            // Ensure the panel stays collapsed
            content.style.height = '0px';
            content.style.opacity = '0';
            console.log(`${panelId}: Animation complete, final height = ${content.style.height}`);
            
            if (panelId) {
                this.animatingPanels.delete(panelId);
            }
        }, 320); // Slightly longer than animation to ensure completion
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
                const content = panel.querySelector('.panel-content');
                const collapseBtn = panel.querySelector('.collapse-btn');
                
                if (collapsed) {
                    // Apply collapsed state without animation
                    if (content) {
                        content.style.transition = '';
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
                    
                    if (content) {
                        content.style.transition = '';
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
        
        // Reset any panels that weren't in saved states to expanded state
        const panels = document.querySelectorAll('.collapsible-panel');
        panels.forEach(panel => {
            const panelId = panel.id || panel.dataset.panelId;
            if (panelId && !this.panels.has(panelId)) {
                const content = panel.querySelector('.panel-content');
                const collapseBtn = panel.querySelector('.collapse-btn');
                
                panel.classList.remove('collapsed');
                
                if (content) {
                    content.style.transition = '';
                    content.style.height = 'auto';
                    content.style.opacity = '1';
                }
                
                if (collapseBtn) {
                    collapseBtn.textContent = '−';
                    collapseBtn.title = 'Collapse section';
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
     * Set up mutation observer to preserve collapsed states when content changes
     */
    setupContentObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const targetPanel = mutation.target.closest('.collapsible-panel');
                    if (targetPanel && targetPanel.classList.contains('collapsed')) {
                        // Preserve collapsed state after content change
                        this.preserveCollapsedState(targetPanel);
                    }
                }
            });
        });

        // Observe all panel content areas
        const panels = document.querySelectorAll('.panel-content');
        panels.forEach(content => {
            observer.observe(content, {
                childList: true,
                subtree: true
            });
        });

        this.contentObserver = observer;
    }

    /**
     * Preserve collapsed state after content changes
     */
    preserveCollapsedState(panel) {
        if (!panel.classList.contains('collapsed')) return;
        
        const content = panel.querySelector('.panel-content');
        if (!content) return;
        
        // Force the panel to stay collapsed with explicit styles
        content.style.height = '0px';
        content.style.opacity = '0';
        content.style.overflow = 'hidden';
        
        // Also force the panel itself to not grow in flexbox
        panel.style.flexGrow = '0';
        panel.style.flexShrink = '0';
        panel.style.flexBasis = 'auto';
        panel.style.minHeight = 'auto';
        panel.style.maxHeight = 'none';
        
        console.log(`Preserved collapsed state for ${panel.id}`);
    }

    /**
     * Check and maintain all panel states - can be called after content updates
     */
    maintainPanelStates() {
        const panels = document.querySelectorAll('.collapsible-panel');
        panels.forEach(panel => {
            if (panel.classList.contains('collapsed')) {
                this.preserveCollapsedState(panel);
            }
        });
    }

    /**
     * Public method to force a panel to stay collapsed
     */
    forceCollapsed(panelId) {
        const panel = document.getElementById(panelId) || 
                     document.querySelector(`[data-panel-id="${panelId}"]`);
        
        if (panel && panel.classList.contains('collapsed')) {
            this.preserveCollapsedState(panel);
        }
    }

/**
 * Cleanup method
 */
cleanup() {
    // Remove event listeners if needed
    if (this.contentObserver) {
        this.contentObserver.disconnect();
    }
    this.isInitialized = false;
}
}

// Create global instance
window.PanelManager = new PanelManager();