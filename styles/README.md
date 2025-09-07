# 🎨 WaifuAI Styles Architecture

This directory contains the organized CSS architecture for WaifuAI, split by features and components for better maintainability.

## 📁 Structure

```
styles/
├── main.css              # Main entry point - imports all other CSS
├── base.css              # Base styles (typography, layout, scrollbars)
├── components/           # Reusable UI components
│   ├── header.css        # Header and navigation buttons
│   ├── panels.css        # Collapsible panel system
│   ├── buttons.css       # Button variations and states
│   ├── modals.css        # Modal dialogs and overlays
│   └── forms.css         # Form inputs and controls
└── features/             # Feature-specific styles
    ├── waifu.css         # Waifu character, affection system, tooltips
    ├── pomodoro.css      # Pomodoro timer and controls
    ├── todo.css          # Todo list and task management
    └── notepad.css       # Notepad widget and toolbar
```

## 🎯 Design Principles

### **Feature-Based Organization**
- Each major feature has its own CSS file
- Styles are grouped by functionality, not CSS type
- Easy to find and modify feature-specific styles

### **Component-Based UI**
- Reusable components in separate files
- Consistent styling across features
- Easy to maintain and update

### **Import Order**
1. **Base styles** - Typography, layout, global styles
2. **Components** - Reusable UI elements
3. **Features** - Feature-specific implementations

## 🔧 Usage

### Adding New Styles

**For new features:**
1. Create `styles/features/feature-name.css`
2. Add `@import url('./features/feature-name.css');` to `main.css`

**For new components:**
1. Create `styles/components/component-name.css`
2. Add `@import url('./components/component-name.css');` to `main.css`

### Color Scheme
- Primary: `#ff69b4` (Hot Pink)
- Secondary: `#ff1493` (Deep Pink)
- Background: `#222` (Dark Gray)
- Success: `#4CAF50` (Green)
- Danger: `#ff6b6b` (Red)

### Breakpoints
- Mobile: `max-width: 400px`
- Small: `max-width: 480px`
- Medium: `min-width: 350px`

## 📝 Maintenance

- Keep feature styles in their respective files
- Use consistent naming conventions
- Document any new component patterns
- Test responsive design on all breakpoints

## 🚀 Benefits

- **Maintainability**: Easy to find and modify specific styles
- **Scalability**: Add new features without affecting existing ones  
- **Performance**: Better caching and loading strategies
- **Collaboration**: Multiple developers can work on different features
- **Debugging**: Easier to identify style conflicts