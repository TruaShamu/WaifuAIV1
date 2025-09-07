/**
 * Test Notepad System
 * Quick test to verify notepad functionality works correctly
 */

// Test function to verify notepad functionality
function testNotepadSystem() {
    console.log('Testing Notepad System...');
    
    // Wait for NotepadManager to be available
    setTimeout(() => {
        // Check if waifu app is loaded
        if (!window.app || !window.app.notepadManager) {
            console.log('Waiting for app to load...');
            setTimeout(testNotepadSystem, 1000);
            return;
        }
        
        const notepadManager = window.app.notepadManager;
        
        // Test basic functionality
        console.log('Testing notepad functionality...');
        
        // Test setting notes
        const testContent = `Hello from notepad test!

This is a test note with multiple lines to test the auto-resize functionality.

• Bullet point 1
• Bullet point 2
• Bullet point 3

Some code example:
function test() {
    console.log("Testing auto-resize");
    return "success";
}

More text to make it longer...
Line 1
Line 2
Line 3
Line 4
Line 5

This should make the textarea grow automatically!`;
        
        notepadManager.setNotes(testContent);
        
        // Test getting stats
        setTimeout(() => {
            const stats = notepadManager.getStats();
            console.log('Notepad Stats:', stats);
            
            // Test inserting text
            notepadManager.insertText('\n\n--- Added by test ---');
            
            // Test focus
            notepadManager.focus();
            
        }, 500);
        
        // Test copy functionality after 2 seconds
        setTimeout(() => {
            console.log('Testing copy functionality...');
            notepadManager.copyToClipboard();
        }, 2000);
        
        console.log('Notepad system test started!');
        
    }, 1000);
}

// Global access for testing
window.testNotepadSystem = testNotepadSystem;

// Run test when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testNotepadSystem, 4000);
});

console.log('Notepad test script loaded');
