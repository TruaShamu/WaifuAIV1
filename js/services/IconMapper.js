/**
 * Simple icon mapping using emojis and Unicode symbols
 * No external dependencies needed!
 */
export class IconMapper {
  static icons = {
    // Settings and controls
    'settings': '⚙️',
    'gear': '⚙️',
    'cog': '⚙️',
    
    // Navigation
    'arrow-left': '←',
    'arrow-right': '→',
    'arrow-up': '↑', 
    'arrow-down': '↓',
    'back': '←',
    'return': '↩️',
    
    // Actions
    'save': '💾',
    'download': '⬇️',
    'upload': '⬆️',
    'export': '📤',
    'import': '📥',
    'refresh': '🔄',
    'refresh-cw': '🔄',
    'reload': '🔄',
    'reset': '🔄',
    
    // Status
    'check': '✅',
    'checkmark': '✓',
    'cross': '❌',
    'x': '❌',
    'warning': '⚠️',
    'info': 'ℹ️',
    'error': '❌',
    'success': '✅',
    
    // Media controls
    'play': '▶️',
    'pause': '⏸️',
    'stop': '⏹️',
    'volume': '🔊',
    'mute': '🔇',
    
    // Files and data
    'file': '📄',
    'folder': '📁',
    'document': '📄',
    'image': '🖼️',
    'music': '🎵',
    'video': '🎥',
    
    // Tools and utilities
    'search': '🔍',
    'filter': '🔍',
    'edit': '✏️',
    'pencil': '✏️',
    'delete': '🗑️',
    'trash': '🗑️',
    'add': '➕',
    'plus': '➕',
    'minus': '➖',
    'copy': '📋',
    'paste': '📋',
    
    // Communication
    'message': '💬',
    'mail': '📧',
    'notification': '🔔',
    'bell': '🔔',
    'chat': '💬',
    
    // Special
    'heart': '❤️',
    'star': '⭐',
    'fire': '🔥',
    'lightning': '⚡',
    'magic': '✨',
    'sparkles': '✨',
    
    // Default fallback
    'default': '●'
  };

  /**
   * Get an icon by name
   * @param {string} iconName - The icon name
   * @returns {string} The emoji/Unicode character
   */
  static getIcon(iconName) {
    return this.icons[iconName] || this.icons['default'];
  }

  /**
   * Create an icon span element
   * @param {string} iconName - The icon name
   * @param {string} className - Optional CSS class
   * @returns {string} HTML string
   */
  static createIcon(iconName, className = 'icon') {
    const icon = this.getIcon(iconName);
    return `<span class="${className}">${icon}</span>`;
  }

  /**
   * Create an icon button
   * @param {string} iconName - The icon name
   * @param {string} text - Button text
   * @param {string} id - Button ID
   * @param {string} className - CSS classes
   * @returns {string} HTML string
   */
  static createIconButton(iconName, text, id = '', className = 'icon-button') {
    const icon = this.getIcon(iconName);
    const idAttr = id ? `id="${id}"` : '';
    return `<button ${idAttr} class="${className}">${icon} ${text}</button>`;
  }
}
