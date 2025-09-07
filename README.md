# Waifu AI Side Panel with Todo List

A Chrome extension that provides a native browser side panel featuring an animated waifu character with an integrated todo list for productivity tracking.

## Features

### 🎨 Waifu Character System
- **Animated Sprites**: Cycles through different character expressions every 5 seconds
- **Reactive Emotions**: Character reacts to your productivity:
  - 😊 **Happy** (`saber_happy.png`) - All tasks completed or high affection
  - 😠 **Pouting** (`saber_pouting.png`) - No tasks completed or low affection
  - 😐 **Neutral** (`saber_neutral.png`) - Some tasks completed or medium affection
  - 🧸 **Plushie** (`saber_plooshie.png`) - Random cycle
  - 😡 **Angry** (`saber_angry.png`) - Random cycle
- **Interactive Affection System**: Click the waifu to increase affection (+2 points)
- **Affection Bar**: Visual progress bar showing current affection level (0-100)
- **Mood-based Reactions**: Waifu's expressions change based on affection level
- **Full-width Display**: Waifu container spans the entire sidebar width

### ✅ Todo List Management
- **Add Tasks**: Input field with enter key or button support
- **Toggle Completion**: Click checkboxes to mark tasks as done/undone
- **Delete Tasks**: Remove tasks with the delete button (×)
- **Persistent Storage**: Tasks saved using Chrome's storage API with enhanced reliability
- **Real-time Stats**: Shows total tasks and completion count
- **Visual Feedback**: Completed tasks are crossed out and dimmed
- **Cross-Instance Sync**: Changes sync automatically across multiple side panel instances
- **Data Validation**: Automatic validation and migration of stored data
- **Storage Monitoring**: Tracks storage usage and handles quota limitations
- **Keyboard Shortcuts**: Ctrl/Cmd+Enter to focus input, Escape to clear

### 🎯 UI/UX Features
- **Native Side Panel**: Integrated with Chrome's built-in side panel
- **Dark Theme**: Modern dark interface with pink accent colors
- **Responsive Design**: Adapts to different side panel widths
- **Smooth Animations**: Hover effects and transitions
- **Custom Scrollbar**: Styled scrollbar for the task list
- **Accessibility**: Proper keyboard navigation and semantic HTML

## Technical Architecture

### File Structure
```
WaifuAIV1/
├── manifest.json          # Chrome extension configuration
├── background.js          # Service worker for side panel management
├── sidebar.html           # Main UI structure
├── sidebar.css            # Styling and layout
├── sidebar.js             # SOLID/DRY refactored core functionality
├── assets/                # Character sprites
│   ├── saber_angry.png
│   ├── saber_happy.png
│   ├── saber_neutral.png
│   ├── saber_plooshie.png
│   └── saber_pouting.png
└── README.md              # This documentation
```

### SOLID/DRY Architecture

#### **Single Responsibility Principle (SRP)**
Each class has one clear responsibility:
- `WaifuSpriteManager`: Handles sprite cycling and mood-based sprite selection
- `AffectionManager`: Manages affection levels, persistence, and UI updates
- `TodoManager`: Handles todo CRUD operations and rendering
- `AnimationService`: Provides reusable animation utilities
- `DataValidationService`: Validates and sanitizes data

#### **Open/Closed Principle (OCP)**
- Classes are open for extension but closed for modification
- `TodoManager` uses overridable event handlers (`onToggle`, `onDelete`)
- Service classes can be easily extended with new methods
- Animation types can be added to `AnimationService` without changing existing code

#### **Liskov Substitution Principle (LSP)**
- Abstract interfaces (`IStorageProvider`, `ILogger`) define contracts
- Concrete implementations can be substituted without breaking functionality
- `ChromeStorageProvider` and `ConsoleLogger` implement their respective interfaces

#### **Interface Segregation Principle (ISP)**
- Small, focused interfaces instead of large monolithic ones
- `IStorageProvider` only defines storage operations
- `ILogger` only defines logging operations
- Classes only depend on interfaces they actually use

#### **Dependency Inversion Principle (DIP)**
- High-level modules don't depend on low-level modules
- `WaifuApp` coordinator depends on abstractions, not concrete implementations
- Dependencies injected through constructor parameters
- Easy to test with mock implementations

#### **Don't Repeat Yourself (DRY)**
- Common animation logic centralized in `AnimationService`
- Data validation extracted to `DataValidationService`
- Configuration constants defined in `CONFIG` object
- Reusable color schemes and UI patterns

### Core Components

#### 1. Extension Framework (`manifest.json`)
- **Manifest Version**: 3 (latest Chrome extension format)
- **Permissions**: `storage` (for todo persistence), `sidePanel` (for native side panel)
- **Side Panel**: Default path set to `sidebar.html`
- **Service Worker**: Background script for side panel management

