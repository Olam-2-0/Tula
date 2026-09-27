import confetti from 'canvas-confetti';
import { initTheme, initNavigation } from '../utils/orbitCore.js';

function bootstrapHome() {
  initTheme();
  initNavigation();
  initStars();
  initOdometer();
  initCoreOrbitalNodes();
  initCard3DTilt();
  initEarlyAccessForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapHome);
} else {
  bootstrapHome();
}

// 1. Dynamic Star Generator for Hero Background
function initStars() {
  const container = document.getElementById('stars-container');
  if (!container) return;

  const STAR_COUNT = 35;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1.5;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
    star.style.animationDelay = `${Math.random() * 2}s`;
    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

// 2. Odometer Rolling Counter Animation for 1,409
function initOdometer() {
  const odoContainer = document.getElementById('waitlist-odometer');
  if (!odoContainer) return;

  const targetStr = "1409";
  odoContainer.innerHTML = '';

  const columns = [];
  for (let i = 0; i < targetStr.length; i++) {
    if (i === 1) {
      // Add comma
      const comma = document.createElement('span');
      comma.textContent = ',';
      comma.style.margin = '0 1px';
      odoContainer.appendChild(comma);
    }
    const digitWrap = document.createElement('span');
    digitWrap.className = 'odometer-digit';

    const ribbon = document.createElement('span');
    ribbon.className = 'odometer-ribbon';
    // digits 0 through 9
    for (let d = 0; d <= 9; d++) {
      const numSpan = document.createElement('span');
      numSpan.textContent = d;
      ribbon.appendChild(numSpan);
    }
    digitWrap.appendChild(ribbon);
    odoContainer.appendChild(digitWrap);
    columns.push({ ribbon, target: parseInt(targetStr[i], 10) });
  }

  // Trigger odometer spin on intersection or load
  const triggerSpin = () => {
    columns.forEach((col, idx) => {
      setTimeout(() => {
        col.ribbon.style.transform = `translateY(-${col.target * 10}%)`;
      }, idx * 100);
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(triggerSpin, 150);
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(odoContainer);
  } else {
    setTimeout(triggerSpin, 200);
  }
}

// 3. Card 3D Subtle Tilt on Cursor Hover
function initCard3DTilt() {
  const cards = document.querySelectorAll('.interactive-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const tiltX = -(y / (rect.height / 2)) * 6; // max ~6 deg
      const tiltY = (x / (rect.width / 2)) * 6;
      
      card.style.transform = `perspective(1000px) translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) translateY(0deg) rotateX(0deg) rotateY(0deg)';
    });
  });
}

// 4. Interactive Gamified Orbit Visualization (Slide 3)
function initCoreOrbitalNodes() {
  const container = document.getElementById('orbit-bubbles-container');
  if (!container) return;

  const CATEGORY_MAP = {
    assignments: {
      states: [
        { icon: '📄', label: 'Assignments' },
        { icon: '📄', label: '2 tasks due' },
        { icon: '📝', label: 'Math Lab • Due 5 PM' },
        { icon: '💻', label: 'CS Lab Draft • Done' }
      ],
      stateIndex: 0
    },
    habits: {
      states: [
        { icon: '🌱', label: 'Habits' },
        { icon: '🔥', label: '3 day streak' },
        { icon: '💧', label: 'Water • 2/3L' },
        { icon: '🧘', label: '10m Meditation' }
      ],
      stateIndex: 0
    },
    timetable: {
      states: [
        { icon: '📅', label: 'Timetable' },
        { icon: '⏰', label: 'Next • Java • 10:00 AM' },
        { icon: '🏫', label: 'Physics Lab • Room 302' },
        { icon: '📚', label: 'Library Study • 4:00 PM' }
      ],
      stateIndex: 0
    },
    exams: {
      states: [
        { icon: '🎯', label: 'Exams' },
        { icon: '🎯', label: '2 exams this week' },
        { icon: '📖', label: 'CS Midterm • Friday' },
        { icon: '⚡', label: 'Series Prep • 85%' }
      ],
      stateIndex: 0
    },
    wellbeing: {
      states: [
        { icon: '💜', label: 'Well-being' },
        { icon: '😴', label: 'Sleep • 7h 20m' },
        { icon: '🌿', label: 'Stress level • Low' },
        { icon: '✨', label: 'Mindset • Focused' }
      ],
      stateIndex: 0
    }
  };

  // Synthesize Web Audio API pop sound on click
  function playSatisfyingPopSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!window.orbitAudioCtx) {
        window.orbitAudioCtx = new AudioContextClass();
      }
      const ctx = window.orbitAudioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  const bubbles = container.querySelectorAll('.orbit-pill-bubble');
  bubbles.forEach(bubble => {
    const id = bubble.getAttribute('data-id');
    const catData = CATEGORY_MAP[id];
    if (!catData) return;

    const iconSpan = bubble.querySelector('.bubble-icon');
    const labelSpan = bubble.querySelector('.bubble-label');

    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      playSatisfyingPopSound();

      // 1. Pop out animation
      bubble.classList.add('bubble-popping');

      // 2. Confetti micro-burst
      try {
        if (typeof confetti === 'function') {
          const rect = bubble.getBoundingClientRect();
          confetti({
            particleCount: 22,
            spread: 45,
            startVelocity: 15,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight
            },
            colors: ['#22D3EE', '#8B5CF6', '#FB923C', '#FFFFFF'],
            ticks: 50,
            disableForReducedMotion: true
          });
        }
      } catch (err) {}

      // 3. After pop-out, cycle state & trigger pop-in animation
      setTimeout(() => {
        catData.stateIndex = (catData.stateIndex + 1) % catData.states.length;
        const nextState = catData.states[catData.stateIndex];
        if (iconSpan) iconSpan.textContent = nextState.icon;
        if (labelSpan) labelSpan.textContent = nextState.label;

        bubble.classList.remove('bubble-popping');
        bubble.classList.add('bubble-popping-in');

        setTimeout(() => {
          bubble.classList.remove('bubble-popping-in');
        }, 350);
      }, 220);
    });
  });
}

// 5. Early Access Form Handling
function initEarlyAccessForm() {
  const form = document.getElementById('early-access-form');
  const confirmation = document.getElementById('early-access-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Securing spot...';

    setTimeout(() => {
      form.style.display = 'none';
      confirmation.style.display = 'block';

      // Celebratory bubble-pop confetti burst
      try {
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22D3EE', '#8B5CF6', '#FB923C', '#34D399']
          });
        }
      } catch (err) {}
    }, 700);
  });
}
