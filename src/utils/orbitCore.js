/**
 * Orbit Global Shared Script
 * Handles theme persistence, cross-fade toggling, navbar behavior, and data stores
 */

// 1. Theme Management
const THEME_STORAGE_KEY = 'orbit_theme_preference';

export function initTheme() {
  const isFocusPage = window.location.pathname.includes('/focus');
  if (isFocusPage) {
    applyTheme('light');
    return;
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  applyTheme(savedTheme);

  // Wire up theme toggle buttons cleanly
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    };
  });
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (document.body) {
    document.body.setAttribute('data-theme', theme);
  }

  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach(btn => {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    btn.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    btn.innerHTML = isDark
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  });
}

// 2. Global Navigation Scrolling Behavior
export function initNavigation() {
  const nav = document.querySelector('.orbit-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-drawer');
  if (mobileBtn && drawer) {
    mobileBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });
  }
}

// 3. Shared Mock Data Store (Synchronizes Calendar & To-Do across sessions & wellbeing stress meter)
const TODO_STORAGE_KEY = 'orbit_todo_tasks';
const CALENDAR_STORAGE_KEY = 'orbit_calendar_events';
const MOOD_STORAGE_KEY = 'orbit_mood_log';

export const OrbitStore = {
  getTodos() {
    const data = localStorage.getItem(TODO_STORAGE_KEY);
    if (!data) {
      const defaultTodos = [
        { id: '1', text: 'Read Biology Chapter 4 summary', completed: false, tag: 'Study' },
        { id: '2', text: 'Submit Computer Science lab draft', completed: true, tag: 'Urgent' },
        { id: '3', text: '30-minute afternoon walk & hydrate', completed: false, tag: 'Wellbeing' }
      ];
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(defaultTodos));
      return defaultTodos;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTodos(todos) {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    window.dispatchEvent(new CustomEvent('orbit:data_updated'));
  },

  getEvents() {
    const data = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!data) {
      const todayStr = new Date().toISOString().split('T')[0];
      const defaultEvents = [
        { id: 'e1', date: todayStr, time: '10:00 AM', title: 'Calculus Midterm Review', completed: false },
        { id: 'e2', date: todayStr, time: '02:30 PM', title: 'Group Project Sync', completed: true },
        { id: 'e3', date: '2026-01-12', time: '09:00 AM', title: 'Spring Semester Classes Begin', completed: true },
        { id: 'e4', date: '2026-02-14', time: '11:59 PM', title: 'Computer Science Assignment 1', completed: true },
        { id: 'e5', date: '2026-03-16', time: '10:00 AM', title: 'Physics Midterm Exam', completed: true },
        { id: 'e6', date: '2026-04-06', time: 'All Day', title: 'Spring Break Week', completed: true },
        { id: 'e7', date: '2026-05-18', time: '01:00 PM', title: 'Final Examinations Begin', completed: true },
        { id: 'e8', date: '2026-06-01', time: 'All Day', title: 'Summer Research Internship', completed: false },
        { id: 'e9', date: '2026-09-01', time: '09:00 AM', title: 'Fall Semester Orientation', completed: false },
        { id: 'e10', date: '2026-10-15', time: '11:59 PM', title: 'AI Capstone Milestone Submission', completed: false },
        { id: 'e11', date: '2026-11-26', time: 'All Day', title: 'Thanksgiving Break', completed: false },
        { id: 'e12', date: '2026-12-14', time: '09:00 AM', title: 'Fall Term Final Exams', completed: false }
      ];
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(defaultEvents));
      return defaultEvents;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveEvents(events) {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent('orbit:data_updated'));
  },

  getMood() {
    return localStorage.getItem(MOOD_STORAGE_KEY) || 'neutral';
  },

  saveMood(mood) {
    localStorage.setItem(MOOD_STORAGE_KEY, mood);
    window.dispatchEvent(new CustomEvent('orbit:data_updated'));
  }
};
