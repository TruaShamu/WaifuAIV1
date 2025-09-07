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
    this.siteCategories = {
      // Productivity sites
      productivity: [
        'github.com', 'gitlab.com', 'stackoverflow.com', 'codepen.io',
        'jsfiddle.net', 'repl.it', 'codesandbox.io', 'notion.so',
        'trello.com', 'asana.com', 'slack.com', 'discord.com',
        'docs.google.com', 'office.com', 'figma.com', 'canva.com'
      ],
      
      // Learning/Educational
      learning: [
        'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org',
        'freecodecamp.org', 'codecademy.com', 'pluralsight.com',
        'lynda.com', 'youtube.com/watch', 'wikipedia.org',
        'mdn.mozilla.org', 'w3schools.com'
      ],
      
      // Social Media (potentially distracting)
      social: [
        'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com',
        'reddit.com', 'linkedin.com', 'snapchat.com', 'pinterest.com',
        'tumblr.com', 'twitch.tv'
      ],
      
      // Entertainment
      entertainment: [
        'netflix.com', 'hulu.com', 'disney.com', 'amazon.com/prime',
        'youtube.com', 'spotify.com', 'apple.com/music',
        'crunchyroll.com', 'funimation.com'
      ],
      
      // Shopping
      shopping: [
        'amazon.com', 'ebay.com', 'etsy.com', 'walmart.com',
        'target.com', 'bestbuy.com', 'newegg.com'
      ],
      
      // News
      news: [
        'cnn.com', 'bbc.com', 'reuters.com', 'npr.org',
        'nytimes.com', 'washingtonpost.com', 'guardian.com'
      ]
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
    if (!context) return [];

    const quotes = {
      productivity: [
        "Kyaa~ You're being so productive! I'm proud of you! ♡",
        "Look at you coding like a pro! (◕‿◕)♡",
        "Such focus! You're amazing when you work hard~",
        "Ehehe~ GitHub again? You're such a dedicated developer!"
      ],
      
      learning: [
        "Ooh~ Learning something new? I love watching you grow! ✧",
        "So studious! You're getting smarter every day~",
        "Education is attractive, you know? (｡◕‿◕｡)",
        "Stack Overflow again? My little problem solver~"
      ],
      
      social: [
        "Taking a social break? That's okay, but don't forget our tasks~",
        "Social media can wait! We have productivity goals! (◡‿◡)",
        "Mmm... maybe just a quick scroll? Then back to work? ♪",
        "I see you there... come back to me when you're ready~"
      ],
      
      entertainment: [
        "Entertainment time? You've earned a break! But not too long~ ♡",
        "Netflix and... productivity later? (◕‿◕)",
        "Anime is good for inspiration! Just remember our tasks~",
        "Having fun? I'll be here when you're ready to work again!"
      ],
      
      shopping: [
        "Shopping again? My wallet is crying... (╥﹏╥)",
        "Ooh~ What are you buying? Anything for me? ♡",
        "Retail therapy? I understand, but our tasks are waiting~",
        "Amazon cart full again? You're so bad~ (◡‿◡)"
      ],
      
      other: [
        "Exploring the web? I'm curious what you're looking at~",
        "New site? Stay safe out there! ♡",
        "Wandering the internet? I'll keep you company~"
      ]
    };

    return quotes[context.category] || quotes.other;
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
}
