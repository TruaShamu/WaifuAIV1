# 📚 API Reference

Complete reference for all classes, methods, and interfaces in the Waifu AI extension.

## 🏗️ Core Application

### WaifuApp

The main application coordinator that orchestrates all managers and services.

```javascript
class WaifuApp {
  constructor(storageProvider: IStorageProvider, logger: ILogger)
  
  // Lifecycle methods
  async initialize(): Promise<void>
  setupEventHandlers(): void
  
  // Settings integration
  setupSettingsIntegration(): void
  validateSettings(settings: Object): boolean
  applySettings(settings: Object): void
  
  // Quote system
  startQuoteSystem(): void
  showRandomQuote(): void
  showEventQuote(eventType: string): void
  stopQuoteSystem(): void
  
  // State management
  updateWaifuMood(): void
  setupStorageSync(): void
}
```

## 👑 Managers

### SettingsManager

Handles all settings persistence, validation, and coordination.

```javascript
class SettingsManager {
  constructor(storageProvider: IStorageProvider, logger: ILogger)
  
  // Core operations
  async load(): Promise<Object>
  async save(settings: Object): Promise<void>
  getDefaults(): Object
  
  // Validation
  validateSettings(settings: Object): boolean
  validatePomodoroSettings(settings: Object): boolean
  validateAffectionSettings(settings: Object): boolean
  validateTooltipSettings(settings: Object): boolean
  
  // Data management
  exportSettings(): string
  importSettings(jsonString: string): boolean
  async resetToDefaults(): Promise<void>
  
  // Events
  onSettingsChange?: (settings: Object) => void
}
```

### UIManager

Manages view switching and UI state.

```javascript
class UIManager {
  constructor(logger: ILogger)
  
  // View management
  showMainView(): void
  showSettingsView(): void
  getCurrentView(): string
  
  // Settings UI
  populateSettingsForm(settings: Object): void
  generateSettingsForm(settings: Object): HTMLElement
  setupFormHandlers(): void
  
  // Feedback
  showSuccessMessage(message: string): void
  showErrorMessage(message: string): void
  
  // Events
  onViewChange?: (view: string) => void
  onSettingsFormChange?: (settings: Object) => void
}
```

### PomodoroManager

Controls the Pomodoro timer functionality.

```javascript
class PomodoroManager {
  constructor(timer: PomodoroTimer, logger: ILogger)
  
  // Timer controls
  start(): void
  pause(): void
  stop(): void
  reset(): void
  
  // State queries
  isRunning(): boolean
  getCurrentPhase(): string // 'work' | 'shortBreak' | 'longBreak'
  getTimeRemaining(): number
  getProgress(): number // 0-1
  
  // Settings
  updateSettings(settings: Object): void
  
  // Statistics
  getSessionStats(): Object
  getTotalStats(): Object
  
  // Events
  onTick?: (timeRemaining: number) => void
  onPhaseComplete?: (phase: string) => void
  onSessionComplete?: () => void
}
```

### TodoManager

Manages todo list operations and persistence.

```javascript
class TodoManager {
  constructor(storageProvider: IStorageProvider, logger: ILogger)
  
  // CRUD operations
  async add(text: string): Promise<void>
  async toggle(index: number): Promise<void>
  async delete(index: number): Promise<void>
  async load(): Promise<void>
  async save(): Promise<void>
  
  // Queries
  getTodos(): Todo[]
  getProgress(): Object // { total, completed, percentage }
  
  // Rendering
  render(): void
  updateStats(): void
  
  // Events
  onToggle?: (todo: Todo, index: number) => void
  onDelete?: (todo: Todo, index: number) => void
  onAdd?: (todo: Todo) => void
}
```

### AffectionManager

Handles the affection system and character mood.

```javascript
class AffectionManager {
  constructor(storageProvider: IStorageProvider, logger: ILogger)
  
  // Core operations
  async load(): Promise<void>
  async save(): Promise<void>
  increase(amount: number, container?: HTMLElement): void
  
  // State queries
  getLevel(): number
  getMood(): string // 'happy' | 'neutral' | 'pouting'
  getPercentage(): number
  
  // UI updates
  updateUI(): void
  createAffectionBoost(container: HTMLElement): void
  
  // Settings
  updateRewards(rewards: Object): void
}
```

