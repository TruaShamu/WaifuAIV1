/**
 * Mood Tracker Manager
 * Handles daily mood tracking with calendar grid display
 */

export class MoodTracker {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    this.currentDate = new Date();
    this.moodData = {};
    
    // Mood colors and their meanings - updated to match app aesthetic
    this.moodColors = {
      1: { color: '#8B5A5A', name: 'Rough', emoji: '😞' },      // Muted brownish-red
      2: { color: '#B87B7B', name: 'Meh', emoji: '😐' },        // Dusty rose
      3: { color: '#D4A5A5', name: 'Okay', emoji: '🙂' },       // Light pink-beige
      4: { color: '#FF9EBF', name: 'Good', emoji: '😊' },       // Soft pink
      5: { color: '#FF69B4', name: 'Great', emoji: '😄' }       // App's signature pink
    };
  }

  async initialize() {
    await this.loadMoodData();
    this.logger.log('MoodTracker initialized');
  }

  async loadMoodData() {
    try {
      const data = await this.storageProvider.get('moodData');
      this.moodData = data || {};
    } catch (error) {
      this.logger.error('Failed to load mood data:', error);
      this.moodData = {};
    }
  }

  async saveMoodData() {
    try {
      await this.storageProvider.set('moodData', this.moodData);
      this.logger.log('Mood data saved');
    } catch (error) {
      this.logger.error('Failed to save mood data:', error);
    }
  }

  setMood(date, moodLevel) {
    const dateKey = this.getDateKey(date);
    this.moodData[dateKey] = {
      mood: moodLevel,
      timestamp: Date.now()
    };
    this.saveMoodData();
  }

  getMood(date) {
    const dateKey = this.getDateKey(date);
    return this.moodData[dateKey]?.mood || null;
  }

  getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  generateCalendarHTML() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Get first day of month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = firstDay.getDay();
    
    // Calculate how many days to show from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const daysFromPrevMonth = startDayOfWeek;
    
    let calendarHTML = `
      <div class="mood-calendar">
        <div class="calendar-header">
          <button class="calendar-nav" id="mood-prev-month">‹</button>
          <span class="calendar-title">${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button class="calendar-nav" id="mood-next-month">›</button>
        </div>
        <div class="calendar-weekdays">
          <div class="weekday">Sun</div>
          <div class="weekday">Mon</div>
          <div class="weekday">Tue</div>
          <div class="weekday">Wed</div>
          <div class="weekday">Thu</div>
          <div class="weekday">Fri</div>
          <div class="weekday">Sat</div>
        </div>
        <div class="calendar-grid">
    `;

    // Add days from previous month (greyed out)
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const dayNum = prevMonth.getDate() - i;
      const date = new Date(year, month - 1, dayNum);
      calendarHTML += this.generateDayCell(date, true, dayNum);
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      calendarHTML += this.generateDayCell(date, false, day);
    }

    // Add days from next month to fill the grid (usually need 42 total cells for 6 weeks)
    const totalCells = 42;
    const cellsUsed = daysFromPrevMonth + daysInMonth;
    const daysFromNextMonth = totalCells - cellsUsed;
    
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(year, month + 1, day);
      calendarHTML += this.generateDayCell(date, true, day);
    }

    calendarHTML += `
        </div>
      </div>
      <div class="mood-scale">
        <div class="scale-title">How was today?</div>
        <div class="emotion-scale">
          <div class="scale-bar">
    `;

    // Add mood scale as a visual bar
    Object.entries(this.moodColors).forEach(([level, data]) => {
      calendarHTML += `
            <div class="scale-segment" style="background-color: ${data.color}" title="${data.name}">
              <span class="scale-emoji">${data.emoji}</span>
            </div>
      `;
    });

    calendarHTML += `
          </div>
          <div class="scale-labels">
            <span class="scale-label-left">Rough</span>
            <span class="scale-label-right">Great</span>
          </div>
        </div>
      </div>
    `;

    return calendarHTML;
  }

  generateDayCell(date, isOtherMonth, dayNumber) {
    const mood = this.getMood(date);
    const isToday = this.isToday(date);
    const otherMonthClass = isOtherMonth ? 'other-month' : '';
    const todayClass = isToday ? 'today' : '';
    const moodColor = mood ? this.moodColors[mood].color : '';
    const moodStyle = mood ? `background-color: ${moodColor}; color: white;` : '';
    const clickable = isToday && !isOtherMonth;
    
    return `
      <div class="calendar-day ${otherMonthClass} ${todayClass}" 
           data-date="${this.getDateKey(date)}"
           ${clickable ? 'data-clickable="true"' : ''}
           style="${moodStyle}">
        <div class="day-number">${dayNumber}</div>
      </div>
    `;
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  attachEventListeners() {
    // Month navigation
    document.getElementById('mood-prev-month')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.updateCalendarDisplay();
    });

    document.getElementById('mood-next-month')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.updateCalendarDisplay();
    });

    // Day clicking for current month only
    document.addEventListener('click', (e) => {
      const dayCell = e.target.closest('.calendar-day[data-clickable="true"]');
      if (dayCell) {
        this.handleDayClick(dayCell);
      }
    });
  }

  handleDayClick(dayCell) {
    // Cycle through moods on click
    const currentMood = this.getMoodFromCell(dayCell);
    const nextMood = currentMood ? (currentMood % 5) + 1 : 1;
    this.setMoodForCell(dayCell, nextMood);
  }

  getMoodFromCell(dayCell) {
    const dateKey = dayCell.dataset.date;
    const date = new Date(dateKey);
    return this.getMood(date);
  }

  setMoodForCell(dayCell, moodLevel) {
    const dateKey = dayCell.dataset.date;
    const date = new Date(dateKey);
    this.setMood(date, moodLevel);
    
    // Update visual - fill entire cell
    const color = this.moodColors[moodLevel].color;
    dayCell.style.backgroundColor = color;
    dayCell.style.color = 'white';
    
    // Add a little animation
    dayCell.style.transform = 'scale(1.1)';
    setTimeout(() => {
      dayCell.style.transform = '';
    }, 150);
  }

  updateCalendarDisplay() {
    const container = document.getElementById('mood-content');
    if (container) {
      container.innerHTML = this.generateCalendarHTML();
      this.attachEventListeners();
    }
  }

  // Get mood statistics for insights
  getMoodStats(days = 30) {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const mood = this.getMood(date);
      if (mood) {
        stats[mood]++;
      }
    }
    
    return stats;
  }

  getAverageMood(days = 7) {
    const today = new Date();
    let totalMood = 0;
    let daysWithMood = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const mood = this.getMood(date);
      if (mood) {
        totalMood += mood;
        daysWithMood++;
      }
    }
    
    return daysWithMood > 0 ? totalMood / daysWithMood : null;
  }
}
