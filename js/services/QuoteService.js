/**
 * Quote Service
 * Manages waifu quotes and tooltip display logic
 */

export class QuoteService {
  constructor(logger) {
    this.logger = logger;
    
    // Dialogue collection for all quotes
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
      this.logger.log('QuoteService: Dialogue collection loaded from file');
    } catch (error) {
      this.logger.error(`Failed to load dialogue collection: ${error.message}`);
      this.dialogueLoaded = false;
      this.dialogueCollection = {};
    }
  }

  /**
   * Initialize the quote service
   */
  async initialize() {
    await this.loadDialogueCollection();
  }

  getRandomQuote(mood = null) {
    if (!this.dialogueLoaded) {
      this.logger.warn('Dialogue collection not loaded yet');
      return "Working hard? I'm here cheering you on! ♡";
    }

    let quoteArray = [];
    
    if (mood && this.dialogueCollection.mood_based_quotes?.[mood]) {
      quoteArray = this.dialogueCollection.mood_based_quotes[mood];
      this.logger.log(`Getting ${mood} mood quote`);
    } else {
      quoteArray = this.dialogueCollection.general_quotes || [];
    }
    
    if (quoteArray.length === 0) {
      return "You're doing great! Keep it up! ♡";
    }
    
    const randomIndex = Math.floor(Math.random() * quoteArray.length);
    const quote = quoteArray[randomIndex];
    
    this.logger.log(`Selected quote: ${quote}`);
    return quote;
  }

  getQuoteByEvent(eventType) {
    if (!this.dialogueLoaded) {
      this.logger.warn('Dialogue collection not loaded yet');
      return this.getRandomQuote();
    }

    // Map event types to dialogue collection keys
    const eventMapping = {
      taskComplete: 'task_complete',
      waifuClick: 'waifu_click',
      newTask: 'new_task',
      waifuInteraction: 'waifu_interaction_success',
      pomodoroWorkStart: 'work_start',
      pomodoroWorkComplete: 'work_complete',
      pomodoroBreakStart: 'break_start',
      pomodoroBreakComplete: 'break_complete',
      pomodoroLongBreakStart: 'long_break_start'
    };

    // First try event_specific_quotes
    const eventKey = eventMapping[eventType];
    let quotes = this.dialogueCollection.event_specific_quotes?.[eventKey];
    
    // Then try pomodoro_quotes for pomodoro events
    if (!quotes && eventType.startsWith('pomodoro')) {
      quotes = this.dialogueCollection.pomodoro_quotes?.[eventKey];
    }
    
    // Then try interaction_quotes for interaction events
    if (!quotes && eventType.includes('waifu')) {
      const interactionKey = eventType === 'waifuClick' ? 'waifu_click_no_signal' : 'waifu_interaction_success';
      quotes = this.dialogueCollection.interaction_quotes?.[interactionKey];
    }

    if (quotes && Array.isArray(quotes) && quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    }

    // Fallback to random quote
    return this.getRandomQuote();
  }

  getAllQuotes() {
    if (!this.dialogueLoaded) {
      return [];
    }
    return this.dialogueCollection.general_quotes || [];
  }

  addCustomQuote(quote) {
    if (quote && quote.trim()) {
      // Add to general quotes if dialogue is loaded
      if (this.dialogueLoaded && this.dialogueCollection.general_quotes) {
        this.dialogueCollection.general_quotes.push(quote.trim());
        this.logger.log(`Added custom quote: ${quote}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Get quotes by category from dialogue collection
   */
  getQuotesByCategory(category) {
    if (!this.dialogueLoaded) return [];
    
    // Support for different quote categories
    const categories = {
      general: this.dialogueCollection.general_quotes,
      motivational: this.dialogueCollection.motivational_quotes,
      encouragement: this.dialogueCollection.encouragement_quotes,
      gentle_nudge: this.dialogueCollection.gentle_nudge_quotes,
      personalized: this.dialogueCollection.personalized_pattern_quotes
    };
    
    return categories[category] || [];
  }

  /**
   * Get a random quote from a specific category
   */
  getRandomQuoteFromCategory(category) {
    const quotes = this.getQuotesByCategory(category);
    if (quotes.length === 0) return this.getRandomQuote();
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }
}