#### 2. Side Panel Management (`background.js`)
- Opens side panel when extension icon is clicked using `chrome.sidePanel.open()`
- Utilizes Chrome's native side panel API for better integration
- No manual window positioning or sizing needed

#### 3. UI Structure (`sidebar.html`)
```html
#app-container
├── #waifu-container        # Character display area with affection bar
│   ├── #waifu-sprite       # Animated character image
│   └── #affection-container # Affection level display
│       ├── #affection-label
│       └── #affection-bar
│           ├── #affection-fill
│           └── #affection-text
└── #todo-container         # Todo list interface
    ├── h3                  # "My Tasks" header
    ├── #todo-input-container
    │   ├── #todo-input     # Task input field
    │   └── #add-todo-btn   # Add button
    ├── #todo-list          # Task list container
    └── #todo-stats         # Task statistics
```

#### 4. Application Architecture (`sidebar.js`)

##### **Abstraction Layer**
```javascript
// Interfaces for dependency injection
class IStorageProvider { /* Storage contract */ }
class ILogger { /* Logging contract */ }

// Concrete implementations
class ChromeStorageProvider extends IStorageProvider
class ConsoleLogger extends ILogger
```

##### **Domain Models**
```javascript
class Todo {
  constructor(text, id, completed, createdAt)
  toggle() // Returns new completion status
  isValid() // Validates todo data
  static fromObject(obj) // Factory method
}

class AffectionLevel {
  increase(amount) // Increases affection with bounds checking
  getPercentage() // For UI display
  getMoodLevel() // Returns mood string for sprite selection
}
```

##### **Service Layer**
```javascript
class DataValidationService {
  static validateTodos(todos) // Sanitizes todo data
  static validateAffectionLevel(level) // Validates affection
}

class AnimationService {
  static fadeIn(element) // Reusable fade-in animation
  static slideOut(element) // Reusable slide-out animation
  static bounce(element) // Reusable bounce animation
  static createAffectionBoost(container, amount) // Affection popup
}
```

##### **Business Logic Layer**
```javascript
class WaifuSpriteManager {
  startCycling() // Auto sprite cycling
  setSpriteByMood(taskProgress, affectionMood) // Mood-based sprites
  addClickHandler(callback) // Click interaction
}

class AffectionManager {
  async load() // Load from storage
  async save() // Save to storage
  increase(amount, container) // Increase with animation
  updateUI() // Sync UI with state
}

class TodoManager {
  async load() // Load todos from storage
  async save() // Save todos to storage
  add(text) // Add new todo
  toggle(index) // Toggle completion
  delete(index) // Delete with animation
  getProgress() // Get completion statistics
}
```

##### **Application Coordinator**
```javascript
class WaifuApp {
  constructor(storageProvider, logger) // Dependency injection
  async initialize() // Bootstrap application
  setupEventHandlers() // Wire up UI interactions
  updateWaifuMood() // Coordinate mood changes
  setupStorageSync() // Cross-instance synchronization
}
```