### WaifuSpriteManager

Controls character sprite display and cycling.

```javascript
class WaifuSpriteManager {
  constructor(spriteElement: HTMLElement, logger: ILogger)
  
  // Sprite control
  startCycling(): void
  stopCycling(): void
  setSpriteByMood(taskProgress: Object, affectionMood: string): void
  setRandomSprite(): void
  
  // State queries
  getCurrentSprite(): string
  isCycling(): boolean
  
  // Interaction
  addClickHandler(callback: Function): void
  
  // Settings
  updateSettings(settings: Object): void
}
```

### TooltipManager

Manages tooltip display and positioning.

```javascript
class TooltipManager {
  constructor(logger: ILogger)
  
  // Display control
  show(text: string, duration?: number, targetElement?: HTMLElement): void
  hide(): void
  isVisible(): boolean
  
  // Positioning
  positionTooltip(targetElement?: HTMLElement): void
  
  // Animation
  animateTooltip(tooltip: HTMLElement): void
  
  // Cleanup
  cleanup(): void
}
```

## 🎭 Models

### Todo

Represents a todo item with validation and business logic.

```javascript
class Todo {
  constructor(text: string, completed: boolean = false, id?: number)
  
  // Properties
  text: string
  completed: boolean
  id: number
  createdAt: Date
  
  // Methods
  toggle(): void
  isValid(): boolean
  toJSON(): Object
  static fromJSON(data: Object): Todo
}
```

### AffectionLevel

Manages affection calculation and mood determination.

```javascript
class AffectionLevel {
  constructor(level: number = 0)
  
  // Properties
  level: number
  
  // Methods
  increase(amount: number): void
  getMoodLevel(): string
  getPercentage(): number
  reset(): void
  
  // Static methods
  static getMoodThresholds(): Object
  static calculateMood(level: number): string
}
```

### PomodoroTimer

Core timer model with state management.

```javascript
class PomodoroTimer {
  constructor(settings: Object = {})
  
  // Properties
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  currentPhase: string
  timeRemaining: number
  isRunning: boolean
  
  // Methods
  start(): void
  pause(): void
  stop(): void
  reset(): void
  tick(): void
  
  // Queries
  getProgress(): number
  getPhaseLabel(): string
  
  // Events
  onTick?: (timeRemaining: number) => void
  onPhaseComplete?: (phase: string) => void
}
```

## 🔧 Services

### QuoteService

Handles quote selection and mood-based logic.

```javascript
class QuoteService {
  constructor(logger: ILogger)
  
  // Quote selection
  getRandomQuote(mood?: string): string
  getQuoteByEvent(eventType: string): string
  getMoodQuotes(mood: string): string[]
  
  // Quote management
  getAllQuotes(): string[]
  addCustomQuote(quote: string, mood?: string): void
  
  // Configuration
  updateSettings(settings: Object): void
}
```

### AnimationService

Provides reusable animation utilities.

```javascript
class AnimationService {
  // Basic animations
  static fadeIn(element: HTMLElement, duration?: number): Promise<void>
  static fadeOut(element: HTMLElement, duration?: number): Promise<void>
  static slideUp(element: HTMLElement, duration?: number): Promise<void>
  static slideDown(element: HTMLElement, duration?: number): Promise<void>
  
  // Complex animations
  static createAffectionBoost(container: HTMLElement): void
  static sparkleEffect(element: HTMLElement): void
  static shake(element: HTMLElement, intensity?: number): void
  static colorPulse(element: HTMLElement, color?: string): void
  
  // Tooltip animations
  static animateTooltip(tooltip: HTMLElement): void
  static floatingAnimation(element: HTMLElement): void
}
```

### DataValidationService

Provides data validation and sanitization.

