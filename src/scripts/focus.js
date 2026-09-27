import { initTheme } from '../utils/orbitCore.js';

let studyDuration = 25 * 60; // in seconds
let breakDuration = 5 * 60;
let timeLeft = studyDuration;
let totalDuration = studyDuration;
let timerMode = 'study'; // 'study' or 'break'
let isRunning = false;
let timerInterval = null;
let currentSession = 1;
const maxSessions = 4;

function bootstrapFocus() {
  initTheme();
  updateDisplay();
  setupEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapFocus);
} else {
  bootstrapFocus();
}

function setupEvents() {
  const startBtn = document.getElementById('timer-start-btn');
  const resetBtn = document.getElementById('timer-reset-btn');

  startBtn?.addEventListener('click', () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  resetBtn?.addEventListener('click', resetTimer);

  // Preset buttons
  document.getElementById('preset-25-5')?.addEventListener('click', () => {
    setPreset(25, 5, 'preset-25-5');
  });

  document.getElementById('preset-50-10')?.addEventListener('click', () => {
    setPreset(50, 10, 'preset-50-10');
  });

  // Custom durations toggle
  const customToggle = document.getElementById('custom-toggle');
  const customInputs = document.getElementById('custom-inputs-wrap');
  customToggle?.addEventListener('click', () => {
    customInputs.classList.toggle('open');
  });

  document.getElementById('apply-custom-btn')?.addEventListener('click', () => {
    const studyVal = parseInt(document.getElementById('custom-study-input').value, 10) || 25;
    const breakVal = parseInt(document.getElementById('custom-break-input').value, 10) || 5;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    setPreset(studyVal, breakVal, null);
    customInputs.classList.remove('open');
  });
}

function setPreset(studyMins, breakMins, btnId) {
  pauseTimer();
  studyDuration = studyMins * 60;
  breakDuration = breakMins * 60;
  timerMode = 'study';
  timeLeft = studyDuration;
  totalDuration = studyDuration;

  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btnId) document.getElementById(btnId)?.classList.add('active');

  updateDisplay();
}

function startTimer() {
  isRunning = true;
  const startBtn = document.getElementById('timer-start-btn');
  startBtn.textContent = 'Pause';
  startBtn.style.background = '#F97316'; // Coral when running

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      handleSessionComplete();
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  const startBtn = document.getElementById('timer-start-btn');
  startBtn.textContent = 'Start';
  startBtn.style.background = '#0891B2';
}

function resetTimer() {
  pauseTimer();
  timerMode = 'study';
  timeLeft = studyDuration;
  totalDuration = studyDuration;
  currentSession = 1;
  updateDisplay();
}

function handleSessionComplete() {
  pauseTimer();
  
  // Visual pulse / chime cue
  document.body.classList.add('flash-cue');
  setTimeout(() => document.body.classList.remove('flash-cue'), 1000);

  // Switch session mode
  if (timerMode === 'study') {
    timerMode = 'break';
    timeLeft = breakDuration;
    totalDuration = breakDuration;
  } else {
    timerMode = 'study';
    currentSession = currentSession >= maxSessions ? 1 : currentSession + 1;
    timeLeft = studyDuration;
    totalDuration = studyDuration;
  }

  updateDisplay();
  startTimer(); // Auto-switch next session
}

function updateDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const digitsElem = document.getElementById('timer-digits');
  const labelElem = document.getElementById('timer-mode-label');
  const counterElem = document.getElementById('timer-session-counter');
  const ringProgress = document.getElementById('timer-ring-progress');

  if (digitsElem) digitsElem.textContent = timeFormatted;
  if (labelElem) {
    labelElem.textContent = timerMode === 'study' ? 'Study Focus' : 'Rest Break';
    labelElem.style.color = timerMode === 'study' ? '#0891B2' : '#16A34A';
  }
  if (counterElem) {
    counterElem.textContent = `Session ${currentSession} of ${maxSessions}`;
  }

  if (ringProgress) {
    const circumference = 2 * Math.PI * 135; // r = 135
    const fraction = totalDuration > 0 ? timeLeft / totalDuration : 0;
    const offset = circumference - (fraction * circumference);
    ringProgress.style.strokeDasharray = `${circumference}`;
    ringProgress.style.strokeDashoffset = `${offset}`;
    ringProgress.style.stroke = timerMode === 'study' ? '#0891B2' : '#16A34A';
  }

  document.title = `(${timeFormatted}) Orbit Focus Timer`;
}
