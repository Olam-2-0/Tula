import { initTheme, OrbitStore } from '../utils/orbitCore.js';

let currentDate = new Date();
let selectedDateStr = null;
let currentView = 'month'; // 'month' or 'today'

function bootstrapCalendar() {
  initTheme();
  renderCalendar();
  updateProgressOrb();
  setupEventListeners();

  window.addEventListener('orbit:data_updated', () => {
    renderCalendar();
    updateProgressOrb();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapCalendar);
} else {
  bootstrapCalendar();
}

function setupEventListeners() {
  document.getElementById('prev-month-btn')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('next-month-btn')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  document.getElementById('today-jump-btn')?.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
  });

  // Month Dropdown Select
  const monthPicker = document.getElementById('month-picker-select');
  monthPicker?.addEventListener('change', (e) => {
    currentDate.setMonth(parseInt(e.target.value, 10));
    currentDate.setFullYear(2026);
    renderCalendar();
  });

  // Toggle views
  const monthBtn = document.getElementById('view-month-btn');
  const yearBtn = document.getElementById('view-year-btn');
  const todayBtn = document.getElementById('view-today-btn');

  function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('month-view-container').style.display = view === 'month' ? 'block' : 'none';
    document.getElementById('year-view-container').style.display = view === 'year' ? 'block' : 'none';
    document.getElementById('today-agenda-container').style.display = view === 'today' ? 'block' : 'none';

    if (view === 'month') {
      monthBtn?.classList.add('active');
      renderCalendar();
    } else if (view === 'year') {
      yearBtn?.classList.add('active');
      renderYearOverview();
    } else if (view === 'today') {
      todayBtn?.classList.add('active');
      renderTodayAgenda();
    }
  }

  monthBtn?.addEventListener('click', () => switchView('month'));
  yearBtn?.addEventListener('click', () => switchView('year'));
  todayBtn?.addEventListener('click', () => switchView('today'));

  document.getElementById('add-today-event-btn')?.addEventListener('click', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    selectedDateStr = todayStr;
    document.getElementById('modal-date-display').textContent = `Add Event for Today (${todayStr})`;
    document.getElementById('event-modal').classList.add('open');
    document.getElementById('event-title').focus();
  });

  // Modal events
  const modal = document.getElementById('event-modal');
  document.getElementById('close-modal-btn')?.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  document.getElementById('save-event-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title').value.trim();
    const time = document.getElementById('event-time').value.trim();
    if (!title || !selectedDateStr) return;

    const events = OrbitStore.getEvents();
    events.push({
      id: 'e_' + Date.now(),
      date: selectedDateStr,
      time: time || 'All Day',
      title,
      completed: false
    });
    OrbitStore.saveEvents(events);

    modal.classList.remove('open');
    document.getElementById('save-event-form').reset();
    renderCalendar();
    if (currentView === 'today') renderTodayAgenda();
  });
}

function renderCalendar() {
  const monthLabel = document.getElementById('calendar-month-label');
  const grid = document.getElementById('calendar-grid');
  if (!monthLabel || !grid) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  monthLabel.textContent = `${monthNames[month]} ${year}`;

  const monthSelect = document.getElementById('month-picker-select');
  if (monthSelect) monthSelect.value = String(month);

  grid.innerHTML = '';

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];
  const allEvents = OrbitStore.getEvents();

  // Prev month padding cells
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayEvents = allEvents.filter(ev => ev.date === dStr);

    const cell = document.createElement('div');
    cell.className = 'calendar-cell other-month';
    cell.innerHTML = `
      <span class="cell-date-num">${dayNum}</span>
      <div class="cell-events-list">
        ${dayEvents.map(ev => `
          <div class="cell-event-chip ${ev.completed ? 'completed' : ''}" title="${ev.time}: ${ev.title}">
            <span>${ev.title}</span>
          </div>
        `).join('')}
      </div>
    `;

    cell.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      selectedDateStr = dStr;
      document.getElementById('modal-date-display').textContent = `Add Event for ${dStr}`;
      document.getElementById('event-modal').classList.add('open');
      document.getElementById('event-title').focus();
    });

    grid.appendChild(cell);
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cell = document.createElement('div');
    cell.className = `calendar-cell ${dStr === todayStr ? 'today' : ''}`;
    
    const dayEvents = allEvents.filter(ev => ev.date === dStr);

    cell.innerHTML = `
      <span class="cell-date-num">${d}</span>
      <div class="cell-events-list">
        ${dayEvents.map(ev => `
          <div class="cell-event-chip ${ev.completed ? 'completed' : ''}" title="${ev.time}: ${ev.title}">
            <span>${ev.title}</span>
          </div>
        `).join('')}
      </div>
    `;

    cell.addEventListener('click', () => {
      selectedDateStr = dStr;
      document.getElementById('modal-date-display').textContent = `Add Event for ${dStr}`;
      document.getElementById('event-modal').classList.add('open');
      document.getElementById('event-title').focus();
    });

    grid.appendChild(cell);
  }

  // Next month padding cells to complete 35 or 42 grid slots
  const filledCells = firstDayIndex + totalDays;
  const targetTotal = filledCells > 35 ? 42 : 35;
  const nextDaysCount = targetTotal - filledCells;

  for (let n = 1; n <= nextDaysCount; n++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    const dayEvents = allEvents.filter(ev => ev.date === dStr);

    const cell = document.createElement('div');
    cell.className = 'calendar-cell other-month';
    cell.innerHTML = `
      <span class="cell-date-num">${n}</span>
      <div class="cell-events-list">
        ${dayEvents.map(ev => `
          <div class="cell-event-chip ${ev.completed ? 'completed' : ''}" title="${ev.time}: ${ev.title}">
            <span>${ev.title}</span>
          </div>
        `).join('')}
      </div>
    `;

    cell.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      selectedDateStr = dStr;
      document.getElementById('modal-date-display').textContent = `Add Event for ${dStr}`;
      document.getElementById('event-modal').classList.add('open');
      document.getElementById('event-title').focus();
    });

    grid.appendChild(cell);
  }
}

