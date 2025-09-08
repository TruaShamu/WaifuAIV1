/**
 * Notepad Manager
 * Coordinates between notepad core logic and UI
 */

import { NotepadCore } from './notepad/NotepadCore.js';
import { NotepadUIManager } from './notepad/NotepadUIManager.js';

export class NotepadManager {
    constructor(storageProvider, logger) {
        this.storageProvider = storageProvider;
        this.logger = logger;
        
        // Core and UI managers
        this.core = new NotepadCore(storageProvider, logger);
        this.uiManager = new NotepadUIManager();
        
        this.isInitialized = false;
        
        this.setupCoreCallbacks();
        this.setupUICallbacks();
    }

    /**
     * Setup callbacks from core to UI
     */
    setupCoreCallbacks() {
        this.core.setChangeCallback((notes) => {
            this.uiManager.setContent(notes);
        });
    }

    /**
     * Setup callbacks from UI to core
     */
    setupUICallbacks() {
        this.uiManager.setCallbacks({
            onTextChange: (content) => {
                this.core.setNotes(content);
            },
            onSave: async () => {
                const success = await this.core.save();
                if (success) {
                    this.uiManager.showSaveSuccess();
                } else {
                    this.uiManager.showSaveError();
                }
            },
            onClear: () => {
                this.core.clearNotes();
                this.uiManager.setContent('');
            }
        });
    }

    /**
     * Initialize the notepad manager
     */
    async initialize() {
        if (this.isInitialized) return;
        
        // Get UI elements
        const elements = {
            textarea: document.getElementById('notepad-textarea'),
            copyBtn: document.getElementById('notepad-copy-btn'),
            clearBtn: document.getElementById('notepad-clear-btn'),
            saveBtn: document.getElementById('notepad-save-btn'),
            helpBtn: document.getElementById('notepad-help-btn'),
            charCount: document.getElementById('notepad-char-count'),
            wordCount: document.getElementById('notepad-word-count')
        };
        
        if (!elements.textarea) {
            this.logger.error('Notepad textarea not found');
            return;
        }
        
        // Initialize core and UI
        await this.core.initialize();
        this.uiManager.setElements(elements);
        
        // Load initial content to UI
        const savedNotes = this.core.getNotes();
        this.uiManager.setContent(savedNotes);
        
        this.isInitialized = true;
        this.logger.log('NotepadManager initialized');
    }

    /**
     * Load notepad data (for compatibility with main app)
     */
    async load() {
        await this.core.load();
        this.logger.log('NotepadManager data loaded');
    }

    /**
     * Get current notes content
     */
    getNotes() {
        return this.core.getNotes();
    }

    /**
     * Set notes content
     */
    setNotes(content) {
        this.core.setNotes(content);
    }

    /**
     * Get notes statistics
     */
    getStats() {
        return this.core.getStats();
    }

    /**
     * Focus the textarea
     */
    focus() {
        this.uiManager.focus();
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.core.cleanup();
        this.isInitialized = false;
        this.logger.log('NotepadManager cleaned up');
    }
}
