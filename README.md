# Waifu AI Side Panel with Todo List & Interactive Quotes

A Chrome extension that provides a native browser side panel featuring an animated waifu character with an integrated todo list, affection system, and interactive kawaii quote tooltips for enhanced productivity and engagement.

## Features

### 🌸 Interactive Quote System
- **Kawaii Tooltips**: Beautiful speech bubble tooltips with gradient backgrounds and sparkle effects
- **Random Quotes**: Displays encouraging quotes every 10 seconds with 20+ predefined kawaii messages
- **Event-Triggered Quotes**: Contextual quotes for specific actions:
  - 📝 **Task Completion**: *"Yatta! Task completed! ♪(´▽｀)"*
  - 👆 **Waifu Interaction**: *"Kyaa~ That tickles! (◕‿◕)♡"*  
  - ➕ **New Task**: *"Ooh, a new adventure! ☆"*
- **Mood-Aware Quotes**: Quotes adapt based on task progress and affection levels
- **Future LLM Ready**: Modular architecture prepared for AI-powered personalized quotes
- **Smooth Animations**: Floating tooltips with subtle bounce effects and auto-positioning

## Features

### � Interactive Quote System
- **Kawaii Tooltips**: Beautiful speech bubble tooltips with gradient backgrounds and sparkle effects
- **Random Quotes**: Displays encouraging quotes every 10 seconds with 20+ predefined kawaii messages
- **Event-Triggered Quotes**: Contextual quotes for specific actions:
  - 📝 **Task Completion**: *"Yatta! Task completed! ♪(´▽｀)"*
  - 👆 **Waifu Interaction**: *"Kyaa~ That tickles! (◕‿◕)♡"*  
  - ➕ **New Task**: *"Ooh, a new adventure! ☆"*
- **Mood-Aware Quotes**: Quotes adapt based on task progress and affection levels
- **Future LLM Ready**: Modular architecture prepared for AI-powered personalized quotes
- **Smooth Animations**: Floating tooltips with subtle bounce effects and auto-positioning

### �🎨 Waifu Character System
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

### Modular File Structure
```
WaifuAIV1/
├── manifest.json              # Chrome extension configuration
├── background.js              # Service worker for side panel management  
├── sidebar.html               # Main UI structure (uses ES6 modules)
├── sidebar.css                # Styling, layout, and tooltip designs
├── js/                        # Modular JavaScript architecture
│   ├── main.js                # Application bootstrap entry point
│   ├── config.js              # Centralized configuration constants
│   ├── WaifuApp.js            # Main application coordinator
│   ├── interfaces/            # TypeScript-style interfaces for contracts
│   │   ├── IStorageProvider.js # Storage abstraction interface
│   │   └── ILogger.js         # Logging abstraction interface
│   ├── providers/             # External API implementations
│   │   ├── ChromeStorageProvider.js # Chrome storage implementation
│   │   └── ConsoleLogger.js   # Console logging implementation
│   ├── models/                # Domain models and business logic
│   │   ├── Todo.js            # Todo item model with validation
│   │   └── AffectionLevel.js  # Affection system model
│   ├── services/              # Reusable business services
│   │   ├── DataValidationService.js # Input validation and sanitization
│   │   ├── AnimationService.js      # UI animation utilities
│   │   └── QuoteService.js    # Quote management and selection
│   └── managers/              # Feature-specific managers
│       ├── WaifuSpriteManager.js # Sprite cycling and mood display
│       ├── AffectionManager.js   # Affection system management  
│       ├── TodoManager.js        # Todo CRUD operations
│       └── TooltipManager.js     # Quote tooltip display system
├── assets/                    # Character sprites
│   ├── saber_angry.png
│   ├── saber_happy.png
│   ├── saber_neutral.png
│   ├── saber_plooshie.png
│   └── saber_pouting.png
└── README.md                  # This comprehensive documentation
```

### Clean Architecture Implementation

The extension follows **Clean Architecture** principles with clear separation of concerns:

#### **Presentation Layer** (UI Components)
- `sidebar.html` - Structure and semantic markup
- `sidebar.css` - Styling, animations, and responsive design
- `TooltipManager.js` - UI tooltip rendering and positioning

#### **Application Layer** (Use Cases & Coordination)
- `WaifuApp.js` - Main application coordinator orchestrating all features
- `main.js` - Bootstrap entry point with dependency injection setup

#### **Domain Layer** (Business Logic)
```javascript
// Domain Models with business rules
class Todo {
  toggle() // Business logic for task completion
  isValid() // Domain validation rules
}

class AffectionLevel {
  increase(amount) // Affection calculation rules
  getMoodLevel() // Mood determination logic
}
```

#### **Infrastructure Layer** (External Concerns)
```javascript
// Storage abstraction
class ChromeStorageProvider implements IStorageProvider {
  async get(key) // Chrome API integration
  async set(key, value) // Persistence handling
}

// Logging abstraction  
class ConsoleLogger implements ILogger {
  log(message) // Development logging
  error(message) // Error tracking
}
```

