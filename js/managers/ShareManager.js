/**
 * Share Manager
 * Handles sharing productivity and waifu stats with friends
 */

export class ShareManager {
    constructor(logger, waifuApp) {
        this.logger = logger;
        this.app = waifuApp;
        this.isInitialized = false;
        
        // UI elements
        this.shareBtn = null;
        this.modal = null;
    }

    /**
     * Initialize the share manager
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.shareBtn = document.getElementById('share-stats-btn');
        
        if (!this.shareBtn) {
            this.logger.error('Share button not found');
            return;
        }
        
        this.setupEventListeners();
        
        this.isInitialized = true;
        this.logger.log('ShareManager initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', () => {
                this.showShareModal();
            });
        }
    }

    /**
     * Gather all stats for sharing
     */
    gatherStats() {
        const stats = {
            waifu: this.getWaifuStats(),
            productivity: this.getProductivityStats(),
            interaction: this.getInteractionStats(),
            notepad: this.getNotepadStats(),
            timestamp: new Date().toISOString(),
            sessionInfo: this.getSessionInfo()
        };
        
        return stats;
    }

    /**
     * Get waifu-related stats
     */
    getWaifuStats() {
        const affectionManager = this.app.affectionManager;
        const affection = affectionManager ? affectionManager.affection : null;
        
        let affectionLevel = 0;
        let affectionMax = 100;
        let affectionPercentage = 0;
        
        if (affection && typeof affection.level !== 'undefined') {
            affectionLevel = affection.level || 0;
            affectionMax = affection.maxLevel || 100;
            affectionPercentage = affectionMax > 0 ? Math.round((affectionLevel / affectionMax) * 100) : 0;
        } else if (affectionManager) {
            // Fallback: try to get level directly from manager
            affectionLevel = affectionManager.level || 0;
            affectionMax = 100;
            affectionPercentage = Math.round((affectionLevel / affectionMax) * 100);
        }
        
        return {
            affectionLevel: affectionLevel,
            affectionMax: affectionMax,
            affectionPercentage: affectionPercentage,
            currentMood: this.getCurrentMood(affectionLevel),
            totalInteractions: this.app.interactionManager ? 
                this.app.interactionManager.totalInteractions : 0
        };
    }

    /**
     * Get productivity stats
     */
    getProductivityStats() {
        const pomodoroManager = this.app.pomodoroManager;
        const pomodoroStats = pomodoroManager ? {
            workSessions: pomodoroManager.workSessions || 0,
            totalSessions: pomodoroManager.totalSessions || 0,
            productiveTime: pomodoroManager.productiveTime || 0
        } : { workSessions: 0, totalSessions: 0, productiveTime: 0 };
        
        const todoManager = this.app.todoManager;
        const todoStats = todoManager && todoManager.todos ? {
            totalTasks: todoManager.todos.length || 0,
            completedTasks: todoManager.todos.filter(t => t && t.completed).length || 0
        } : { totalTasks: 0, completedTasks: 0 };
        
        const completionRate = todoStats.totalTasks > 0 ? 
            Math.round((todoStats.completedTasks / todoStats.totalTasks) * 100) : 0;
        
        // Add completion rate to the tasks stats
        todoStats.completionRate = completionRate;
        
        return {
            pomodoro: pomodoroStats,
            tasks: todoStats
        };
    }

    /**
     * Get interaction stats
     */
    getInteractionStats() {
        if (!this.app.interactionManager) {
            return {
                successRate: 0,
                totalInteractions: 0,
                successfulInteractions: 0,
                responseTime: 'N/A'
            };
        }
        
        const stats = this.app.interactionManager.getStats ? 
            this.app.interactionManager.getStats() : {};
        
        const totalInteractions = stats.totalInteractions || 0;
        const successfulInteractions = stats.successfulInteractions || 0;
        const successRate = totalInteractions > 0 ? 
            Math.round((successfulInteractions / totalInteractions) * 100) : 0;
            
        return {
            successRate: successRate,
            totalInteractions: totalInteractions,
            successfulInteractions: successfulInteractions,
            responseTime: 'Quick!' // Could be calculated if we track timing
        };
    }

    /**
     * Get notepad stats
     */
    getNotepadStats() {
        if (!this.app.notepadManager) {
            return {
                characters: 0,
                words: 0,
                lines: 0,
                notesActive: false
            };
        }
        
        const stats = this.app.notepadManager.getStats();
        return {
            characters: stats.characters || 0,
            words: stats.words || 0,
            lines: stats.lines || 0,
            notesActive: stats.characters > 0
        };
    }

    /**
     * Get current mood based on affection level
     */
    getCurrentMood(affectionLevel = null) {
        let level = affectionLevel;
        
        if (level === null) {
            const affectionManager = this.app.affectionManager;
            const affection = affectionManager ? affectionManager.affection : null;
            
            if (affection && typeof affection.level !== 'undefined') {
                level = affection.level;
            } else if (affectionManager && typeof affectionManager.level !== 'undefined') {
                level = affectionManager.level;
            } else {
                level = 0;
            }
        }
        
        if (level >= 80) return 'Ecstatic! 💖';
        if (level >= 60) return 'Happy! 😊';
        if (level >= 30) return 'Content 😌';
        if (level >= 20) return 'Neutral 😐';
        return 'Needs Love 😢';
    }

    /**
     * Get session information
     */
    getSessionInfo() {
        const now = new Date();
        return {
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' })
        };
    }