```javascript
class DataValidationService {
  // Todo validation
  static validateTodoText(text: string): boolean
  static sanitizeTodoText(text: string): string
  
  // Settings validation
  static validateSettings(settings: Object): boolean
  static validatePomodoroSettings(settings: Object): boolean
  static validateAffectionSettings(settings: Object): boolean
  
  // General validation
  static isPositiveInteger(value: any): boolean
  static isInRange(value: number, min: number, max: number): boolean
  static escapeHtml(text: string): string
}
```

## 🔌 Interfaces

### IStorageProvider

Abstraction for storage operations.

```javascript
interface IStorageProvider {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}
```

### ILogger

Abstraction for logging operations.

```javascript
interface ILogger {
  log(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
}
```

## 🏗️ Providers

### ChromeStorageProvider

Chrome storage API implementation.

```javascript
class ChromeStorageProvider implements IStorageProvider {
  async get(key: string): Promise<any>
  async set(key: string, value: any): Promise<void>
  async remove(key: string): Promise<void>
  async clear(): Promise<void>
  
  // Chrome-specific methods
  async getStorageInfo(): Promise<Object>
  async getBytesInUse(keys?: string[]): Promise<number>
}
```

### ConsoleLogger

Console logging implementation.

```javascript
class ConsoleLogger implements ILogger {
  log(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
  
  // Additional methods
  setLevel(level: string): void
  getLevel(): string
}
```

## ⚙️ Configuration

### CONFIG Object

Central configuration constants.

```javascript
const CONFIG = {
  // Sprite settings
  SPRITES: string[],
  SPRITE_CYCLE_INTERVAL: number,
  
  // Affection system
  AFFECTION: {
    MAX: number,
    TASK_COMPLETION: number,
    WAIFU_CLICK: number,
    LEVELS: Object
  },
  
  // Pomodoro timer
  POMODORO: {
    WORK_MINUTES: number,
    SHORT_BREAK_MINUTES: number,
    LONG_BREAK_MINUTES: number,
    CYCLES_BEFORE_LONG_BREAK: number
  },
  
  // Quote system
  TOOLTIP: {
    RANDOM_INTERVAL: number,
    DISPLAY_DURATION: number,
    EVENT_DURATION: number,
    AUTO_ENABLED: boolean
  },
  
  // UI settings
  ANIMATION_DURATION: number,
  STORAGE_KEYS: Object
}
```

## 🔄 Event System

### Event Types

Events dispatched throughout the application:

```javascript
// Settings events
'settingsChanged'     // When settings are updated
'settingsSaved'       // When settings are persisted
'settingsReset'       // When settings are reset to defaults

// Todo events
'todoAdded'          // When a new todo is created
'todoToggled'        // When a todo is completed/uncompleted
'todoDeleted'        // When a todo is removed

// Timer events
'timerStarted'       // When Pomodoro timer starts
'timerPaused'        // When timer is paused
'timerStopped'       // When timer is stopped
'phaseComplete'      // When a timer phase completes
'sessionComplete'    // When a full Pomodoro session completes

// Affection events
'affectionIncreased' // When affection level increases
'moodChanged'        // When character mood changes

// Quote events
'quoteShown'         // When a quote tooltip is displayed
'quoteHidden'        // When a quote tooltip is hidden

// UI events
'viewChanged'        // When switching between main/settings view
```

## 🧪 Testing Utilities

### Mock Implementations

```javascript
// Mock storage for testing
class MockStorageProvider implements IStorageProvider {
  private data: Map<string, any> = new Map()
  
  async get(key: string): Promise<any>
  async set(key: string, value: any): Promise<void>
  async remove(key: string): Promise<void>
  async clear(): Promise<void>
}

// Mock logger for testing
class MockLogger implements ILogger {
  logs: string[] = []
  
  log(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
  
  getLogs(): string[]
  clearLogs(): void
}
```

---

**Note**: This API reference reflects version 0.6 of the Waifu AI extension. Some methods may have additional optional parameters not shown here for brevity. Check the source code for complete parameter lists and implementation details.
