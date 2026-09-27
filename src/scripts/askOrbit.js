import { initTheme, OrbitStore } from '../utils/orbitCore.js';

let conversationStep = 1; // 1: asking deadline, 2: asking tasks, 3: breakdown generated
let savedDeadline = null;
let savedTasks = [];

function bootstrapAskOrbit() {
  initTheme();
  setupChat();

  const urlParams = new URLSearchParams(window.location.search);
  const isGentleMode = urlParams.get('mode') === 'wellbeing';

  if (isGentleMode) {
    appendOrbitMessage("Hey there. Take a gentle breath. You're doing the best you can, and that's already enough. When you're ready, tell me what deadline or assignment is feeling heavy on your shoulders right now.");
  } else {
    appendOrbitMessage("Hi! I'm here to help you de-stress your workload. Let's make a calm, doable plan together.\n\nFirst: **What's the deadline for this?** (e.g. In 5 days, Next Friday, or October 15th)");
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapAskOrbit);
} else {
  bootstrapAskOrbit();
}

function setupChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-user-input');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = '';

    handleConversationFlow(text);
  });
}

function handleConversationFlow(userText) {
  if (conversationStep === 1) {
    savedDeadline = userText;
    conversationStep = 2;
    setTimeout(() => {
      appendOrbitMessage(`Got it, deadline is noted (${userText}).\n\nNow, **what all needs to get done before then?** You can list tasks separated by commas or sentences (e.g. read chapters 3-5, write essay outline, code API endpoint, proofread).`);
    }, 450);
  } else if (conversationStep === 2) {
    savedTasks = parseTasks(userText);
    conversationStep = 3;

    setTimeout(() => {
      generateBreakdown(savedDeadline, savedTasks);
    }, 600);
  } else {
    // Follow-up interaction
    setTimeout(() => {
      appendOrbitMessage("I've saved these action steps! Would you like me to add these tasks to your **Cute Notes To-Do list**? Type **yes** to import them, or feel free to adjust the timeline.");
    }, 450);

    if (userText.toLowerCase().includes('yes')) {
      const todos = OrbitStore.getTodos();
      savedTasks.forEach(task => {
        todos.unshift({
          id: 't_ai_' + Math.random().toString(36).substr(2, 9),
          text: task,
          completed: false
        });
      });
      OrbitStore.saveTodos(todos);
      setTimeout(() => {
        appendOrbitMessage("Done! ✨ All breakdown steps are now imported into your To-Do list. You can head to /todo anytime to start checking them off!");
      }, 700);
    }
  }
}

function parseTasks(inputStr) {
  // Split by commas, newlines, or bullets
  let items = inputStr.split(/[\n,;]+/).map(t => t.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean);
  if (items.length === 0) items = [inputStr];
  return items;
}

function generateBreakdown(deadlineStr, tasks) {
  // Rule-based sensible time-distribution
  let daysEstimate = 5;
  const numMatch = deadlineStr.match(/\d+/);
  if (numMatch) {
    daysEstimate = Math.max(2, Math.min(30, parseInt(numMatch[0], 10)));
  }

  const taskCount = tasks.length;
  let breakdownHtml = `<p>You've got roughly <strong>${daysEstimate} days</strong> left. Here is a clear, manageable plan to split your work so you never have to cram at 3 AM:</p><div class="breakdown-plan-box">`;

  if (taskCount === 1) {
    const half = Math.ceil(daysEstimate / 2);
    breakdownHtml += `
      <div class="breakdown-step"><strong>Days 1–${half}:</strong> Research, gather sources, and complete initial draft of <em>${tasks[0]}</em>.</div>
      <div class="breakdown-step"><strong>Days ${half + 1}–${daysEstimate - 1}:</strong> Refine, revise key sections, and verify requirements.</div>
      <div class="breakdown-step"><strong>Day ${daysEstimate}:</strong> Final review, polish formatting, and submit with peace of mind.</div>
    `;
  } else {
    const daysPerTask = Math.max(1, Math.floor(daysEstimate / taskCount));
    let currentDay = 1;
    tasks.forEach((t, i) => {
      const endDay = i === tasks.length - 1 ? daysEstimate : Math.min(daysEstimate, currentDay + daysPerTask - 1);
      const dayRange = currentDay === endDay ? `Day ${currentDay}` : `Days ${currentDay}–${endDay}`;
      breakdownHtml += `<div class="breakdown-step"><strong>${dayRange}:</strong> ${t}</div>`;
      currentDay = endDay + 1;
    });
  }

  breakdownHtml += `</div><p style="margin-top: 0.75rem;">Remember: Momentum comes from taking the smallest first step. You've got this!</p>`;

  appendOrbitMessage(breakdownHtml, true);
}

function appendUserMessage(text) {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.textContent = text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function appendOrbitMessage(content, isHtml = false) {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble orbit';
  if (isHtml) {
    bubble.innerHTML = content;
  } else {
    bubble.innerHTML = escapeHtml(content).replace(/\n/g, '<br>');
  }
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
