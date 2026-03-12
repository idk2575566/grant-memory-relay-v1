const KEY = 'grant-memory-relay-v1-notes';
const COACH = 'Coach Milo';

const priorityRank = { high: 0, medium: 1, low: 2 };

const categoryIcons = {
  'Kids (Finley & Harrison)': '🧒',
  'Chloe Friends': '🫶',
  'Couple Friends': '🥂',
  Work: '💼',
  'Things We Do': '🎯',
  Personal: '✨',
  Family: '🏡',
  Health: '💪',
  Errands: '🛒',
  Other: '🗂️'
};

const els = {
  form: document.getElementById('note-form'),
  text: document.getElementById('note-text'),
  due: document.getElementById('note-due'),
  category: document.getElementById('note-category'),
  priority: document.getElementById('note-priority'),
  categoryCtas: document.getElementById('category-ctas'),
  notesList: document.getElementById('notes-list'),
  notesEmpty: document.getElementById('notes-empty'),
  openCount: document.getElementById('open-count'),
  top3List: document.getElementById('top3-list'),
  top3Empty: document.getElementById('top3-empty'),
  digest: document.getElementById('digest-box'),
  toast: document.getElementById('toast')
};

let notes = loadNotes();
render();

els.categoryCtas.addEventListener('click', (e) => {
  const button = e.target.closest('.btn-cta');
  if (!button) return;
  els.category.value = button.dataset.category;
  els.priority.value = button.dataset.priority || 'medium';
  toast(`Set: ${categoryChip(button.dataset.category)} • ${capitalize(els.priority.value)}`);
});

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = els.text.value.trim();
  if (!text) return;

  notes.push({
    id: crypto.randomUUID(),
    text,
    due: els.due.value || null,
    category: els.category.value,
    priority: els.priority.value,
    done: false,
    createdAt: Date.now()
  });

  persist();
  els.form.reset();
  els.priority.value = 'medium';
  toast(`${COACH}: locked in. Keep momentum.`);
  render();
  els.text.focus();
});

function loadNotes() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

function sortOpen(arr) {
  return [...arr].sort((a, b) => {
    const aDue = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY;
    const bDue = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY;
    if (aDue !== bDue) return aDue - bDue;
    if (priorityRank[a.priority] !== priorityRank[b.priority]) {
      return priorityRank[a.priority] - priorityRank[b.priority];
    }
    return b.createdAt - a.createdAt;
  });
}

function render() {
  const open = sortOpen(notes.filter(n => !n.done));

  els.notesList.innerHTML = '';
  els.notesEmpty.style.display = open.length ? 'none' : 'block';
  els.openCount.textContent = `${open.length} open`;

  for (const n of open) {
    const li = document.createElement('li');
    li.className = 'note';
    li.innerHTML = `
      <div class="note-main"></div>
      <div class="note-meta"></div>
      <div class="note-actions">
        <a class="btn-calendar" href="${buildCalendarUrl(n)}" target="_blank" rel="noopener noreferrer">📅 Calendar</a>
        <button class="btn-done" data-action="done">✅ Done</button>
        <button class="btn-snooze" data-action="snooze">⏰ +1 day</button>
        <button class="btn-delete" data-action="delete">🗑️ Delete</button>
      </div>
    `;

    li.querySelector('.note-main').textContent = n.text;
    const metaBits = [
      categoryChip(n.category),
      `⚡ ${capitalize(n.priority)}`,
      n.due ? `🗓️ ${formatDate(n.due)}` : 'No due date'
    ];
    li.querySelector('.note-meta').textContent = metaBits.join(' • ');

    li.querySelector('.note-actions').addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      if (!action) return;
      handleAction(n.id, action);
    });

    els.notesList.appendChild(li);
  }

  renderTop3(open);
  renderDigest(open);
}

function handleAction(id, action) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  if (action === 'done') {
    note.done = true;
    toast(`${COACH}: good close.`);
  }

  if (action === 'snooze') {
    const base = note.due ? new Date(note.due) : new Date();
    base.setDate(base.getDate() + 1);
    note.due = toDateInput(base);
    toast(`${COACH}: nudged to tomorrow.`);
  }

  if (action === 'delete') {
    if (!confirm('Delete this note?')) return;
    notes = notes.filter(n => n.id !== id);
    toast('Removed. Keep the list clean.');
  }

  persist();
  render();
}

function renderTop3(open) {
  els.top3List.innerHTML = '';
  const top = open.slice(0, 3);
  els.top3Empty.style.display = top.length ? 'none' : 'block';
  for (const n of top) {
    const li = document.createElement('li');
    li.className = 'note';
    li.innerHTML = `<div class="note-main"></div><div class="note-meta"></div>`;
    li.querySelector('.note-main').textContent = n.text;
    li.querySelector('.note-meta').textContent = `${categoryChip(n.category)} • ${capitalize(n.priority)}${n.due ? ` • due ${formatDate(n.due)}` : ''}`;
    els.top3List.appendChild(li);
  }
}

function renderDigest(open) {
  const today = new Date();
  const dueToday = open.filter(n => n.due === toDateInput(today)).length;
  const high = open.filter(n => n.priority === 'high').length;
  const next = open[0];

  els.digest.innerHTML = `
    <strong>${COACH} check-in:</strong><br>
    • Open: ${open.length}<br>
    • High focus: ${high}<br>
    • Due today: ${dueToday}<br>
    • Next move: ${next ? escapeHtml(next.text) : 'You’re clear. Protect that.'}
  `;
}

function categoryChip(category) {
  return `${categoryIcons[category] || '🗂️'} ${category}`;
}

function buildCalendarUrl(note) {
  const text = note.text;
  const details = `Created in Grant Memory Relay\nCategory: ${note.category}\nPriority: ${capitalize(note.priority)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text,
    details
  });

  if (note.due) {
    const start = note.due.replaceAll('-', '');
    const end = addDaysToDateInput(note.due, 1).replaceAll('-', '');
    params.set('dates', `${start}/${end}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function addDaysToDateInput(value, days) {
  const d = new Date(`${value}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => els.toast.classList.remove('show'), 1700);
}

function formatDate(value) {
  const d = new Date(value + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function toDateInput(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
