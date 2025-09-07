# 🤖 Custom Instructions Feature

## Overview
Added a **Custom Instructions** textbox to the settings panel for future LLM integration.

## Implementation Details

### UI Components
- **Location**: Settings Panel → AI Integration section
- **Element ID**: `custom-instructions`
- **Type**: Textarea (6 rows, expandable)
- **Placeholder**: "Enter custom instructions for future AI features..."

### Storage
- **Setting Key**: `customInstructions`
- **Default Value**: Empty string (`''`)
- **Persistence**: Automatically saved/loaded with other settings

### Usage
Users can enter custom instructions that will be used for future AI/LLM features, such as:
- Personality preferences
- Response style guidelines
- Specific behaviors or restrictions
- Context-specific instructions

### Technical Implementation
1. **UIManager.js**: Added `buildAISection()` and `createTextareaInput()` helper
2. **SettingsManager.js**: Added `customInstructions` to default settings
3. **modals.css**: Added `.textarea-item` styling for proper form layout

### Future Integration
This field is prepared for future features like:
- AI-powered productivity coaching
- Contextual quote generation
- Personalized task recommendations
- Smart scheduling suggestions

*Note: This feature is currently for data collection only - no AI integration is active yet.*