function renderTodayAgenda() {
  const container = document.getElementById('today-agenda-items');
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const allEvents = OrbitStore.getEvents();
  const todayEvents = allEvents.filter(ev => ev.date === todayStr);

  if (todayEvents.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); padding: 1.5rem 0;">No events scheduled for today yet. Click on any date in the Month view or add one here!</p>`;
    return;
  }

  container.innerHTML = todayEvents.map(ev => `
    <div class="glass-panel" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; margin-bottom: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <input type="checkbox" ${ev.completed ? 'checked' : ''} data-id="${ev.id}" class="agenda-checkbox" style="width: 18px; height: 18px; accent-color: var(--primary-accent); cursor: pointer;">
        <div>
          <div style="font-weight: 600; text-decoration: ${ev.completed ? 'line-through' : 'none'}; opacity: ${ev.completed ? '0.6' : '1'};">${ev.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${ev.time}</div>
        </div>
      </div>
      <button class="delete-event-btn" data-id="${ev.id}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem;">&times;</button>
    </div>
  `).join('');

  // Attach toggle listeners
  container.querySelectorAll('.agenda-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const events = OrbitStore.getEvents();
      const target = events.find(ev => ev.id === id);
      if (target) {
        target.completed = e.target.checked;
        OrbitStore.saveEvents(events);
        renderTodayAgenda();
        updateProgressOrb();
      }
    });
  });

  // Attach delete listeners
  container.querySelectorAll('.delete-event-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const events = OrbitStore.getEvents().filter(ev => ev.id !== id);
      OrbitStore.saveEvents(events);
      renderTodayAgenda();
      updateProgressOrb();
    });
  });
}

function updateProgressOrb() {
  const todayStr = new Date().toISOString().split('T')[0];
  const events = OrbitStore.getEvents().filter(ev => ev.date === todayStr);
  const todos = OrbitStore.getTodos();

  const totalItems = events.length + todos.length;
  const completedItems = events.filter(e => e.completed).length + todos.filter(t => t.completed).length;

  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const pctText = document.getElementById('progress-percentage-text');
  const circleBar = document.getElementById('progress-circle-bar');

  if (pctText) pctText.textContent = `${pct}%`;

  if (circleBar) {
    const circumference = 2 * Math.PI * 26; // r = 26
    const offset = circumference - (pct / 100) * circumference;
    circleBar.style.strokeDashoffset = offset;
  }
}

function renderYearOverview() {
  const container = document.getElementById('year-grid');
  if (!container) return;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = 2026;
  const allEvents = OrbitStore.getEvents();

  container.innerHTML = monthNames.map((mName, mIdx) => {
    const mTotalDays = new Date(year, mIdx + 1, 0).getDate();
    const monthPrefix = `${year}-${String(mIdx + 1).padStart(2, '0')}`;
    const mEvents = allEvents.filter(ev => ev.date.startsWith(monthPrefix));

    return `
      <div class="glass-panel" style="padding: 1.25rem; cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" onclick="window.jumpToMonth(${mIdx})">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 style="font-size: 1.1rem; color: var(--text-primary);">${mName} 2026</h3>
          <span style="font-size: 0.75rem; font-weight: 700; background: rgba(var(--primary-accent-rgb), 0.18); color: var(--primary-accent); padding: 0.2rem 0.55rem; border-radius: 9999px;">
            ${mEvents.length} event${mEvents.length === 1 ? '' : 's'}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          ${Array.from({ length: new Date(year, mIdx, 1).getDay() }).map(() => `<div></div>`).join('')}
          ${Array.from({ length: mTotalDays }).map((_, dIdx) => {
            const dNum = dIdx + 1;
            const dStr = `${monthPrefix}-${String(dNum).padStart(2, '0')}`;
            const hasEvent = allEvents.some(ev => ev.date === dStr);
            return `<div style="padding: 2px; border-radius: 3px; background: ${hasEvent ? 'rgba(var(--primary-accent-rgb), 0.35)' : 'transparent'}; color: ${hasEvent ? 'var(--primary-accent)' : 'inherit'}; font-weight: ${hasEvent ? '700' : 'normal'}">${dNum}</div>`;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  window.jumpToMonth = function(mIdx) {
    currentDate.setMonth(mIdx);
    currentDate.setFullYear(2026);
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('view-month-btn')?.classList.add('active');
    document.getElementById('month-view-container').style.display = 'block';
    document.getElementById('year-view-container').style.display = 'none';
    document.getElementById('today-agenda-container').style.display = 'none';
    renderCalendar();
  };
}
