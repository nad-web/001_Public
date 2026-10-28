import {
  root,
  el,
  button,
  input,
  field,
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
} from '../../../shared/js/shell.js';
import { localDate, recentDates, isDateKey } from '../../../shared/js/logic.js';
const valid = (x) =>
  Array.isArray(x) &&
  x.length <= 30 &&
  new Set(x.map((h) => h?.id)).size === x.length &&
  x.every(
    (h) =>
      h &&
      typeof h.id === 'string' &&
      typeof h.name === 'string' &&
      h.name.trim() &&
      h.name.length <= 100 &&
      Array.isArray(h.days) &&
      h.days.length <= 3660 &&
      h.days.every(isDateKey),
  );
const db = store('habit-garden', [], valid);
function streak(days) {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(localDate(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(localDate(d)) && n < 3660) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
function render() {
  const habits = db.get();
  const dates = recentDates();
  const add = form(
    [
      field(
        'A small habit to nurture',
        input('habit', '', {
          required: true,
          maxlength: 100,
          placeholder: 'Read ten pages',
        }),
      ),
    ],
    (data) => {
      const name = data.get('habit').trim();
      if (!name) throw new Error('Enter a habit.');
      if (habits.length >= 30) throw new Error('Track up to 30 habits.');
      db.set([...habits, { id: id(), name, days: [] }]);
      render();
    },
    'Plant a habit',
  );
  const cards = habits.map((h) =>
    panel(
      h.name,
      hint(
        `${streak(h.days)} day current streak · ${h.days.length} recorded ${h.days.length === 1 ? 'day' : 'days'}`,
      ),
      el(
        'div',
        { class: 'habit-days' },
        dates.map((date) => {
          const done = h.days.includes(date);
          return button(
            el('span', {}, date.slice(5)),
            () => {
              if (!done && h.days.length >= 3660)
                throw new Error(
                  'History limit reached. Export before resetting.',
                );
              db.set(
                habits.map((item) =>
                  item.id === h.id
                    ? {
                        ...item,
                        days: done
                          ? item.days.filter((d) => d !== date)
                          : [...item.days, date],
                      }
                    : item,
                ),
              );
              render();
            },
            `habit-day ${done ? 'checked' : ''}`,
            {
              'aria-label': `${h.name}, ${date}, ${done ? 'completed' : 'not completed'}`,
              'aria-pressed': done,
            },
          );
        }),
      ),
      row(
        button('Mark today', () => {
          const today = localDate();
          db.set(
            habits.map((item) =>
              item.id === h.id
                ? { ...item, days: [...new Set([...item.days, today])] }
                : item,
            ),
          );
          render();
        }),
        button(
          'Remove habit',
          () =>
            confirmed(`Delete ${h.name} and its history?`, () => {
              db.set(habits.filter((item) => item.id !== h.id));
              render();
            }),
          'small',
        ),
      ),
    ),
  );
  root.replaceChildren(
    panel(
      'Grow at your own pace',
      add,
      hint(
        'Tap a day to mark or undo it. Dates use this device’s local calendar. A streak continues from yesterday until you complete today.',
      ),
    ),
    habits.length
      ? el('div', { class: 'grid' }, cards)
      : empty('Your garden starts with one small habit.'),
    panel(
      'Backup and reset',
      row(
        button('Export habits', () =>
          exportJSON('habit-garden.json', db.get()),
        ),
        button(
          'Reset garden',
          () =>
            confirmed('Delete all habits and their history?', () => {
              db.clear();
              render();
            }),
          'danger',
        ),
      ),
      importJSON('Restore habits JSON', valid, (data) => {
        db.set(data);
        render();
      }),
    ),
  );
}
render();
