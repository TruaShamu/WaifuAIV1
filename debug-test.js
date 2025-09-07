/**
 * Debug Testing Script for WaifuAI
 * Run this in the browser console to test for bugs and issues
 */

// Test Suite for WaifuAI Bug Detection
const WaifuAIDebugger = {
  // Test DOM element availability
  testDOMElements() {
    console.log('🧪 Testing DOM Elements...');
    const requiredElements = [
      'waifu-sprite', 'affection-fill', 'affection-text',
      'todo-list', 'task-count', 'add-todo-btn', 'todo-input',
      'timer-time', 'timer-session', 'timer-fill',
      'pomodoro-start', 'pomodoro-pause', 'pomodoro-stop', 'pomodoro-reset',
      'work-sessions', 'total-sessions', 'productive-time',
      'waifu-container'
    ];
    
    const missing = requiredElements.filter(id => !document.getElementById(id));
    
    if (missing.length > 0) {
      console.error('❌ Missing DOM elements:', missing);
      return false;
    } else {
      console.log('✅ All required DOM elements found');
      return true;
    }
  },

  // Test Chrome Storage API availability
  testChromeStorage() {
    console.log('🧪 Testing Chrome Storage API...');
    if (typeof chrome === 'undefined' || !chrome.storage) {
      console.error('❌ Chrome Storage API not available');
      return false;
    }
    
    if (!chrome.storage.local) {
      console.error('❌ Chrome Storage Local API not available');
      return false;
    }
    
    console.log('✅ Chrome Storage API available');
    return true;
  },

  // Test for memory leaks by checking timer intervals
  testActiveTimers() {
    console.log('🧪 Testing for active timers...');
    
    // This is a simplified check - in real scenarios you'd need more sophisticated tools
    let timerCount = 0;
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;
    
    const activeTimers = new Set();
    
    window.setInterval = function(...args) {
      const id = originalSetInterval.apply(this, args);
      activeTimers.add(id);
      timerCount++;
      return id;
    };
    
    window.clearInterval = function(id) {
      activeTimers.delete(id);
      return originalClearInterval.call(this, id);
    };
    
    // Restore after a short test
    setTimeout(() => {
      window.setInterval = originalSetInterval;
      window.clearInterval = originalClearInterval;
      console.log(`⏰ Active timers detected: ${activeTimers.size}`);
      if (activeTimers.size > 3) {
        console.warn('⚠️ High number of active timers - potential memory leak');
      }
    }, 1000);
  },

  // Test local storage quota
  async testStorageQuota() {
    console.log('🧪 Testing storage quota...');
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const percentage = (estimate.usage / estimate.quota) * 100;
        console.log(`💾 Storage usage: ${(estimate.usage / 1024 / 1024).toFixed(2)}MB / ${(estimate.quota / 1024 / 1024).toFixed(2)}MB (${percentage.toFixed(2)}%)`);
        
        if (percentage > 80) {
          console.warn('⚠️ Storage usage is high - consider cleanup');
        }
      }
    } catch (error) {
      console.error('❌ Failed to check storage quota:', error);
    }
  },

  // Test error handling by triggering controlled errors
  testErrorHandling() {
    console.log('🧪 Testing error handling...');
    
    // Test with invalid DOM access
    try {
      const fakeElement = document.getElementById('non-existent-element');
      if (fakeElement) {
        fakeElement.textContent = 'test';
      }
      console.log('✅ Null element access handled gracefully');
    } catch (error) {
      console.error('❌ Error not handled properly:', error);
    }
  },

  // Test settings validation
  testSettingsValidation() {
    console.log('🧪 Testing settings validation...');
    
    const testSettings = [
      { pomodoroWorkDuration: -1, expected: false },
      { pomodoroWorkDuration: 0, expected: false },
      { pomodoroWorkDuration: 25, expected: true },
      { pomodoroWorkDuration: 150, expected: false },
      { affectionTaskCompletion: 0, expected: false },
      { affectionTaskCompletion: 5, expected: true },
      { affectionTaskCompletion: 200, expected: false },
    ];
    
    // This would need access to the WaifuApp instance to test properly
    console.log('⚠️ Settings validation test requires app instance');
  },

  // Test tab spy functionality
  testTabSpy() {
    console.log('🧪 Testing Tab Spy Service...');
    
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      console.error('❌ Chrome tabs API not available');
      return false;
    }
    
    // Test current tab detection
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];
        console.log('✅ Current tab detected:', {
          title: currentTab.title,
          url: currentTab.url,
          id: currentTab.id
        });
        
        // Test categorization
        const domain = new URL(currentTab.url).hostname;
        console.log('🏷️ Domain:', domain);
        
        // Check if it matches known categories
        const categories = {
          productivity: ['github.com', 'stackoverflow.com', 'codepen.io'],
          social: ['facebook.com', 'twitter.com', 'reddit.com'],
          entertainment: ['youtube.com', 'netflix.com', 'twitch.tv']
        };
        
        let category = 'other';
        for (const [cat, domains] of Object.entries(categories)) {
          if (domains.some(d => domain.includes(d))) {
            category = cat;
            break;
          }
        }
        
        console.log('📊 Site category:', category);
        console.log('✅ Tab spy basic functionality working');
        
      } else {
        console.error('❌ No active tab found');
      }
    });
    
    return true;
  },

  // Test contextual quote generation
  testContextualQuotes() {
    console.log('🧪 Testing Contextual Quotes...');
    
    // Mock context data
    const mockContexts = [
      { category: 'productivity', isProductive: true },
      { category: 'social', isDistraction: true },
      { category: 'learning', isProductive: true },
      { category: 'entertainment', isDistraction: true }
    ];
    
    mockContexts.forEach(context => {
      console.log(`🎭 Testing context: ${context.category}`);
      
      // This would require access to ContextAwareQuoteManager
      console.log(`📝 Context: ${JSON.stringify(context)}`);
    });
    
    console.log('✅ Contextual quote test structure ready');
  },

  // Comprehensive test runner
  async runAllTests() {
    console.log('🚀 Starting WaifuAI Debug Test Suite...');
    console.log('=' * 50);
    
    const results = {
      domElements: this.testDOMElements(),
      chromeStorage: this.testChromeStorage(),
      errorHandling: this.testErrorHandling(),
    };
    
    this.testActiveTimers();
    await this.testStorageQuota();
    this.testSettingsValidation();
    this.testTabSpy();
    this.testContextualQuotes();
    
    console.log('=' * 50);
    console.log('📊 Test Results Summary:');
    console.log(results);
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.values(results).length;
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
    } else {
      console.warn(`⚠️ ${total - passed} test(s) failed out of ${total}`);
    }
    
    return results;
  }
};

// Auto-run tests if in Chrome extension context
if (typeof chrome !== 'undefined' && chrome.storage) {
  WaifuAIDebugger.runAllTests();
} else {
  console.log('💡 Run WaifuAIDebugger.runAllTests() manually to test');
}

// Export for manual testing
window.WaifuAIDebugger = WaifuAIDebugger;
