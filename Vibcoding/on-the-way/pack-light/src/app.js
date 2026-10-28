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
const templates = {
  Weekend: [
    'ID / passport',
    'Wallet',
    'Phone and charger',
    'Underwear',
    'Two outfits',
    'Toiletries',
    'Medication',
    'Reusable water bottle',
  ],
  Beach: [
    'ID / passport',
    'Phone and charger',
    'Swimwear',
    'Sunscreen',
    'Hat',
    'Beach towel',
    'Sandals',
    'Water bottle',
  ],
  Business: [
    'ID / passport',
    'Work documents',
    'Laptop and charger',
    'Phone and charger',
    'Business outfit',
    'Toiletries',
    'Medication',
  ],
  Camping: [
    'Tent',
    'Sleeping bag',
    'Sleeping mat',
    'Water',
    'Food',
    'Headlamp',
    'First aid kit',
    'Weather-appropriate clothes',
  ],
};
const valid = (x) =>
  x &&
  typeof x.trip === 'string' &&
  x.trip.length <= 100 &&
  Array.isArray(x.items) &&
  x.items.length <= 300 &&
  new Set(x.items.map((i) => i?.id)).size === x.items.length &&
  x.items.every(
    (i) =>
      i &&
      typeof i.id === 'string' &&
      typeof i.text === 'string' &&
      i.text.trim() &&
      i.text.length <= 120 &&
      typeof i.done === 'boolean',
  );
const db = store('pack-light', { trip: 'My next trip', items: [] }, valid);
function render() {
  const data = db.get(),
    done = data.items.filter((x) => x.done).length;
  const type = select('trip-type', Object.keys(templates), 'Weekend');
  const choose = row(
    field('Trip template', type),
    button('Load template', () =>
      confirmed('Replace your current list with this template?', () => {
        db.set({
          trip: type.value,
          items: templates[type.value].map((text) => ({
            id: id(),
            text,
            done: false,
          })),
        });
        render();
      }),
    ),
  );
  const add = form(
    [
      field(
        'Add an item',
        input('item', '', {
          required: true,
          maxlength: 120,
          placeholder: 'Something you always forget…',
        }),
      ),
    ],
    (values) => {
      const text = values.get('item').trim();
      if (!text) throw new Error('Enter an item.');
      if (data.items.length >= 300)
        throw new Error('Keep the list under 300 items.');
      db.set({
        ...data,
        items: [...data.items, { id: id(), text, done: false }],
      });
      render();
    },
    'Add item',
  );
  const list = el(
    'ul',
    { class: 'item-list' },
    data.items.map((item) => {
      const checkbox = input(`check-${item.id}`, '', {
        type: 'checkbox',
        checked: item.done,
        'aria-label': `Packed: ${item.text}`,
      });
      checkbox.addEventListener('change', () => {
        db.set({
          ...data,
          items: data.items.map((x) =>
            x.id === item.id ? { ...x, done: checkbox.checked } : x,
          ),
        });
        render();
      });
      return el(
        'li',
        { class: `item ${item.done ? 'done' : ''}` },
        checkbox,
        el('span', { class: 'item-text' }, item.text),
        button(
          'Remove',
          () => {
            db.set({
              ...data,
              items: data.items.filter((x) => x.id !== item.id),
            });
            render();
          },
          'small',
          { 'aria-label': `Remove ${item.text}` },
        ),
      );
    }),
  );
  root.replaceChildren(
    el(
      'div',
      { class: 'grid' },
      panel(
        'Plan a lighter trip',
        choose,
        add,
        hint(
          'Templates are a starting point. Add personal essentials and check destination requirements.',
        ),
      ),
      panel(
        data.trip,
        el('h3', {}, `${done} of ${data.items.length} packed`),
        el('progress', {
          class: 'progress',
          value: done,
          max: Math.max(1, data.items.length),
          'aria-label': 'Packing progress',
        }),
        row(
          button('Uncheck all', () => {
            db.set({
              ...data,
              items: data.items.map((x) => ({ ...x, done: false })),
            });
            render();
          }),
          button('Print checklist', () => window.print()),
        ),
      ),
    ),
    panel(
      'Your packing list',
      data.items.length
        ? list
        : empty('Load a template or add your own essentials.'),
    ),
    panel(
      'Backup and reset',
      row(
        button('Export list', () => exportJSON('pack-light.json', db.get())),
        button(
          'Clear list',
          () =>
            confirmed('Delete your packing list?', () => {
              db.clear();
              render();
            }),
          'danger',
        ),
      ),
      importJSON('Restore packing list', valid, (next) => {
        db.set(next);
        render();
      }),
    ),
  );
}
render();
