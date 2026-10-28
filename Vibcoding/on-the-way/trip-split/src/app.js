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
  money,
  store,
  id,
  exportJSON,
  importJSON,
  confirmed,
  empty,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { cents, balances, settle } from '../../../shared/js/logic.js';
const valid = (x) =>
  x &&
  Array.isArray(x.people) &&
  x.people.length <= 20 &&
  x.people.every(
    (p) =>
      p &&
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      p.name.trim() &&
      p.name.length <= 60,
  ) &&
  new Set(x.people.map((p) => p.id)).size === x.people.length &&
  Array.isArray(x.expenses) &&
  x.expenses.length <= 1000 &&
  new Set(x.expenses.map((e) => e?.id)).size === x.expenses.length &&
  x.expenses.every(
    (e) =>
      e &&
      typeof e.id === 'string' &&
      typeof e.note === 'string' &&
      e.note.trim() &&
      e.note.length <= 120 &&
      x.people.some((p) => p.id === e.paidBy) &&
      Number.isSafeInteger(e.amount) &&
      e.amount > 0 &&
      e.amount <= 99999999999,
  );
const db = store('trip-split', { people: [], expenses: [] }, valid);
function render() {
  const { people, expenses } = db.get();
  const names = Object.fromEntries(people.map((p) => [p.id, p.name]));
  const addPerson = form(
    [
      field(
        'Participant name',
        input('person', '', { required: true, maxlength: 60 }),
      ),
    ],
    (data) => {
      const name = data.get('person').trim();
      if (!name) throw new Error('Enter a participant name.');
      if (people.length >= 20)
        throw new Error('A trip supports up to 20 people.');
      if (expenses.length)
        throw new Error(
          'Clear expenses before changing the group, so existing shares stay consistent.',
        );
      db.set({ people: [...people, { id: id(), name }], expenses });
      render();
    },
    'Add person',
  );
  const peopleList = el(
    'ul',
    { class: 'item-list' },
    people.map((p) =>
      el(
        'li',
        { class: 'item' },
        el('span', {}, p.name),
        button(
          'Remove',
          () => {
            if (expenses.length)
              throw new Error('Delete expenses before changing the group.');
            db.set({ people: people.filter((x) => x.id !== p.id), expenses });
            render();
          },
          'small',
          { 'aria-label': `Remove ${p.name}` },
        ),
      ),
    ),
  );
  const addExpense =
    people.length >= 2
      ? form(
          [
            field(
              'Paid by',
              select(
                'paidBy',
                people.map((p) => [p.id, p.name]),
                people[0].id,
              ),
            ),
            field(
              'Amount · EUR',
              input('amount', '', { required: true, inputmode: 'decimal' }),
            ),
            field(
              'Description',
              input('note', '', { required: true, maxlength: 120 }),
            ),
          ],
          (data) => {
            const amount = cents(data.get('amount'));
            if (!amount) throw new Error('Enter an amount greater than zero.');
            if (expenses.length >= 1000)
              throw new Error(
                'Expense limit reached. Export and start a new trip.',
              );
            db.set({
              people,
              expenses: [
                ...expenses,
                {
                  id: id(),
                  paidBy: data.get('paidBy'),
                  amount,
                  note: data.get('note').trim(),
                },
              ],
            });
            report('Expense split equally across the group.');
            render();
          },
          'Add shared expense',
        )
      : empty('Add at least two people to start splitting expenses.');
  const result = people.length ? balances(people, expenses) : {};
  const transfers = settle(result);
  const expenseList = el(
    'ul',
    { class: 'item-list' },
    expenses.map((e) =>
      el(
        'li',
        { class: 'item' },
        el(
          'div',
          { class: 'item-text' },
          el('strong', {}, e.note),
          el('small', {}, `Paid by ${names[e.paidBy]}`),
        ),
        el('span', { class: 'amount' }, money(e.amount)),
        button(
          'Delete',
          () =>
            confirmed('Delete this expense?', () => {
              db.set({
                people,
                expenses: expenses.filter((x) => x.id !== e.id),
              });
              render();
            }),
          'small',
          { 'aria-label': `Delete ${e.note}` },
        ),
      ),
    ),
  );
  root.replaceChildren(
    el(
      'div',
      { class: 'grid' },
      panel(
        'Your group',
        addPerson,
        people.length ? peopleList : empty(),
        hint(
          'Complete the group before adding expenses. Everyone shares every expense equally.',
        ),
      ),
      panel('Add an expense', addExpense),
    ),
    el(
      'div',
      { class: 'grid' },
      panel(
        'Balances',
        people.length
          ? el(
              'ul',
              { class: 'item-list' },
              people.map((p) =>
                el(
                  'li',
                  { class: 'item' },
                  el('span', {}, p.name),
                  el(
                    'strong',
                    {},
                    `${result[p.id] >= 0 ? 'Receives' : 'Owes'} ${money(Math.abs(result[p.id]))}`,
                  ),
                ),
              ),
            )
          : empty(),
      ),
      panel(
        'Suggested settlements',
        transfers.length
          ? el(
              'ul',
              { class: 'item-list' },
              transfers.map((t) =>
                el(
                  'li',
                  { class: 'item' },
                  el('span', {}, `${names[t.from]} → ${names[t.to]}`),
                  el('strong', {}, money(t.amount)),
                ),
              ),
            )
          : empty(
              expenses.length
                ? 'All settled. No transfers needed.'
                : 'Add expenses to calculate settlements.',
            ),
        hint(
          'Cent remainders go to participants in list order. This app records calculations and does not send payments.',
        ),
      ),
    ),
    panel('Shared expenses', expenses.length ? expenseList : empty()),
    panel(
      'Backup and reset',
      row(
        button('Export trip', () => exportJSON('trip-split.json', db.get())),
        button(
          'Reset trip',
          () =>
            confirmed('Delete the group and all expenses?', () => {
              db.clear();
              render();
            }),
          'danger',
        ),
      ),
      importJSON('Restore trip JSON', valid, (data) => {
        db.set(data);
        render();
      }),
    ),
  );
}
render();
