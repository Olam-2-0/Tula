import { initTheme, OrbitStore } from '../utils/orbitCore.js';

const TINTS = ['tint-yellow', 'tint-pink', 'tint-green', 'tint-blue'];

function bootstrapTodo() {
  initTheme();
  renderNotes();

  const form = document.getElementById('todo-form');
  const input = document.getElementById('new-task-input');

  function handleAddTask(e) {
    if (e) e.preventDefault();
    const text = input ? input.value.trim() : '';
    if (!text) return;

    const todos = OrbitStore.getTodos();
    const tint = TINTS[Math.floor(Math.random() * TINTS.length)];

    todos.unshift({
      id: 't_' + Date.now(),
      text,
      completed: false,
      tint
    });

    OrbitStore.saveTodos(todos);
    if (input) input.value = '';
    renderNotes();
  }

  form?.addEventListener('submit', handleAddTask);
  document.getElementById('add-task-btn')?.addEventListener('click', handleAddTask);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapTodo);
} else {
  bootstrapTodo();
}

function renderNotes() {
  const container = document.getElementById('notes-grid');
  if (!container) return;

  const todos = OrbitStore.getTodos();

  if (todos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: var(--text-muted);">
        <p style="font-size: 1.1rem;">Your desk is clean! Add a sticky note above to capture your next task.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  todos.forEach((todo, idx) => {
    const tint = todo.tint || TINTS[idx % TINTS.length];
    const card = document.createElement('div');
    card.className = `sticky-note ${tint} ${todo.completed ? 'completed' : ''}`;

    card.innerHTML = `
      <div class="note-text">${escapeHtml(todo.text)}</div>
      <div class="note-bottom">
        <label class="note-checkbox-wrap">
          <input type="checkbox" class="note-checkbox" ${todo.completed ? 'checked' : ''}>
          <span style="font-size: 0.85rem; font-weight: 500;">${todo.completed ? 'Done' : 'Mark done'}</span>
        </label>
        <button class="note-delete-btn" aria-label="Delete note" title="Delete note">&times;</button>
      </div>
    `;

    // Checkbox toggle with strike-through & dim
    const checkbox = card.querySelector('.note-checkbox');
    checkbox.addEventListener('change', () => {
      todo.completed = checkbox.checked;
      OrbitStore.saveTodos(todos);
      renderNotes();
    });

    // Delete note
    const delBtn = card.querySelector('.note-delete-btn');
    delBtn.addEventListener('click', () => {
      const updated = todos.filter(t => t.id !== todo.id);
      OrbitStore.saveTodos(updated);
      renderNotes();
    });

    container.appendChild(card);
  });
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