    /**
     * Show the share modal
     */
    showShareModal() {
        const stats = this.gatherStats();
        
        this.modal = document.createElement('div');
        this.modal.className = 'share-modal';
        this.modal.innerHTML = this.generateModalHTML(stats);
        
        document.body.appendChild(this.modal);
        
        // Set up modal event listeners
        this.setupModalEvents();
        
        this.logger.log('Share modal displayed');
    }

    /**
     * Generate modal HTML
     */
    generateModalHTML(stats) {
        return `
            <div class="share-content">
                <button class="share-close">×</button>
                <div class="share-header">
                    <h2>📊 My Productivity Stats</h2>
                    <p>Share your waifu companion progress!</p>
                </div>
                
                <div class="stats-card">
                    <h3 style="color: #ff69b4; margin-top: 0;">🧚‍♀️ Waifu Relationship</h3>
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
                    <h3 style="color: #ff69b4; margin-top: 0;">🍅 Productivity Power</h3>
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
                    <h3 style="color: #ff69b4; margin-top: 0;">✅ Task Mastery</h3>
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
                        <span class="stats-value">${stats.interaction.successRate}</span>
                    </div>
                </div>
                
                <div class="stats-card">
                    <h3 style="color: #ff69b4; margin-top: 0;">📝 Notes Activity</h3>
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
                
                <div style="text-align: center; margin: 20px 0; color: #888; font-size: 12px;">
                    📅 ${stats.sessionInfo.dayOfWeek}, ${stats.sessionInfo.date} at ${stats.sessionInfo.time}
                </div>
                
                <div class="share-actions">
                    <button class="share-action-btn primary" id="copy-stats-btn">
                        📋 Copy to Clipboard
                    </button>
                    <button class="share-action-btn" id="save-image-btn">
                        💾 Save as Image
                    </button>
                    <button class="share-action-btn" id="tweet-stats-btn">
                        🐦 Tweet
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Set up modal event listeners
     */
    setupModalEvents() {
        if (!this.modal) return;
        
        // Close button
        const closeBtn = this.modal.querySelector('.share-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Escape key to close
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
        
        // Action buttons
        const copyBtn = this.modal.querySelector('#copy-stats-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyStatsToClipboard());
        }
        
        const saveBtn = this.modal.querySelector('#save-image-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAsImage());
        }
        
        const tweetBtn = this.modal.querySelector('#tweet-stats-btn');
        if (tweetBtn) {
            tweetBtn.addEventListener('click', () => this.shareToTwitter());
        }
    }

    /**
     * Close the modal
     */
    closeModal() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
            this.modal = null;
        }
    }

    /**
     * Copy stats as text to clipboard
     */
    async copyStatsToClipboard() {
        const stats = this.gatherStats();
        const text = this.generateShareText(stats);
        
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccessMessage('Stats copied to clipboard! 📋');
        } catch (error) {
            this.logger.error('Failed to copy to clipboard:', error);
            this.showErrorMessage('Failed to copy to clipboard');
        }
    }

    /**
     * Generate shareable text
     */
    generateShareText(stats) {
        return `🧚‍♀️ My WaifuAI Productivity Stats 📊

💖 Waifu Relationship:
• Affection: ${stats.waifu.affectionLevel}/${stats.waifu.affectionMax} (${stats.waifu.affectionPercentage}%)
• Mood: ${stats.waifu.currentMood}
• Interactions: ${stats.waifu.totalInteractions}

🍅 Productivity Power:
• Work Sessions: ${stats.productivity.pomodoro.workSessions}
• Total Sessions: ${stats.productivity.pomodoro.totalSessions}
• Productive Time: ${Math.round(stats.productivity.pomodoro.productiveTime)}m

✅ Task Mastery:
• Completed: ${stats.productivity.tasks.completedTasks}/${stats.productivity.tasks.totalTasks}
• Success Rate: ${stats.productivity.tasks.completionRate}%
• Interaction Success: ${stats.interaction.successRate}

📝 Notes Activity:
• Characters: ${stats.notepad.characters.toLocaleString()}
• Words: ${stats.notepad.words.toLocaleString()}
• Status: ${stats.notepad.notesActive ? 'Active Writer! ✍️' : 'Getting Started 📝'}

📅 ${stats.sessionInfo.dayOfWeek}, ${stats.sessionInfo.date}

#WaifuAI #Productivity #StudyBuddy`;
    }

    /**
     * Save stats as image (simplified implementation)
     */
    saveAsImage() {
        // For now, just copy the text and show a message
        this.copyStatsToClipboard();
        this.showInfoMessage('For now, stats copied as text! Image export coming soon! 🖼️');
    }

    /**
     * Share to Twitter
     */
    shareToTwitter() {
        const stats = this.gatherStats();
        const text = `🧚‍♀️ My WaifuAI Stats: ${stats.waifu.affectionPercentage}% affection, ${stats.productivity.pomodoro.workSessions} work sessions, ${stats.productivity.tasks.completionRate}% task completion! 💪 #WaifuAI #Productivity`;
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        
        this.showSuccessMessage('Opening Twitter... 🐦');
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show info message
     */
    showInfoMessage(message) {
        this.showMessage(message, 'info');
    }

    /**
     * Show temporary message
     */
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `share-message share-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : 
                         type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            z-index: 10003;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideInShare 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInShare {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageEl);
        
        // Remove after 4 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideInShare 0.3s ease-out reverse';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.closeModal();
        this.isInitialized = false;
        this.logger.log('ShareManager cleaned up');
    }
}
