/**
 * Test Share System
 * Quick test to verify sharing functionality works correctly
 */

// Test function to verify share functionality
function testShareSystem() {
    console.log('Testing Share System...');
    
    // Wait for ShareManager to be available
    setTimeout(() => {
        // Check if waifu app is loaded
        if (!window.app || !window.app.shareManager) {
            console.log('Waiting for app to load...');
            setTimeout(testShareSystem, 1000);
            return;
        }
        
        const shareManager = window.app.shareManager;
        
        // Test gathering stats
        console.log('Testing stat gathering...');
        const stats = shareManager.gatherStats();
        console.log('Gathered Stats:', stats);
        
        // Test text generation
        const shareText = shareManager.generateShareText(stats);
        console.log('Generated Share Text:', shareText);
        
        // Test manual modal display after 3 seconds
        setTimeout(() => {
            console.log('Testing share modal display...');
            shareManager.showShareModal();
        }, 3000);
        
        console.log('Share system test started!');
        
    }, 1000);
}

// Global access for testing
window.testShareSystem = testShareSystem;

// Add some test data for better stats
function addTestData() {
    if (!window.app) return;
    
    // Add some affection
    if (window.app.affectionManager) {
        window.app.affectionManager.increase(25);
    }
    
    // Add some test interactions
    if (window.app.interactionManager) {
        window.app.interactionManager.totalInteractions = 5;
        window.app.interactionManager.successfulInteractions = 4;
    }
    
    // Add some test notes
    if (window.app.notepadManager) {
        window.app.notepadManager.setNotes(`Test notes for sharing demo!

This is some example content to show off the notepad stats.

• Feature 1
• Feature 2  
• Feature 3

Some code:
function test() {
    return "awesome";
}`);
    }
    
    console.log('Test data added for better demo!');
}

// Run test when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addTestData();
        setTimeout(testShareSystem, 2000);
    }, 4000);
});

console.log('Share test script loaded');
