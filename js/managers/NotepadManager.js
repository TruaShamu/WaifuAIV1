/**
 * Notepad Manager
 * Coordinates between notepad core logic and UI
 */

import { BaseManager } from './BaseManager.js';
import { NotepadCore } from './notepad/NotepadCore.js';
import { NotepadUIManager } from './notepad/NotepadUIManager.js';

export class NotepadManager extends BaseManager {
    constructor(dependencies) {
        super(dependencies);
        
        // Core and UI managers
        this.core = new NotepadCore(this.storageProvider, this.logger);
        this.uiManager = new NotepadUIManager();
        
        this.setupCoreCallbacks();
        this.setupUICallbacks();
    }

    /**
     * Initialization logic
     */
    async onInitialize() {
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
        
        this.logger.log('NotepadManager initialized');
    }

    /**
     * Data loading logic
     */
    async onLoad() {
        if (this.core) {
            await this.core.load();
        }
    }

    /**
     * Data saving logic  
     */
    async onSave() {
        if (this.core) {
            await this.core.save();
        }
    }

    /**
     * Cleanup logic
     */
    async onDestroy() {
        if (this.uiManager) {
            this.uiManager.cleanup();
        }
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
