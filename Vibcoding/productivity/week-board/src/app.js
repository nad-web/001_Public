import {
  root,
  el,
  button,
  input,
  field,
  select,
  panel,
  row,
  form,
  store,
  id,
  exportJSON,
  importJSON,
  confirmed,
  empty,
  hint,
  report,
} from '../../../shared/js/shell.js';
const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const valid = (x) =>
  Array.isArray(x) &&
  x.length <= 300 &&
  new Set(x.map((t) => t?.id)).size === x.length &&
  x.every(
    (t) =>
      t &&
      typeof t.id === 'string' &&
      typeof t.text === 'string' &&
      t.text.trim() &&
      t.text.length <= 160 &&
      Number.isInteger(t.day) &&
      t.day >= 0 &&
      t.day < 7 &&
      typeof t.done === 'boolean',
  );
const db = store('week-board', [], valid);
let editing = null;
function move(taskId, day) {
  db.set(db.get().map((t) => (t.id === taskId ? { ...t, day } : t)));
  render();
}
function render() {
  const tasks = db.get();
  const current = tasks.find((t) => t.id === editing);
  const dayOptions = days.map((d, i) => [i, d]);
  const editor = form(
    [
      row(
        field(
          'Task',
          input('task', current?.text || '', {
            required: true,
            maxlength: 160,
          }),
        ),
        field(
          'Day',
          select(
            'day',
            dayOptions,
            current?.day ?? (new Date().getDay() + 6) % 7,
          ),
        ),
      ),
    ],
    (data) => {
      const text = data.get('task').trim();
      if (!text) throw new Error('Enter a task.');
      if (!editing && tasks.length >= 300)
        throw new Error('Task limit reached.');
      const day = Number(data.get('day'));
      db.set(
        editing
          ? tasks.map((t) => (t.id === editing ? { ...t, text, day } : t))
          : [...tasks, { id: id(), text, day, done: false }],
      );
      editing = null;
      render();
    },
    editing ? 'Save task' : 'Add task',
  );
  const columns = days.map((day, index) => {
    const items = tasks.filter((t) => t.day === index);
    const section = el(
      'section',
      {
        class: 'day-column',
        'aria-label': day,
        ondragover: (e) => e.preventDefault(),
        ondrop: (e) => {
          e.preventDefault();
          const taskId = e.dataTransfer.getData('text/plain');
          if (tasks.some((t) => t.id === taskId)) move(taskId, index);
        },
      },
      el(
        'h3',
        {},
        `${day} · ${items.filter((t) => t.done).length}/${items.length}`,
      ),
    );
    for (const task of items) {
      const check = input(`task-${task.id}`, '', {
        type: 'checkbox',
        checked: task.done,
        'aria-label': `Complete ${task.text}`,
      });
      check.addEventListener('change', () => {
        db.set(
          tasks.map((t) =>
            t.id === task.id ? { ...t, done: check.checked } : t,
          ),
        );
        render();
      });
      const destination = select(`move-${task.id}`, dayOptions, index);
      destination.setAttribute('aria-label', `Move ${task.text} to day`);
      destination.addEventListener('change', () =>
        move(task.id, Number(destination.value)),
      );
      section.append(
        el(
          'article',
          {
            class: `item ${task.done ? 'done' : ''}`,
            draggable: 'true',
            ondragstart: (e) => e.dataTransfer.setData('text/plain', task.id),
          },
          check,
          el('span', { class: 'item-text' }, task.text),
          destination,
          row(
            button(
              'Edit',
              () => {
                editing = task.id;
                render();
                document.querySelector('#task').focus();
              },
              'small',
              { 'aria-label': `Edit ${task.text}` },
            ),
            button(
              'Delete',
              () => {
                db.set(tasks.filter((t) => t.id !== task.id));
                if (editing === task.id) editing = null;
                render();
              },
              'small',
              { 'aria-label': `Delete ${task.text}` },
            ),
          ),
        ),
      );
    }
    if (!items.length) section.append(hint('A little breathing room.'));
    return section;
  });
  root.replaceChildren(
    panel(
      editing ? 'Edit task' : 'Make room for what matters',
      editor,
      editing
        ? button('Cancel edit', () => {
            editing = null;
            render();
          })
        : null,
      hint(
        'Move tasks with their day menu on any device, or drag cards on desktop. This is a reusable week board; it does not schedule reminders.',
      ),
    ),
    el('div', { class: 'week-grid' }, columns),
    panel(
      'Your week, your data',
      row(
        button('Export board', () => exportJSON('week-board.json', db.get())),
        button(
          'Clear board',
          () =>
            confirmed('Delete all tasks from this board?', () => {
              db.clear();
              editing = null;
              render();
            }),
          'danger',
        ),
      ),
      importJSON('Restore board JSON', valid, (next) => {
        db.set(next);
        editing = null;
        render();
      }),
    ),
  );
}
render();
