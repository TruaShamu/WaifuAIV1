/**
 * Quick Test: Tab Spy Settings Integration
 * Run this in browser console to verify settings are working
 */

// Test function to verify tab spy settings integration
window.testTabSpySettings = function() {
  console.log('🧪 Testing Tab Spy Settings Integration...');
  
  // Check if tab spy elements exist in settings
  const expectedElements = [
    'tab-spy-enabled',
    'context-aware-quotes', 
    'productivity-tracking'
  ];
  
  let allFound = true;
  expectedElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`✅ Found element: ${id} (checked: ${element.checked})`);
    } else {
      console.log(`❌ Missing element: ${id}`);
      allFound = false;
    }
  });
  
  // Check if Privacy section exists
  const privacySection = document.querySelector('h3:contains("🕵️ Privacy & Context")');
  if (privacySection) {
    console.log('✅ Privacy section found in settings');
  } else {
    console.log('❌ Privacy section not found - checking alternative selectors');
    
    // Alternative check
    const h3Elements = Array.from(document.querySelectorAll('h3'));
    const privacyH3 = h3Elements.find(h3 => h3.textContent.includes('Privacy'));
    if (privacyH3) {
      console.log('✅ Privacy section found with alternative method');
    } else {
      console.log('❌ Privacy section completely missing');
    }
  }
  
  // Check if ContextAwareQuoteManager is loaded
  if (typeof window.app !== 'undefined' && window.app.contextAwareQuotes) {
    console.log('✅ ContextAwareQuoteManager is available');
    
    // Test getting current context
    try {
      const report = window.app.contextAwareQuotes.getActivityReport();
      console.log('📊 Activity Report:', report);
    } catch (error) {
      console.log('⚠️ Could not get activity report:', error.message);
    }
  } else {
    console.log('❌ ContextAwareQuoteManager not available on window.app');
  }
  
  if (allFound) {
    console.log('🎉 All tab spy settings elements found!');
  } else {
    console.log('⚠️ Some elements missing - settings may not be fully integrated');
  }
  
  return allFound;
};

// Auto-run test if extension context is available
if (typeof chrome !== 'undefined') {
  setTimeout(() => {
    console.log('🚀 Auto-running tab spy settings test in 2 seconds...');
    window.testTabSpySettings();
  }, 2000);
}
