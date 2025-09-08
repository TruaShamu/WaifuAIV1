# 🌸 Waifu AI - Productivity Companion Chrome Extension
<img width="493" height="955" alt="image" src="https://github.com/user-attachments/assets/a8301373-5377-4465-ad13-0acde1d716de" />


<img width="499" height="978" alt="image" src="https://github.com/user-attachments/assets/18042825-bd3e-48a0-8d0d-1f2445e21301" />


(The below documentation is AI-generated, and may not reflect the up to date browser extension feature set or design)
> A delightful Chrome extension featuring an animated waifu companion with integrated productivity tools including todo management, Pomodoro timer, affection system, and kawaii quote system.

[![Version](https://img.shields.io/badge/version-0.6-pink.svg)](./docs/CHANGELOG.md)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/)

## ✨ Features

### 🎯 **Productivity Suite**
- **📝 Todo Management**: Add, complete, and track tasks with visual feedback
- **🍅 Pomodoro Timer**: Built-in timer with work/break cycles and statistics
- **⚙️ Settings Panel**: Comprehensive customization with real-time preview
- **📊 Progress Tracking**: Visual progress indicators and productivity statistics

### 🌸 **Waifu Companion**
- **💕 Affection System**: Interactive character that responds to your productivity
- **🎭 Dynamic Expressions**: Character mood changes based on task completion
- **💬 Kawaii Quotes**: Context-aware encouraging messages and tooltips
- **✨ Smooth Animations**: Floating tooltips and visual feedback effects

### 🔧 **Advanced Features**
- **📱 Native Side Panel**: Integrated with Chrome's side panel API
- **🔄 Real-time Sync**: Cross-tab synchronization via Chrome storage
- **🎨 Dark Theme**: Modern UI with customizable appearance
- **⌨️ Keyboard Shortcuts**: Efficient navigation and quick actions
- **📤 Data Export/Import**: Backup and restore your settings

## 🚀 Quick Start

### Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project directory
5. Click the extension icon to open the side panel

### First Use
1. **Add your first task** using the input field
2. **Click on the waifu** to increase affection
3. **Complete tasks** to see mood changes
4. **Open settings** (⚙️) to customize your experience
5. **Start a Pomodoro session** to boost productivity

## 📁 Project Structure

```
WaifuAIV1/
├── 📋 Core Extension Files
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Service worker
│   ├── sidebar.html           # Main UI structure
│   └── sidebar.css            # Styling and animations
│
├── ⚙️ JavaScript Architecture
│   ├── js/main.js             # Application bootstrap
│   ├── js/config.js           # Configuration constants
│   ├── js/WaifuApp.js         # Main coordinator
│   │
│   ├── 🔌 Interfaces/         # Abstract contracts
│   │   ├── IStorageProvider.js
│   │   └── ILogger.js
│   │
│   ├── 🏗️ Providers/          # External API implementations
│   │   ├── ChromeStorageProvider.js
│   │   └── ConsoleLogger.js
│   │
│   ├── 🎭 Models/             # Domain models
│   │   ├── Todo.js
│   │   ├── AffectionLevel.js
│   │   └── PomodoroTimer.js
│   │
│   ├── 🔧 Services/           # Business logic
│   │   ├── QuoteService.js
│   │   ├── AnimationService.js
│   │   └── DataValidationService.js
│   │
│   └── 👑 Managers/           # Feature controllers
│       ├── WaifuSpriteManager.js
│       ├── AffectionManager.js
│       ├── TodoManager.js
│       ├── TooltipManager.js
│       ├── PomodoroManager.js
│       ├── SettingsManager.js
│       └── UIManager.js
│
├── 🎨 Assets/
│   └── Character sprites (5 expressions)
│
└── 📚 Documentation/
    ├── README.md (this file)
    ├── docs/ARCHITECTURE.md
    ├── docs/API.md
    ├── docs/DEVELOPMENT.md
    └── docs/CHANGELOG.md
```

## 💡 Key Features Deep Dive

### Pomodoro Timer
- **Configurable durations**: Work (25 min), Short break (5 min), Long break (15 min)
- **Visual progress**: Circular timer with color-coded sessions
- **Statistics tracking**: Work sessions, total time, productivity metrics
- **Browser notifications**: Alerts for session completion
- **Auto-start options**: Seamless workflow automation

### Settings System
- **Real-time preview**: See changes instantly before saving
- **Comprehensive controls**: Timer durations, affection rewards, quote timing
- **Data management**: Export/import settings, reset to defaults
- **Feature flags**: Enable upcoming experimental features
- **Validation**: Input validation with helpful error messages

### Quote System
- **20+ kawaii quotes**: Hand-crafted encouraging messages
- **Context awareness**: Different quotes for different actions
- **Mood adaptation**: Quotes change based on productivity and affection
- **Beautiful tooltips**: Animated speech bubbles with sparkle effects
- **Customizable timing**: Adjust frequency and display duration

## 🔗 Quick Links

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Technical implementation details
- **[API Reference](./docs/API.md)** - Class and method documentation
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup and contribution guidelines
- **[Changelog](./docs/CHANGELOG.md)** - Version history and updates

## 🏗️ Architecture Highlights

This extension follows **Clean Architecture** principles with:

- **🔀 Dependency Inversion**: High-level modules don't depend on low-level details
- **🎯 Single Responsibility**: Each class has one clear purpose
- **🔓 Open/Closed**: Extensible without modifying existing code
- **🔄 Interface Segregation**: Small, focused interfaces
- **⚖️ Liskov Substitution**: Implementations are interchangeable

### Tech Stack
- **ES6+ Modules**: Modern JavaScript with clean imports
- **Chrome Extension API**: Side panel, storage, notifications
- **CSS Grid/Flexbox**: Responsive layout system
- **Web Animations**: Smooth transitions and feedback

## 🎨 Customization

### Adding Custom Quotes
```javascript
// In js/services/QuoteService.js
this.quotes.push("Your custom kawaii message! ♡");
```

### Character Expressions
- Add new sprites to `assets/` folder
- Update `CONFIG.SPRITES` array in `config.js`
- Character automatically cycles through all available sprites

### Theme Customization
```css
/* Modify CSS variables in sidebar.css */
:root {
  --primary-color: #ff69b4;    /* Main accent color */
  --bg-color: #222;            /* Background */
  --text-color: #fff;          /* Text color */
}
```

## 🚧 Roadmap

- **🤖 AI Integration**: LLM-powered personalized quotes
- **📊 Advanced Analytics**: Detailed productivity insights
- **🎭 Multiple Characters**: Character selection system
- **🌍 Internationalization**: Multi-language support
- **☁️ Cloud Sync**: Cross-device synchronization

## 📄 License

This project is for educational and personal use. Character sprites should be properly licensed for any distribution.

---

**Version 0.6** | Last Updated: December 2024

Made with ❤️ and lots of kawaii energy!
