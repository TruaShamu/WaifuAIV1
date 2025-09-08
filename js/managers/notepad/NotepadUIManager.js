/**
 * Notepad UI Manager
 * Handles all UI interactions and visual feedback
 */

export class NotepadUIManager {
    constructor() {
        // UI elements
        this.textarea = null;
        this.copyBtn = null;
        this.clearBtn = null;
        this.saveBtn = null;
        this.charCount = null;
        this.wordCount = null;
        
        // Callbacks
        this.callbacks = {};
    }

    /**
     * Set UI elements
     */
    setElements(elements) {
        Object.assign(this, elements);
        this.setupEventListeners();
        this.autoResize();
    }

    /**
     * Set callback functions
     */
    setCallbacks(callbacks) {
        this.callbacks = callbacks;
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
                // Update after paste
                setTimeout(() => {
                    this.handleTextChange();
                }, 10);
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
                if (this.callbacks.onSave) {
                    this.callbacks.onSave();
                }
            });
        }
    }

    /**
     * Handle text changes
     */
    handleTextChange() {
        if (!this.textarea) return;
        
        const content = this.textarea.value;
        this.updateStats(content);
        this.autoResize();
        
        if (this.callbacks.onTextChange) {
            this.callbacks.onTextChange(content);
        }
    }

    /**
     * Auto-resize textarea based on content
     */
    autoResize() {
        if (!this.textarea) return;
        
        // Reset height to auto to get the correct scrollHeight
        this.textarea.style.height = 'auto';
        
        // Calculate the new height based on content
        const scrollHeight = this.textarea.scrollHeight;
        const minHeight = 150; // Minimum height in pixels
        const maxHeight = 500; // Maximum height in pixels
        
        // Set height to content height, but within min/max bounds
        const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
        this.textarea.style.height = newHeight + 'px';
        
        // Add scrollbar if content exceeds max height
        if (scrollHeight > maxHeight) {
            this.textarea.style.overflowY = 'scroll';
        } else {
            this.textarea.style.overflowY = 'hidden';
        }
    }

    /**
     * Update statistics display
     */
    updateStats(text) {
        const charCount = text.length;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        
        if (this.charCount) {
            this.charCount.textContent = `${charCount} character${charCount !== 1 ? 's' : ''}`;
        }
        
        if (this.wordCount) {
            this.wordCount.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
        }
        
        // Update button states
        this.updateButtonStates(text);
    }

    /**
     * Update button states based on content
     */
    updateButtonStates(text) {
        const hasContent = text && text.trim().length > 0;
        
        if (this.copyBtn) {
            this.copyBtn.disabled = !hasContent;
        }
        
        if (this.clearBtn) {
            this.clearBtn.disabled = !hasContent;
        }
    }

    /**
     * Set textarea content
     */
    setContent(content) {
        if (this.textarea) {
            this.textarea.value = content;
            this.updateStats(content);
            // Auto-resize after setting content
            setTimeout(() => this.autoResize(), 10);
        }
    }

    /**
     * Get textarea content
     */
    getContent() {
        return this.textarea ? this.textarea.value : '';
    }

    /**
     * Copy content to clipboard
     */
    async copyToClipboard() {
        if (!this.textarea || this.textarea.value.trim() === '') {
            return; // Nothing to copy, just ignore
        }
        
        try {
            await navigator.clipboard.writeText(this.textarea.value);
            this.showCopySuccess();
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
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (error) {
            // If copy fails, just ignore it
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
    }

    /**
     * Clear notes with confirmation
     */
    clearNotes() {
        if (!this.textarea) return;
        
        const hasContent = this.textarea.value.trim().length > 0;
        if (!hasContent) return;
        
        // Ask for confirmation
        if (confirm('Are you sure you want to clear all notes?')) {
            if (this.callbacks.onClear) {
                this.callbacks.onClear();
            }
        }
    }

    /**
     * Show save success indicator
     */
    showSaveSuccess() {
        if (this.saveBtn) {
            const originalText = this.saveBtn.textContent;
            this.saveBtn.textContent = '✓ Saved';
            this.saveBtn.style.color = '#4CAF50';
            
            setTimeout(() => {
                this.saveBtn.textContent = originalText;
                this.saveBtn.style.color = '';
            }, 1000);
        }
    }

    /**
     * Show save error (just ignore it)
     */
    showSaveError() {
        // Save failed, but we don't really need to bother the user
    }

    /**
     * Focus the textarea
     */
    focus() {
        if (this.textarea) {
            this.textarea.focus();
        }
    }
}
