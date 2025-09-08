/**
 * Share UI Manager
 * Handles modal generation and user interactions for sharing
 */

export class ShareUIManager {
    constructor(logger) {
        this.logger = logger;
        this.onCloseCallback = null;
        this.onCopyCallback = null;
        this.onTwitterCallback = null;
    }

    /**
     * Set callbacks
     */
    setCallbacks(callbacks) {
        this.onCloseCallback = callbacks.onClose;
        this.onCopyCallback = callbacks.onCopy;
        this.onTwitterCallback = callbacks.onTwitter;
    }

    /**
     * Show share screen with stats (full screen like settings)
     */
    showModal(stats) {
        this.logger.log('Showing share screen');
        
        // Remove existing share screen if present
        this.removeExistingModal();
        
        // Create and append full-screen share container
        const shareContainer = this.createShareContainer(stats);
        document.body.appendChild(shareContainer);
        
        // Setup event listeners
        this.setupEventListeners(shareContainer);
        
        this.logger.log('Share screen should now be visible');
    }

    /**
     * Hide the share screen
     */
    hideModal() {
        const shareContainer = document.getElementById('waifu-share-container');
        if (shareContainer && shareContainer.parentNode) {
            shareContainer.parentNode.removeChild(shareContainer);
        }
    }

    /**
     * Remove existing share screen if present
     */
    removeExistingModal() {
        const existingContainer = document.getElementById('waifu-share-container');
        if (existingContainer) {
            existingContainer.remove();
        }
    }

    /**
     * Create share container element with stats
     */
    createShareContainer(stats) {
        const container = document.createElement('div');
        container.id = 'waifu-share-container';
        container.className = 'settings-container';
        container.innerHTML = this.generateShareHTML(stats);
        return container;
    }

    /**
     * Generate share screen HTML content (like settings layout)
     */
    generateShareHTML(stats) {
        return `
            <div class="settings-header">
                <button class="back-button" id="waifu-share-back">←</button>
                <h2>🧚‍♀️ Share Your Stats</h2>
            </div>
            
            <div class="settings-content">
                <div class="settings-section">
                    <h3>📊 Your Productivity Journey</h3>
                    <p class="info-text">Share your WaifuAI companion progress with friends!</p>
                    
                    ${this.generateStatsHTML(stats)}
                </div>
                
                <div class="settings-section">
                    <h3>📤 Share Options</h3>
                    <div class="setting-buttons">
                        <button class="action-button primary" id="waifu-copy-stats">
                            📋 Copy to Clipboard
                        </button>
                        <button class="action-button" id="waifu-twitter-share">
                            🐦 Share on Twitter
                        </button>
                    </div>
                    
                    <div class="setting-info">
                        <p class="info-text">💡 Tip: Copy the stats to share in Discord, Reddit, or any platform you like!</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate stats HTML using existing CSS classes only
     */
    generateStatsHTML(stats) {
        return `
            <div class="stats-card">
                <h3>💖 Waifu Bond</h3>
                <div class="stats-row">
                    <span class="stats-label">Affection Level:</span>
                    <span class="stats-value">${stats.waifu.affectionLevel}/${stats.waifu.affectionMax} (${stats.waifu.affectionPercentage}%)</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Current Mood:</span>
                    <span class="stats-value">${stats.waifu.currentMood}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Total Interactions:</span>
                    <span class="stats-value">${stats.waifu.totalInteractions}</span>
                </div>
            </div>

            <div class="stats-card">
                <h3>🍅 Productivity Power</h3>
                <div class="stats-row">
                    <span class="stats-label">Work Sessions:</span>
                    <span class="stats-value">${stats.productivity.pomodoro.workSessions}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Total Sessions:</span>
                    <span class="stats-value">${stats.productivity.pomodoro.totalSessions}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Productive Time:</span>
                    <span class="stats-value">${Math.round(stats.productivity.pomodoro.productiveTime)}m</span>
                </div>
            </div>

            <div class="stats-card">
                <h3>✅ Task Mastery</h3>
                <div class="stats-row">
                    <span class="stats-label">Completed Tasks:</span>
                    <span class="stats-value">${stats.productivity.tasks.completedTasks}/${stats.productivity.tasks.totalTasks}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Completion Rate:</span>
                    <span class="stats-value">${stats.productivity.tasks.completionRate}%</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Interaction Success:</span>
                    <span class="stats-value">${stats.interaction.successRate}%</span>
                </div>
            </div>

            <div class="stats-card">
                <h3>📝 Notes Activity</h3>
                <div class="stats-row">
                    <span class="stats-label">Characters Written:</span>
                    <span class="stats-value">${stats.notepad.characters.toLocaleString()}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Words:</span>
                    <span class="stats-value">${stats.notepad.words.toLocaleString()}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Status:</span>
                    <span class="stats-value">${stats.notepad.notesActive ? 'Active Writer! ✍️' : 'Getting Started 📝'}</span>
                </div>
            </div>

            <div class="stats-card">
                <h3>💬 Interactions</h3>
                <div class="stats-row">
                    <span class="stats-label">Total Chats:</span>
                    <span class="stats-value">${stats.waifu.totalInteractions}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Success Rate:</span>
                    <span class="stats-value">${stats.interaction.successRate}%</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Response Time:</span>
                    <span class="stats-value">${stats.interaction.responseTime}</span>
                </div>
            </div>

            <div class="stats-card">
                <h3>📅 Session Info</h3>
                <div class="stats-row">
                    <span class="stats-label">Day:</span>
                    <span class="stats-value">${stats.sessionInfo.dayOfWeek}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Date:</span>
                    <span class="stats-value">${stats.sessionInfo.date}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label">Time:</span>
                    <span class="stats-value">${stats.sessionInfo.time}</span>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners for share screen interactions
     */
    setupEventListeners(container) {
        // Back button
        const backBtn = container.querySelector('#waifu-share-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.handleClose());
        }

        // Copy button
        const copyBtn = container.querySelector('#waifu-copy-stats');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.handleCopy(copyBtn));
        }

        // Twitter button
        const twitterBtn = container.querySelector('#waifu-twitter-share');
        if (twitterBtn) {
            twitterBtn.addEventListener('click', () => this.handleTwitter());
        }

        // Escape key to close
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.handleClose();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    }

    /**
     * Handle close modal
     */
    handleClose() {
        this.hideModal();
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

    /**
     * Handle copy action
     */
    handleCopy(button) {
        if (this.onCopyCallback) {
            // Update button state
            const originalText = button.textContent;
            button.textContent = '📋 Copying...';
            button.disabled = true;
            
            this.onCopyCallback().then(success => {
                if (success) {
                    button.textContent = '✅ Copied!';
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                    }, 2000);
                } else {
                    button.textContent = '❌ Failed';
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                    }, 2000);
                }
            });
        }
    }

    /**
     * Handle Twitter share
     */
    handleTwitter() {
        if (this.onTwitterCallback) {
            this.onTwitterCallback();
        }
    }
}
