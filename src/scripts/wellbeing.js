import { initTheme, OrbitStore } from '../utils/orbitCore.js';

const MOOD_SCORES = {
  great: 10,    // 😄
  good: 25,     // 🙂
  neutral: 45,  // 😐
  stressed: 70, // 😣
  overwhelmed: 90 // 😫
};

function bootstrapWellbeing() {
  initTheme();
  setupMoodCheckin();
  calculateAndRenderStress();
  setupQuickExit();

  window.addEventListener('orbit:data_updated', () => {
    calculateAndRenderStress();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapWellbeing);
} else {
  bootstrapWellbeing();
}

function setupMoodCheckin() {
  const currentMood = OrbitStore.getMood();
  const moodBtns = document.querySelectorAll('.mood-btn');

  moodBtns.forEach(btn => {
    const moodKey = btn.getAttribute('data-mood');
    if (moodKey === currentMood) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      OrbitStore.saveMood(moodKey);
      calculateAndRenderStress();
    });
  });
}

function calculateAndRenderStress() {
  const currentMood = OrbitStore.getMood() || 'neutral';
  const moodBase = MOOD_SCORES[currentMood] || 45;

  // Real outstanding workload calculation from store
  const uncompletedTodos = OrbitStore.getTodos().filter(t => !t.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const uncompletedEvents = OrbitStore.getEvents().filter(e => e.date === todayStr && !e.completed).length;

  const totalPending = uncompletedTodos + uncompletedEvents;

  // Formula: Base mood weight (65%) + pending workload impact (35%)
  // Capped at 100%
  const workloadImpact = Math.min(45, totalPending * 7);
  const stressIndex = Math.min(100, Math.round(moodBase * 0.65 + workloadImpact));

  const barFill = document.getElementById('stress-bar-fill');
  const indexDisplay = document.getElementById('stress-index-display');
  const statusLabel = document.getElementById('stress-status-label');
  const pendingCountText = document.getElementById('stress-pending-count');

  if (barFill) barFill.style.width = `${stressIndex}%`;
  if (indexDisplay) indexDisplay.textContent = `${stressIndex}%`;
  if (pendingCountText) pendingCountText.textContent = `${totalPending} pending task${totalPending === 1 ? '' : 's'}`;

  if (statusLabel) {
    if (stressIndex < 35) {
      statusLabel.textContent = "Calm & Grounded 🍃";
      statusLabel.style.color = "#34D399";
    } else if (stressIndex < 65) {
      statusLabel.textContent = "Moderate Pressure ⚡";
      statusLabel.style.color = "#FBBF24";
    } else {
      statusLabel.textContent = "High Academic Load 🚨";
      statusLabel.style.color = "#F87171";
    }
  }
}

function setupQuickExit() {
  document.getElementById('quick-exit-btn')?.addEventListener('click', () => {
    // Immediately navigate away for safety and privacy
    window.location.replace('/');
  });
}