#### **Service Layer** (Cross-Cutting Concerns)
```javascript
class QuoteService {
  getRandomQuote(mood) // Quote selection algorithm
  getQuoteByEvent(eventType) // Event-based quote logic
}

class AnimationService {
  static fadeIn(element) // Reusable animations
  static createAffectionBoost(container) // UI feedback
}
```

### SOLID Principles Implementation

#### **Single Responsibility Principle (SRP)**
Each class has one clear responsibility:
- `WaifuSpriteManager`: Sprite cycling and mood-based sprite selection
- `AffectionManager`: Affection levels, persistence, and UI updates
- `TodoManager`: Todo CRUD operations and rendering
- `TooltipManager`: Tooltip display, positioning, and animations
- `QuoteService`: Quote selection and mood-based quote logic
- `AnimationService`: Reusable animation utilities
- `DataValidationService`: Data validation and sanitization

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
- Quote logic consolidated in `QuoteService`
- Configuration constants defined in `CONFIG` object
- Reusable tooltip positioning logic in `TooltipManager`
- Shared UI patterns and color schemes in CSS

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
│   ├── #waifu-sprite       # Animated character image (click interaction)
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

<!-- Dynamically Created by TooltipManager -->
.waifu-tooltip              # Floating quote tooltips
├── .tooltip-content        # Speech bubble container
│   ├── .tooltip-text       # Quote text content
│   └── .tooltip-arrow      # Speech bubble arrow
└── ::before                # Sparkle decoration (✨)
```

#### 4. Modular Application Architecture

##### **Application Bootstrap** (`main.js`)
```javascript
// Dependency injection setup
const storageProvider = new ChromeStorageProvider();
const logger = new ConsoleLogger();

// Application initialization
const app = new WaifuApp(storageProvider, logger);
await app.initialize();
```

##### **Main Application Coordinator** (`WaifuApp.js`)
```javascript
class WaifuApp {
  constructor(storageProvider, logger) {
    // Initialize all feature managers
    this.quoteService = new QuoteService(logger);
    this.waifuManager = new WaifuSpriteManager(spriteElement, logger);
    this.affectionManager = new AffectionManager(storageProvider, logger);
    this.todoManager = new TodoManager(storageProvider, logger);
    this.tooltipManager = new TooltipManager(logger);
  }

  async initialize() {
    // Load data, start systems, setup handlers
    await this.loadData();
    this.waifuManager.startCycling();
    this.startQuoteSystem(); // New quote system
    this.setupEventHandlers();
  }

  startQuoteSystem() {
    // Random quotes every 10 seconds
    setInterval(() => this.showRandomQuote(), 10000);
  }

  showEventQuote(eventType) {
    // Context-aware quotes for user actions
    const quote = this.quoteService.getQuoteByEvent(eventType);
    this.tooltipManager.show(quote, 3000);
  }
}
```

##### **Quote & Tooltip System**
```javascript
class QuoteService {
  quotes = [
    "Kyaa~ You're working so hard! (◕‿◕)♡",
    "Ganbatte kudasai! Fighting~! ٩(◕‿◕)۶",
    "Your hard work makes me happy! ♡⃛",
    // ... 20+ kawaii quotes
  ];

  getRandomQuote(mood = null) {
    // Returns mood-specific or general quotes
    const quoteArray = mood ? this.moodQuotes[mood] : this.quotes;
    return quoteArray[Math.floor(Math.random() * quoteArray.length)];
  }

  getQuoteByEvent(eventType) {
    // Event-specific quotes for task completion, waifu clicks, etc.
    return this.eventQuotes[eventType] || this.getRandomQuote();
  }
}

class TooltipManager {
  show(text, duration, targetElement) {
    // Creates beautiful speech bubble tooltips
    // - Pink gradient backgrounds with sparkle effects
    // - Smart positioning to avoid screen edges
    // - Floating animations with gentle bounce
    // - Auto-hide after specified duration
  }

  positionTooltip(targetElement) {
    // Intelligent positioning above waifu container
    // Adjusts for screen boundaries and side panel width
  }
}
```

##### **Enhanced Manager Classes**
```javascript
class WaifuSpriteManager {
  startCycling() // Auto sprite cycling every 5 seconds
  setSpriteByMood(taskProgress, affectionMood) // Mood-based sprites
  addClickHandler(callback) // Click interaction with quote triggers
}

class AffectionManager {
  async load() // Load from Chrome storage
  async save() // Persist to Chrome storage  
  increase(amount, container) // Increase with visual feedback animation
  updateUI() // Sync affection bar display
}

class TodoManager {
  async load() // Load todos with data validation
  async save() // Save todos with error handling
  add(text) // Add new todo with quote trigger
  toggle(index) // Toggle completion with quote trigger
  delete(index) // Delete with slide-out animation
  getProgress() // Get completion statistics for mood calculation
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
  
