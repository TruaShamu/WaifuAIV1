/**
 * Test Panel Functionality
 * Quick test to verify collapsible panels work correctly
 */

// Test function to verify panel functionality
function testPanelFunctionality() {
    console.log('Testing Panel Functionality...');
    
    // Wait for PanelManager to be available
    setTimeout(() => {
        if (!window.PanelManager) {
            console.error('PanelManager not available');
            return;
        }
        
        // Test panel states
        console.log('Current panel states:', window.PanelManager.getPanelStates());
        
        // Test expanding/collapsing
        const panels = document.querySelectorAll('.collapsible-panel');
        console.log(`Found ${panels.length} panels`);
        
        // Test collapse all
        setTimeout(() => {
            console.log('Testing collapse all...');
            window.PanelManager.collapseAll();
        }, 1000);
        
        // Test expand all
        setTimeout(() => {
            console.log('Testing expand all...');
            window.PanelManager.expandAll();
        }, 3000);
        
        // Test individual panel toggle
        setTimeout(() => {
            if (panels.length > 0) {
                console.log('Testing individual panel toggle...');
                window.PanelManager.togglePanel(panels[0]);
            }
        }, 5000);
        
    }, 500);
}

// Run test when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testPanelFunctionality, 2000);
});

console.log('Panel test script loaded');
