/**
 * Notepad Core
 * Handles notepad state, storage, and business logic
 */

export class NotepadCore {
    constructor(storageProvider, logger) {
        this.storageProvider = storageProvider;
        this.logger = logger;
        
        // State
        this.notes = '';
        this.isInitialized = false;
        
        // Auto-save timer
        this.autoSaveTimer = null;
        this.autoSaveDelay = 2000; // 2 seconds delay
        
        // Storage key
        this.storageKey = 'notepadContent';
        
        // Callbacks
        this.onNotesChanged = null;
    }

    /**
     * Initialize the notepad core
     */
    async initialize() {
        if (this.isInitialized) return;
        
        await this.load();
        this.isInitialized = true;
        this.logger.log('NotepadCore initialized');
    }

    /**
     * Set notes content
     */
    setNotes(content) {
        this.notes = content;
        this.scheduleAutoSave();
        
        if (this.onNotesChanged) {
            this.onNotesChanged(this.notes);
        }
    }

    /**
     * Get current notes content
     */
    getNotes() {
        return this.notes;
    }

    /**
     * Get notes statistics
     */
    getStats() {
        const text = this.notes;
        return {
            characters: text.length,
            words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
            lines: text.split('\n').length,
            paragraphs: text.split('\n\n').filter(p => p.trim()).length
        };
    }

    /**
     * Clear all notes
     */
    clearNotes() {
        this.setNotes('');
        this.save();
        this.logger.log('Notes cleared');
    }

    /**
     * Insert text at a specific position
     */
    insertText(text, position = null) {
        if (position === null) {
            // Append to end
            this.setNotes(this.notes + text);
        } else {
            // Insert at position
            const newContent = this.notes.substring(0, position) + 
                              text + 
                              this.notes.substring(position);
            this.setNotes(newContent);
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
            this.logger.log(`Loaded ${this.notes.length} characters of notes`);
            return this.notes;
        } catch (error) {
            this.logger.error('Failed to load notes:', error);
            this.notes = '';
            return '';
        }
    }

    /**
     * Save notes to storage
     */
    async save() {
        try {
            await this.storageProvider.save(this.storageKey, this.notes);
            this.logger.log(`Saved ${this.notes.length} characters of notes`);
            return true;
        } catch (error) {
            this.logger.error('Failed to save notes:', error);
            return false;
        }
    }

    /**
     * Set change callback
     */
    setChangeCallback(callback) {
        this.onNotesChanged = callback;
    }

    /**
     * Cleanup method
     */
    cleanup() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.isInitialized = false;
        this.logger.log('NotepadCore cleaned up');
    }
}
