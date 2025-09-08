/**
 * 🕵️ Tab Spy Service
 * Monitors user's current tab to provide contextual waifu reactions
 * Respects privacy - only tracks site categories, not specific content
 */

export class TabSpyService {
  constructor(logger) {
    this.logger = logger;
    this.currentTab = null;
    this.lastActivity = null;
    this.observers = [];
    this.isEnabled = true;
    
    // Site categorization for context-aware reactions
    // Will be loaded from external JSON file
    this.siteCategories = {};
    this.siteCategoriesLoaded = false;
    
    // Dialogue collection for contextual quotes
    this.dialogueCollection = {};
    this.dialogueLoaded = false;
  }

  /**
   * Load dialogue collection from JSON file
   */
  async loadDialogueCollection() {
    try {
      const response = await fetch(chrome.runtime.getURL('waifu_dialogue_collection.json'));
      if (!response.ok) {
        throw new Error(`Failed to load dialogue collection: ${response.status}`);
      }
      
      this.dialogueCollection = await response.json();
      this.dialogueLoaded = true;
      this.logger.log('🕵️ Dialogue collection loaded from file');
    } catch (error) {
      this.logger.error(`Failed to load dialogue collection: ${error.message}`);
      this.dialogueLoaded = false;
      this.dialogueCollection = {};
    }
  }

  /**
   * Load site categories from JSON file
   */
  async loadSiteCategories() {
    try {
      const response = await fetch(chrome.runtime.getURL('site-categories.json'));
      if (!response.ok) {
        throw new Error(`Failed to load site categories: ${response.status}`);
      }
      
      this.siteCategories = await response.json();
      this.siteCategoriesLoaded = true;
      this.logger.log('🕵️ Site categories loaded from configuration file');
    } catch (error) {
      this.logger.error(`Failed to load site categories: ${error.message}`);
      // Fallback to default categories
      this.siteCategories = this.getDefaultCategories();
      this.siteCategoriesLoaded = true;
      this.logger.warn('🕵️ Using default site categories as fallback');
    }
  }

  /**
   * Get default site categories as fallback
   */
  getDefaultCategories() {
    return {
      productivity: ['github.com', 'stackoverflow.com', 'codepen.io'],
      learning: ['freecodecamp.org', 'mdn.mozilla.org', 'youtube.com/watch'],
      social: ['facebook.com', 'twitter.com', 'reddit.com'],
      entertainment: ['netflix.com', 'youtube.com', 'spotify.com'],
      shopping: ['amazon.com', 'ebay.com'],
      news: ['cnn.com', 'bbc.com', 'reuters.com']
    };
  }

