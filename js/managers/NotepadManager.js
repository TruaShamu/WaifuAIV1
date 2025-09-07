/**
 * Notepad Manager
 * Manages the quick notes widget with clipboard functionality
 */

export class NotepadManager {
    constructor(storageProvider, logger) {
        this.storageProvider = storageProvider;
        this.logger = logger;
        
        // State
        this.notes = '';
        this.isInitialized = false;
        
        // UI elements
        this.textarea = null;
        this.copyBtn = null;
        this.clearBtn = null;
        this.saveBtn = null;
        this.helpBtn = null;
        this.charCount = null;
        this.wordCount = null;
        
        // Auto-save timer
        this.autoSaveTimer = null;
        this.autoSaveDelay = 2000; // 2 seconds delay
        
        // Storage key
        this.storageKey = 'notepadContent';
    }

    /**
     * Initialize the notepad manager
     */
    async initialize() {
        if (this.isInitialized) return;
        
        // Get UI elements
        this.textarea = document.getElementById('notepad-textarea');
        this.copyBtn = document.getElementById('notepad-copy-btn');
        this.clearBtn = document.getElementById('notepad-clear-btn');
        this.saveBtn = document.getElementById('notepad-save-btn');
        this.helpBtn = document.getElementById('notepad-help-btn');
        this.charCount = document.getElementById('notepad-char-count');
        this.wordCount = document.getElementById('notepad-word-count');
        
        if (!this.textarea) {
            this.logger.error('Notepad textarea not found');
            return;
        }
        
        // Load saved notes
        await this.load();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update stats
        this.updateStats();
        
        this.isInitialized = true;
        this.logger.log('NotepadManager initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Textarea events
        if (this.textarea) {
            this.textarea.addEventListener('input', () => {
                this.handleTextChange();
            });
            
            this.textarea.addEventListener('paste', () => {
                // Update stats after paste
                setTimeout(() => this.updateStats(), 10);
            });
            
            // Keyboard shortcuts
            this.textarea.addEventListener('keydown', (e) => {
                this.handleKeyboard(e);
            });
        }
        
        // Button events
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => {
                this.copyToClipboard();
            });
        }
        
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.clearNotes();
            });
        }
        
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.save();
            });
        }
        
        if (this.helpBtn) {
            this.helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }
    }

    /**
     * Handle text changes
     */
    handleTextChange() {
        this.notes = this.textarea.value;
        this.updateStats();
        this.scheduleAutoSave();
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Ctrl+A - Select all
        if (e.ctrlKey && e.key === 'a') {
            e.stopPropagation();
            return; // Allow default behavior
        }
        
        // Ctrl+S - Save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.save();
            return;
        }
        
        // Ctrl+C when text is selected - Copy selection
        if (e.ctrlKey && e.key === 'c' && this.textarea.selectionStart !== this.textarea.selectionEnd) {
            return; // Allow default copy behavior
        }
        
        // Ctrl+Shift+C - Copy all content
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            this.copyToClipboard();
            return;
        }
        
        // Tab key handling for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.textarea.selectionStart;
            const end = this.textarea.selectionEnd;
            
            // Insert tab character
            this.textarea.value = this.textarea.value.substring(0, start) + 
                                  '\t' + 
                                  this.textarea.value.substring(end);
            
            // Move cursor after the tab
            this.textarea.selectionStart = this.textarea.selectionEnd = start + 1;
            
            this.handleTextChange();
        }
    }

    /**
     * Update character and word count
     */
    updateStats() {
        if (!this.textarea) return;
        
        const text = this.textarea.value;
        const charCount = text.length;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        
        if (this.charCount) {
            this.charCount.textContent = `${charCount} character${charCount !== 1 ? 's' : ''}`;
        }
        
        if (this.wordCount) {
            this.wordCount.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
        }
        
        // Update button states
        this.updateButtonStates();
    }

    /**
     * Update button states based on content
     */
    updateButtonStates() {
        const hasContent = this.textarea && this.textarea.value.trim().length > 0;
        
        if (this.copyBtn) {
            this.copyBtn.disabled = !hasContent;
        }
        
        if (this.clearBtn) {
            this.clearBtn.disabled = !hasContent;
        }
    }

    /**
     * Copy content to clipboard
     */
    async copyToClipboard() {
        if (!this.textarea || this.textarea.value.trim() === '') {
            this.showMessage('Nothing to copy!', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.textarea.value);
            this.showCopySuccess();
            this.logger.log('Notes copied to clipboard');
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard();
        }
    }

    /**
     * Fallback copy method for older browsers
     */
    fallbackCopyToClipboard() {
        try {
            this.textarea.select();
            this.textarea.setSelectionRange(0, 99999); // For mobile devices
            
            const successful = document.execCommand('copy');
            if (successful) {
                this.showCopySuccess();
                this.logger.log('Notes copied to clipboard (fallback)');
            } else {
                this.showMessage('Copy failed!', 'error');
            }
        } catch (error) {
            this.logger.error('Failed to copy to clipboard:', error);
            this.showMessage('Copy not supported', 'error');
        }
    }

    /**
     * Show copy success animation
     */
    showCopySuccess() {
        if (this.copyBtn) {
            this.copyBtn.classList.add('copy-success');
            this.copyBtn.textContent = '✓ Copied!';
            
            setTimeout(() => {
                this.copyBtn.classList.remove('copy-success');
                this.copyBtn.textContent = '📋 Copy';
            }, 1000);
        }
        
        this.showMessage('Copied to clipboard!', 'success');
    }

    /**
     * Clear all notes
     */
    clearNotes() {
        if (!this.textarea) return;
        
        const hasContent = this.textarea.value.trim().length > 0;
        if (!hasContent) return;
        
        // Ask for confirmation
        if (confirm('Are you sure you want to clear all notes?')) {
            this.textarea.value = '';
            this.notes = '';
            this.updateStats();
            this.save();
            this.showMessage('Notes cleared!', 'info');
            this.logger.log('Notes cleared');
        }
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.save();
        }, this.autoSaveDelay);
    }

    /**
     * Load notes from storage
     */
    async load() {
        try {
            const savedNotes = await this.storageProvider.load(this.storageKey);
            this.notes = savedNotes || '';
            
            if (this.textarea) {
                this.textarea.value = this.notes;
            }
            
            this.logger.log(`Loaded ${this.notes.length} characters of notes`);
        } catch (error) {
            this.logger.error('Failed to load notes:', error);
            this.notes = '';
        }
    }

    /**
     * Save notes to storage
     */
    async save() {
        try {
            this.notes = this.textarea ? this.textarea.value : this.notes;
            await this.storageProvider.save(this.storageKey, this.notes);
            
            // Show save indicator
            if (this.saveBtn) {
                const originalText = this.saveBtn.textContent;
                this.saveBtn.textContent = '✓ Saved';
                this.saveBtn.style.color = '#4CAF50';
                
                setTimeout(() => {
                    this.saveBtn.textContent = originalText;
                    this.saveBtn.style.color = '';
                }, 1000);
            }
            
            this.logger.log(`Saved ${this.notes.length} characters of notes`);
        } catch (error) {
            this.logger.error('Failed to save notes:', error);
            this.showMessage('Save failed!', 'error');
        }
    }

    /**
     * Show keyboard shortcuts help
     */
    showHelp() {
        const helpContent = `
📝 Notepad Keyboard Shortcuts:

• Ctrl+S - Save notes
• Ctrl+Shift+C - Copy all content  
• Tab - Insert tab character
• Ctrl+A - Select all text
• Ctrl+C - Copy selected text

💡 Features:
• Auto-save after 2 seconds
• Character & word count
• Persistent storage
• Tab support for code/lists
        `.trim();
        
        // Create help modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            font-family: 'Consolas', monospace;
        `;
        
        const helpBox = document.createElement('div');
        helpBox.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 2px solid #ff69b4;
            border-radius: 10px;
            padding: 20px;
            max-width: 400px;
            color: white;
            position: relative;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: #ff69b4;
            font-size: 24px;
            cursor: pointer;
            width: 30px;
            height: 30px;
        `;
        
        const content = document.createElement('pre');
        content.textContent = helpContent;
        content.style.cssText = `
            white-space: pre-wrap;
            margin: 0;
            font-size: 12px;
            line-height: 1.5;
            color: #ccc;
        `;
        
        helpBox.appendChild(closeBtn);
        helpBox.appendChild(content);
        modal.appendChild(helpBox);
        document.body.appendChild(modal);
        
        // Close handlers
        const closeModal = () => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Close on Escape key
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }

    /**
     * Show a temporary message
     */
    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `notepad-message notepad-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : 
                         type === 'error' ? '#f44336' : 
                         type === 'warning' ? '#ff9800' : '#2196F3'};
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get current notes content
     */
    getNotes() {
        return this.textarea ? this.textarea.value : this.notes;
    }

    /**
     * Set notes content
     */
    setNotes(content) {
        this.notes = content;
        if (this.textarea) {
            this.textarea.value = content;
            this.updateStats();
        }
    }

    /**
     * Get notes statistics
     */
    getStats() {
        const text = this.getNotes();
        return {
            characters: text.length,
            words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
            lines: text.split('\n').length,
            paragraphs: text.split('\n\n').filter(p => p.trim()).length
        };
    }

    /**
     * Insert text at cursor position
     */
    insertText(text) {
        if (!this.textarea) return;
        
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        
        this.textarea.value = this.textarea.value.substring(0, start) + 
                              text + 
                              this.textarea.value.substring(end);
        
        // Move cursor after inserted text
        this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
        
        this.handleTextChange();
        this.textarea.focus();
    }

    /**
     * Focus the textarea
     */
    focus() {
        if (this.textarea) {
            this.textarea.focus();
        }
    }

    /**
     * Cleanup method
     */
    cleanup() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.isInitialized = false;
        this.logger.log('NotepadManager cleaned up');
    }
}
