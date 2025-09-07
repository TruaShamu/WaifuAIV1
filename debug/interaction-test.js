/**
 * Test Interaction System
 * Quick test to verify timed interactions work correctly
 */

// Test function to verify interaction functionality
function testInteractionSystem() {
    console.log('Testing Interaction System...');
    
    // Wait for InteractionManager to be available
    setTimeout(() => {
        // Check if waifu app is loaded
        if (!window.app || !window.app.interactionManager) {
            console.log('Waiting for app to load...');
            setTimeout(testInteractionSystem, 1000);
            return;
        }
        
        const interactionManager = window.app.interactionManager;
        
        // Log current config
        console.log('Interaction Config:', {
            interval: interactionManager.config.interactionInterval / 1000 + 's',
            reward: interactionManager.config.interactionReward,
            duration: interactionManager.config.indicatorDuration / 1000 + 's'
        });
        
        // Test force interaction (for demo)
        console.log('Testing forced interaction in 3 seconds...');
        setTimeout(() => {
            console.log('Forcing interaction opportunity...');
            interactionManager.forceInteraction();
        }, 3000);
        
        // Check stats periodically
        setInterval(() => {
            const stats = interactionManager.getStats();
            console.log('Interaction Stats:', stats);
        }, 10000);
        
        console.log('Interaction system test started!');
        
    }, 1000);
}

// Global access for testing
window.testInteractionSystem = testInteractionSystem;

// Run test when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testInteractionSystem, 3000);
});

console.log('Interaction test script loaded');