  // Quote System Integration
  startQuoteSystem() // Initialize random quote timer
  showRandomQuote() // Display mood-aware quotes
  showEventQuote(eventType) // Show context-specific quotes
  stopQuoteSystem() // Cleanup quote timers
}
```

#### 5. Styling System (`sidebar.css`)
- **Layout**: Flexbox-based responsive design optimized for side panel
- **Color Scheme**: Dark theme (#222 background, #fff text, #ff69b4 accents)
- **Typography**: Segoe UI font family, 14px base size
- **Responsive**: Media queries for different side panel widths (300px-400px+)
- **Components**: Modular styling for waifu, affection bar, todo items, inputs, buttons
- **Tooltip Styling**: 
  - Pink gradient speech bubbles with shadow effects
  - Floating animations with subtle bounce (@keyframes tooltipFloat)
  - Sparkle decorations (✨) with rotation animations
  - Smart positioning and responsive breakpoints
  - Backdrop blur effects for modern glass-morphism appearance

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

### Quote System Customization
The quote system is designed for easy extension and future LLM integration:

#### **Adding Custom Quotes**
```javascript
// In QuoteService.js - add to existing arrays
this.quotes.push("Your custom kawaii quote! ♡");

// Add mood-specific quotes
this.moodQuotes.happy.push("Custom happy quote! ✧");

// Add event-specific quotes  
this.eventQuotes.taskComplete.push("Custom completion quote! ♪");
```

#### **Future LLM API Integration**
```javascript
class QuoteService {
  async getAIQuote(mood, context) {
    // Future implementation for AI-powered quotes
    const response = await fetch('/api/generate-quote', {
      method: 'POST',
      body: JSON.stringify({ mood, context, todos: context.todos })
    });
    return response.json().quote;
  }
}
```

#### **Tooltip Appearance Customization**
```css
/* Modify tooltip colors in sidebar.css */
.tooltip-content {
  background: linear-gradient(135deg, #your-color 0%, #your-color2 100%);
  /* Customize gradient, shadows, borders */
}

/* Change sparkle effects */
.tooltip-content::before {
  content: '🌟'; /* Change sparkle emoji */
}
```

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
- **Interactive Responses**: Enhanced click handlers with quote integration
- **Voice/Sound**: Integrate Web Audio API for character sounds
- **Animations**: Add CSS animations or sprite animation sequences
- **Quote-Triggered Expressions**: Sync character sprites with quote moods

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

### Configuration Schema (`config.js`)
```javascript
export const CONFIG = {
  SPRITES: [/* sprite file paths */],
  AFFECTION: {
    MAX: 100,
    TASK_COMPLETION: 5,
    WAIFU_CLICK: 2
  },
  SPRITE_CYCLE_INTERVAL: 5000,
  ANIMATION_DURATION: 300,
  AFFECTION_LEVELS: { /* mood thresholds */ },
  TOOLTIP: {
    RANDOM_INTERVAL: 10000,  // 10 seconds between random quotes
    DISPLAY_DURATION: 4000,  // 4 seconds display time
    EVENT_DURATION: 3000,    // 3 seconds for event quotes
    AUTO_ENABLED: true       // Enable/disable quote system
  }
};
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

### AI-Powered Quote System
- **LLM Integration**: Connect to OpenAI, Anthropic, or local AI models
- **Contextual Awareness**: Generate quotes based on:
  - Current task content and difficulty
  - Time of day and work patterns  
  - User's productivity streaks
  - Seasonal events and holidays
- **Personality Development**: Evolving character personality over time
- **Multi-language Support**: Generate quotes in different languages
- **Voice Synthesis**: Text-to-speech for audio quotes

### Enhanced Interactivity
- **Quote Reactions**: User feedback system (like/dislike quotes)
- **Custom Quote Requests**: Ask waifu for specific types of encouragement
- **Conversation Mode**: Basic chat interface with the character
- **Quote History**: View and favorite past quotes
- **Sharing Features**: Share favorite quotes on social media

### Productivity Features
- **Pomodoro Timer**: Integrate work/break cycles
- **Daily Goals**: Set and track daily task targets
- **Progress Analytics**: Charts and statistics over time
- **Rewards System**: Unlock new character expressions

### Character Enhancements
- **Multiple Characters**: Character selection system with unique quote sets
- **Seasonal Themes**: Holiday or seasonal sprite sets with themed quotes
- **Character Customization**: User-uploadable sprites with custom quote voices
- **Interactive Dialogue**: Advanced text-based character interaction
- **Character Progression**: Unlock new quotes and expressions over time

### Integration Features
- **Calendar Sync**: Google Calendar integration
- **Cross-device Sync**: Cloud storage for todos
- **Team Features**: Shared todo lists
- **Third-party APIs**: Integration with task management services

## License & Credits

This project features character sprites that should be properly licensed for distribution. Ensure appropriate attribution and licensing compliance before public release.

---

*Last Updated: September 6, 2025*
*Version: 0.5 - Interactive Quote System & Modular Architecture*

**New in v0.5:**
- 🌸 Interactive kawaii quote tooltip system with 20+ predefined quotes
- 🏗️ Complete modular architecture with clean separation of concerns  
- 💬 Event-triggered contextual quotes for user actions
- ✨ Beautiful floating speech bubble tooltips with sparkle effects
- 🤖 LLM-ready architecture for future AI-powered personalized quotes
- 📁 Organized file structure following clean architecture principles