#### 5. Styling System (`sidebar.css`)
- **Layout**: Flexbox-based responsive design optimized for side panel
- **Color Scheme**: Dark theme (#222 background, #fff text, #ff69b4 accents)
- **Typography**: Segoe UI font family, 14px base size
- **Responsive**: Media queries for different side panel widths (300px-400px+)
- **Components**: Modular styling for waifu, affection bar, todo items, inputs, buttons

#### 5. Core Logic (`sidebar.js`)

##### Data Structures
```javascript
// Todo item structure
{
  text: String,      // Task description
  completed: Boolean, // Completion status
  id: Number         // Unique timestamp ID
}

// Global arrays
sprites[]  // Character sprite file paths
todos[]    // Current todo list
```

##### Key Functions
- **`cycleSprite()`**: Random sprite cycling every 5 seconds
- **`loadTodos()`**: Retrieves saved todos from Chrome storage
- **`saveTodos()`**: Persists todos to Chrome storage
- **`renderTodos()`**: Updates DOM with current todo list
- **`updateTaskCount()`**: Updates statistics and character reactions
- **`addTodo()`**: Creates new todo items
- **`toggleTodo(index)`**: Toggles completion status
- **`deleteTodo(index)`**: Removes todo items
- **`escapeHtml(text)`**: Security function for safe HTML rendering

## Migration to Chrome Side Panel API

### Benefits of Side Panel vs Popup Window
- **Native Integration**: Uses Chrome's built-in side panel instead of floating windows
- **Better UX**: Side panel stays open while browsing, doesn't get lost behind windows
- **Responsive**: Automatically adapts to user's preferred side panel width
- **Persistent**: Remains open across tab switches (optional behavior)
- **Performance**: Better memory management through native Chrome APIs

### Key Changes Made
1. **Manifest Updates**:
   - Changed permission from `windows` to `sidePanel`
   - Added `side_panel.default_path` configuration
   - Updated extension name to reflect side panel usage

2. **Background Script Modernization**:
   - Replaced `chrome.windows.create()` with `chrome.sidePanel.open()`
   - Removed manual window positioning and sizing
   - Added proper error handling for side panel operations

3. **CSS Responsive Enhancements**:
   - Added media queries for different side panel widths (300px-400px+)
   - Improved flexbox layout for better space utilization
   - Enhanced scrolling behavior for variable heights
   - Better text wrapping for long task descriptions

### Browser Compatibility
- **Minimum Chrome Version**: 114+ (when Side Panel API was introduced)
- **Feature Detection**: Extension gracefully handles older browsers
- **Progressive Enhancement**: Falls back to standard popup behavior if needed

## Extension Points & Customization

### Adding New Character Sprites
1. Add image files to `assets/` folder
2. Update the `sprites` array in `sidebar.js`
3. Optionally add new emotion triggers in `updateTaskCount()`

### Extending Todo Functionality
The todo system is modular and can be extended with:
- **Categories/Tags**: Add category field to todo object structure
- **Due Dates**: Add date fields and sorting logic
- **Priority Levels**: Add priority field and visual indicators
- **Subtasks**: Modify data structure to support nested todos
- **Import/Export**: Add JSON import/export functionality

### UI Customization
- **Themes**: Modify CSS variables for different color schemes
- **Layouts**: Adjust flexbox properties for different arrangements
- **Animations**: Add CSS transitions or JavaScript animations
- **Responsive Design**: Modify breakpoints for different window sizes

### Character Behavior Extensions
- **More Emotions**: Add new sprite files and reaction triggers
- **Interactive Responses**: Add click handlers for character interaction
- **Voice/Sound**: Integrate Web Audio API for character sounds
- **Animations**: Add CSS animations or sprite animation sequences

## Storage Schema

### Chrome Storage Structure
```javascript
{
  "todos": [
    {
      "text": "Complete project documentation",
      "completed": false,
      "id": 1725123456789,
      "createdAt": "2025-09-06T10:30:45.123Z"
    }
    // ... more todos
  ],
  "affectionLevel": 42,
  "lastSaved": "2025-09-06T10:30:45.123Z"
}
```

### Affection System
- **Affection Range**: 0-100 points
- **Task Completion**: +5 affection per completed task
- **Waifu Interaction**: +2 affection per click on waifu
- **Visual Feedback**: Animated affection bar with shimmer effects
- **Mood Integration**: Affection level influences waifu expressions
- **Persistent Storage**: Affection level saved and restored across sessions

### Enhanced Persistence Features
- **Data Validation**: Automatic validation and sanitization of stored data
- **Migration Support**: Handles data format changes gracefully
- **Quota Management**: Monitors storage usage and handles quota exceeded errors
- **Cross-Instance Sync**: Real-time synchronization across multiple side panel instances
- **Error Recovery**: Robust error handling with fallback mechanisms
- **Backup Strategy**: Saves essential data if full data exceeds storage limits

## Development Guidelines

### Code Style
- Use ES6+ features (const/let, arrow functions, template literals)
- Follow semantic HTML5 structure
- Use BEM-like CSS naming for components
- Keep functions small and focused (single responsibility)

### Security Considerations
- Always escape user input with `escapeHtml()` function
- Validate data from Chrome storage before use
- Use content security policy restrictions from manifest

### Performance
- Minimize DOM manipulation by batching updates
- Use efficient array methods (forEach, filter, map)
- Leverage Chrome storage for persistence instead of localStorage

### Testing
- Test with various task list sizes (empty, few, many)
- Verify storage persistence across browser sessions
- Check responsive behavior at different window sizes
- Test keyboard navigation and accessibility

## Future Enhancement Ideas

### Productivity Features
- **Pomodoro Timer**: Integrate work/break cycles
- **Daily Goals**: Set and track daily task targets
- **Progress Analytics**: Charts and statistics over time
- **Rewards System**: Unlock new character expressions

### Character Enhancements
- **Multiple Characters**: Character selection system
- **Seasonal Themes**: Holiday or seasonal sprite sets
- **Character Customization**: User-uploadable sprites
- **Interactive Dialogue**: Text-based character interaction

### Integration Features
- **Calendar Sync**: Google Calendar integration
- **Cross-device Sync**: Cloud storage for todos
- **Team Features**: Shared todo lists
- **Third-party APIs**: Integration with task management services

## License & Credits

This project features character sprites that should be properly licensed for distribution. Ensure appropriate attribution and licensing compliance before public release.

---

*Last Updated: September 6, 2025*
*Version: 0.4 - SOLID/DRY Architecture Refactoring*
