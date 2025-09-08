import { BaseManager } from './BaseManager.js';
import { ShareCore } from './share/ShareCore.js';
import { ShareUIManager } from './share/ShareUIManager.js';

/**
 * Share Manager
 * Coordinates between ShareCore (data) and ShareUIManager (UI)
 */

export class ShareManager extends BaseManager {
    constructor(dependencies) {
        super(dependencies);
        
        this.app = dependencies.app;
        
        // Initialize core and UI managers
        this.core = new ShareCore(this.logger, this.app);
        this.ui = new ShareUIManager(this.logger);
        
        // UI elements
        this.shareBtn = null;
        
        // Setup callbacks
        this.setupCoreCallbacks();
        this.setupUICallbacks();
    }

    /**
     * Initialization logic
     */
    async onInitialize() {
        if (this.isInitialized) {
            this.logger.warn('ShareManager already initialized');
            return;
        }
        
        this.setupEventListeners();
        this.logger.log('ShareManager initialized');
    }

    /**
     * Cleanup logic
     */
    async onDestroy() {
        this.shareBtn = null;
        if (this.ui) {
            // Clean up UI if needed
        }
    }

    /**
     * Setup core callbacks
     */
    setupCoreCallbacks() {
        // Core doesn't need callbacks in this case as it's stateless
    }

    /**
     * Setup UI callbacks
     */
    setupUICallbacks() {
        this.ui.setCallbacks({
            onClose: () => this.handleModalClose(),
            onCopy: () => this.handleCopyStats(),
            onTwitter: () => this.handleTwitterShare()
        });
    }

    /**
     * Initialize the share manager
     */
    initialize() {
        // Backward compatibility method - now handled by onInitialize
        return this.onInitialize();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.shareBtn = document.getElementById('share-stats-btn');
        
        if (!this.shareBtn) {
            this.logger.error('Share button not found');
            return;
        }
        
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', () => {
                this.showShareModal();
            });
        }
    }

    /**
     * Show the share modal
     */
    showShareModal() {
        const stats = this.core.gatherStats();
        this.ui.showModal(stats);
        this.logger.log('Share modal displayed');
    }

    /**
     * Handle modal close
     */
    handleModalClose() {
        this.logger.log('Share modal closed');
    }

    /**
     * Handle copy stats to clipboard
     */
    async handleCopyStats() {
        const stats = this.core.gatherStats();
        return await this.core.copyToClipboard(stats);
    }

    /**
     * Handle Twitter share
     */
    handleTwitterShare() {
        const stats = this.core.gatherStats();
        this.core.openTwitterShare(stats);
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.ui.hideModal();
        this.isInitialized = false;
        this.logger.log('ShareManager cleaned up');
    }
}
