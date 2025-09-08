/**
 * Share Core
 * Handles data gathering and sharing logic without UI dependencies
 */

export class ShareCore {
    constructor(logger, waifuApp) {
        this.logger = logger;
        this.app = waifuApp;
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
            responseTime: 'Quick!'
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
• Interaction Success: ${stats.interaction.successRate}%

📝 Notes Activity:
• Characters: ${stats.notepad.characters.toLocaleString()}
• Words: ${stats.notepad.words.toLocaleString()}
• Status: ${stats.notepad.notesActive ? 'Active Writer! ✍️' : 'Getting Started 📝'}

📅 ${stats.sessionInfo.dayOfWeek}, ${stats.sessionInfo.date}

#WaifuAI #Productivity #StudyBuddy`;
    }

    /**
     * Generate Twitter share text
     */
    generateTwitterText(stats) {
        return `🧚‍♀️ My WaifuAI Stats: ${stats.waifu.affectionPercentage}% affection, ${stats.productivity.pomodoro.workSessions} work sessions, ${stats.productivity.tasks.completionRate}% task completion! 💪 #WaifuAI #Productivity`;
    }

    /**
     * Copy stats to clipboard
     */
    async copyToClipboard(stats) {
        const text = this.generateShareText(stats);
        
        try {
            await navigator.clipboard.writeText(text);
            this.logger.log('Stats copied to clipboard');
            return true;
        } catch (error) {
            this.logger.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Open Twitter share dialog
     */
    openTwitterShare(stats) {
        const text = this.generateTwitterText(stats);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        this.logger.log('Opened Twitter share dialog');
    }
}