  /**
   * Initialize tab monitoring
   */
  async initialize() {
    if (!this.hasPermissions()) {
      this.logger.warn('Tab permissions not available - tab spy disabled');
      this.isEnabled = false;
      return;
    }

    try {
      // Load site categories and dialogue collection
      await Promise.all([
        this.loadSiteCategories(),
        this.loadDialogueCollection()
      ]);

      // Listen for tab changes
      chrome.tabs.onActivated.addListener((activeInfo) => {
        this.handleTabChange(activeInfo.tabId);
      });

      // Listen for tab updates (URL changes)
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url) {
          this.handleTabUpdate(tab);
        }
      });

      // Get current tab initially
      await this.getCurrentTab();
      
      this.logger.log('🕵️ Tab spy service initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize tab spy: ${error.message}`);
      this.isEnabled = false;
    }
  }

  /**
   * Check if we have necessary permissions
   */
  hasPermissions() {
    return typeof chrome !== 'undefined' && 
           chrome.tabs && 
           chrome.tabs.query;
  }

  /**
   * Get current active tab
   */
  async getCurrentTab() {
    if (!this.isEnabled) return null;

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await this.handleTabUpdate(tabs[0]);
        return tabs[0];
      }
    } catch (error) {
      this.logger.error(`Failed to get current tab: ${error.message}`);
    }
    return null;
  }

  /**
   * Handle tab change
   */
  async handleTabChange(tabId) {
    if (!this.isEnabled) return;

    try {
      const tab = await chrome.tabs.get(tabId);
      await this.handleTabUpdate(tab);
    } catch (error) {
      this.logger.error(`Failed to handle tab change: ${error.message}`);
    }
  }

  /**
   * Handle tab update with new URL or status
   */
  async handleTabUpdate(tab) {
    if (!this.isEnabled || !tab.url) return;

    const previousTab = this.currentTab;
    this.currentTab = {
      id: tab.id,
      url: tab.url,
      title: tab.title,
      category: this.categorizeUrl(tab.url),
      timestamp: Date.now()
    };

    // Track activity change
    this.lastActivity = {
      type: 'tab_change',
      from: previousTab?.category || 'unknown',
      to: this.currentTab.category,
      timestamp: Date.now()
    };

    // Notify observers
    this.notifyObservers('tab_changed', {
      current: this.currentTab,
      previous: previousTab,
      activity: this.lastActivity
    });

    this.logger.log(`🕵️ Tab spy: ${this.currentTab.category} site detected`);
  }

  /**
   * Categorize URL based on domain
   */
  categorizeUrl(url) {
    // Wait for categories to be loaded
    if (!this.siteCategoriesLoaded) {
      return 'unknown';
    }

    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Remove www. prefix
      const cleanDomain = domain.replace(/^www\./, '');
      
      for (const [category, domains] of Object.entries(this.siteCategories)) {
        if (domains.some(d => cleanDomain.includes(d) || d.includes(cleanDomain))) {
          return category;
        }
      }
      
      return 'other';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get contextual data for waifu reactions
   */
  getContext() {
    if (!this.currentTab) return null;

    return {
      category: this.currentTab.category,
      isProductive: ['productivity', 'learning'].includes(this.currentTab.category),
      isDistraction: ['social', 'entertainment'].includes(this.currentTab.category),
      timeOnSite: Date.now() - this.currentTab.timestamp,
      lastActivity: this.lastActivity
    };
  }

  /**
   * Get contextual quotes based on current activity
   */
  getContextualQuotes() {
    const context = this.getContext();
    if (!context || !this.dialogueLoaded) return [];

    // Map tab spy categories to dialogue collection keys
    const categoryMapping = {
      productivity: 'productivity_sites',
      learning: 'learning_sites',
      social: 'social_media',
      entertainment: 'entertainment',
      shopping: 'shopping',
      news: 'unknown_sites', // Use unknown_sites for news as fallback
      other: 'unknown_sites'
    };

    const dialogueKey = categoryMapping[context.category] || 'unknown_sites';
    const contextualQuotes = this.dialogueCollection?.contextual_quotes?.[dialogueKey];

    if (contextualQuotes && Array.isArray(contextualQuotes)) {
      return contextualQuotes;
    }

    // Fallback to unknown_sites quotes if specific category not found
    return this.dialogueCollection?.contextual_quotes?.unknown_sites || [];
  }

  /**
   * Get motivational quotes for when user is distracted too long
   */
  getMotivationalQuotes() {
    if (!this.dialogueLoaded) return [];
    return this.dialogueCollection?.motivational_quotes || [];
  }

  /**
   * Get encouragement quotes for productive behavior
   */
  getEncouragementQuotes() {
    if (!this.dialogueLoaded) return [];
    return this.dialogueCollection?.encouragement_quotes || [];
  }

  /**
   * Get gentle nudge quotes for mild redirection
   */
  getGentleNudgeQuotes() {
    if (!this.dialogueLoaded) return [];
    return this.dialogueCollection?.gentle_nudge_quotes || [];
  }

  /**
   * Add observer for tab changes
   */
  addObserver(callback) {
    this.observers.push(callback);
  }

  /**
   * Remove observer
   */
  removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  /**
   * Notify all observers
   */
  notifyObservers(event, data) {
    this.observers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        this.logger.error(`Observer error: ${error.message}`);
      }
    });
  }

  /**
   * Get productivity score based on recent activity
   */
  getProductivityScore() {
    if (!this.lastActivity) return 0.5; // Neutral

    const { category } = this.currentTab || {};
    
    const scores = {
      productivity: 1.0,
      learning: 0.9,
      news: 0.6,
      other: 0.5,
      shopping: 0.3,
      social: 0.2,
      entertainment: 0.1
    };

    return scores[category] || 0.5;
  }

  /**
   * Check if user has been on distracting sites too long
   */
  isDistractedTooLong(threshold = 10 * 60 * 1000) { // 10 minutes
    const context = this.getContext();
    return context && 
           context.isDistraction && 
           context.timeOnSite > threshold;
  }

  /**
   * Disable tab spying (privacy mode)
   */
  disable() {
    this.isEnabled = false;
    this.currentTab = null;
    this.lastActivity = null;
    this.logger.log('🕵️ Tab spy disabled');
  }

  /**
   * Enable tab spying
   */
  enable() {
    this.isEnabled = true;
    this.getCurrentTab();
    this.logger.log('🕵️ Tab spy enabled');
  }

  /**
   * Add a custom site to a category
   * @param {string} category - The category to add the site to
   * @param {string} domain - The domain to add (e.g., 'example.com')
   */
  addSiteToCategory(category, domain) {
    if (!this.siteCategories[category]) {
      this.siteCategories[category] = [];
    }
    
    if (!this.siteCategories[category].includes(domain)) {
      this.siteCategories[category].push(domain);
      this.logger.log(`🕵️ Added ${domain} to ${category} category`);
    }
  }

  /**
   * Remove a site from a category
   * @param {string} category - The category to remove the site from
   * @param {string} domain - The domain to remove
   */
  removeSiteFromCategory(category, domain) {
    if (this.siteCategories[category]) {
      const index = this.siteCategories[category].indexOf(domain);
      if (index > -1) {
        this.siteCategories[category].splice(index, 1);
        this.logger.log(`🕵️ Removed ${domain} from ${category} category`);
      }
    }
  }

  /**
   * Get all current site categories
   */
  getSiteCategories() {
    return { ...this.siteCategories };
  }

  /**
   * Update site categories with a new configuration
   * @param {Object} newCategories - New categories object
   */
  updateSiteCategories(newCategories) {
    this.siteCategories = { ...newCategories };
    this.logger.log('🕵️ Site categories updated');
  }
}
