import {
  root,
  el,
  button,
  input,
  field,
  select,
  panel,
  row,
  stack,
  metric,
  form,
  money,
  store,
  id,
  download,
  exportJSON,
  importJSON,
  confirmed,
  empty,
  report,
} from '../../../shared/js/shell.js';
import { cents, csv, localDate, isDateKey } from '../../../shared/js/logic.js';
const categories = [
  'Housing',
  'Food',
  'Transport',
  'Leisure',
  'Health',
  'Education',
  'Salary',
  'Other',
];
const valid = (data) =>
  Array.isArray(data) &&
  data.length <= 5000 &&
  new Set(data.map((x) => x?.id)).size === data.length &&
  data.every(
    (x) =>
      x &&
      typeof x.id === 'string' &&
      ['income', 'expense'].includes(x.type) &&
      Number.isSafeInteger(x.amount) &&
      x.amount > 0 &&
      x.amount <= 99999999999 &&
      typeof x.note === 'string' &&
      x.note.trim() &&
      x.note.length <= 120 &&
      categories.includes(x.category) &&
      isDateKey(x.date),
  );
const db = store('pocket-budget', [], valid);
let month = localDate().slice(0, 7);
function render() {
  const records = db.get().filter((x) => x.date.startsWith(month));
  const incoming = records
    .filter((x) => x.type === 'income')
    .reduce((s, x) => s + x.amount, 0);
  const outgoing = records
    .filter((x) => x.type === 'expense')
    .reduce((s, x) => s + x.amount, 0);
  const filter = input('month', month, { type: 'month', required: true });
  filter.addEventListener('change', () => {
    if (filter.value) {
      month = filter.value;
      render();
    }
  });
  const totals = el(
    'div',
    { class: 'metrics' },
    metric('Income', money(incoming)),
    metric('Expenses', money(outgoing)),
    metric('Balance', money(incoming - outgoing)),
  );
  const add = form(
    [
      row(
        field('Type', select('type', ['expense', 'income'], 'expense')),
        field(
          'Amount · EUR',
          input('amount', '', {
            inputmode: 'decimal',
            required: true,
            placeholder: '12.50',
          }),
        ),
      ),
      row(
        field('Category', select('category', categories, 'Food')),
        field(
          'Date',
          input('date', localDate(), { type: 'date', required: true }),
        ),
      ),
      field(
        'Description',
        input('note', '', {
          maxlength: 120,
          required: true,
          placeholder: 'What was this for?',
        }),
      ),
    ],
    (data) => {
      if (db.get().length >= 5000)
        throw new Error('Export and clear older records before adding more.');
      const amount = cents(data.get('amount'));
      if (amount === 0) throw new Error('Amount must be greater than zero.');
      db.set([
        ...db.get(),
        {
          id: id(),
          type: data.get('type'),
          amount,
          category: data.get('category'),
          date: data.get('date'),
          note: data.get('note').trim(),
        },
      ]);
      report('Entry saved.');
      render();
    },
    'Add entry',
  );
  const list = el(
    'ul',
    { class: 'item-list' },
    records
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((x) =>
        el(
          'li',
          { class: 'item' },
          el(
            'div',
            { class: 'item-text' },
            el('strong', {}, x.note),
            el('small', {}, `${x.date} · ${x.category}`),
          ),
          el(
            'span',
            { class: 'amount' },
            `${x.type === 'income' ? '+' : '−'}${money(x.amount)}`,
          ),
          button(
            'Delete',
            () =>
              confirmed('Delete this entry?', () => {
                db.set(db.get().filter((item) => item.id !== x.id));
                render();
              }),
            'small',
            { 'aria-label': `Delete ${x.note}` },
          ),
        ),
      ),
  );
  const groups = categories
    .map((category) => [
      category,
      records
        .filter((x) => x.type === 'expense' && x.category === category)
        .reduce((s, x) => s + x.amount, 0),
    ])
    .filter(([, n]) => n);
  const breakdown = groups.length
    ? stack(
        ...groups.map(([category, n]) => {
          const bar = el('span');
          bar.style.width = `${(n / Math.max(1, outgoing)) * 100}%`;
          return el(
            'div',
            { class: 'bar-row' },
            el('span', {}, category),
            el('div', { class: 'bar' }, bar),
            el('strong', {}, money(n)),
          );
        }),
      )
    : empty('Expense categories appear after you add entries.');
  root.replaceChildren(
    panel('Your monthly picture', field('Choose month', filter), totals),
    el(
      'div',
      { class: 'grid' },
      panel('Add a transaction', add),
      panel('Spending by category', breakdown),
    ),
    panel('Transactions', records.length ? list : empty()),
    panel(
      'Your data',
      row(
        button('Export JSON', () => exportJSON('pocket-budget.json', db.get())),
        button('Export CSV', () =>
          download(
            'pocket-budget.csv',
            csv([
              ['Date', 'Type', 'Category', 'Description', 'Amount EUR'],
              ...db
                .get()
                .map((x) => [
                  x.date,
                  x.type,
                  x.category,
                  x.note,
                  (x.amount / 100).toFixed(2),
                ]),
            ]),
            'text/csv;charset=utf-8',
          ),
        ),
        button(
          'Delete all records',
          () =>
            confirmed(
              'Permanently delete all budget records in this browser?',
              () => {
                db.clear();
                render();
              },
            ),
          'danger',
        ),
      ),
      importJSON('Restore JSON backup', valid, (data) => {
        db.set(data);
        render();
      }),
    ),
  );
}
render();
