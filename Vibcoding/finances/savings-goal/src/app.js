import {
  root,
  el,
  button,
  input,
  field,
  panel,
  row,
  metric,
  form,
  money,
  store,
  exportJSON,
  confirmed,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { cents, savings } from '../../../shared/js/logic.js';
const db = store(
  'savings-goal',
  { name: 'My next adventure', target: '3000', saved: '500', months: 12 },
  (x) =>
    x &&
    typeof x.name === 'string' &&
    x.name.length <= 100 &&
    typeof x.target === 'string' &&
    typeof x.saved === 'string' &&
    Number.isInteger(x.months) &&
    x.months >= 1 &&
    x.months <= 1200,
);
let comparison = null;
function calculate(data) {
  return savings(cents(data.target), cents(data.saved), Number(data.months));
}
function render() {
  const data = db.get();
  let plan;
  try {
    plan = calculate(data);
  } catch {
    db.clear();
    render();
    return;
  }
  const progress = el('progress', {
    class: 'progress',
    max: 100,
    value: plan.progress,
    'aria-label': 'Savings progress',
  });
  const add = form(
    [
      field(
        'Goal name',
        input('name', data.name, { maxlength: 100, required: true }),
      ),
      row(
        field(
          'Target · EUR',
          input('target', data.target, {
            inputmode: 'decimal',
            required: true,
          }),
        ),
        field(
          'Already saved · EUR',
          input('saved', data.saved, { inputmode: 'decimal', required: true }),
        ),
      ),
      field(
        'Months remaining',
        input('months', data.months, {
          type: 'number',
          min: 1,
          max: 1200,
          step: 1,
          required: true,
        }),
      ),
    ],
    (values) => {
      const next = {
        name: values.get('name').trim(),
        target: values.get('target'),
        saved: values.get('saved'),
        months: Number(values.get('months')),
      };
      calculate(next);
      db.set(next);
      comparison = null;
      report('Plan updated.');
      render();
    },
    'Update plan',
  );
  const schedule = [];
  for (let i = 1; i <= Math.min(data.months, 12); i++) {
    const total = Math.max(
      cents(data.saved),
      Math.min(cents(data.target), cents(data.saved) + plan.monthly * i),
    );
    schedule.push(
      el(
        'li',
        { class: 'item' },
        el('span', {}, `Month ${i}`),
        el('strong', {}, money(total)),
      ),
    );
  }
  const compare = form(
    [
      field(
        'Alternative timeline · months',
        input('alternative', 6, {
          type: 'number',
          min: 1,
          max: 1200,
          step: 1,
          required: true,
        }),
      ),
    ],
    (values) => {
      comparison = calculate({
        ...data,
        months: Number(values.get('alternative')),
      });
      render();
    },
    'Compare timeline',
  );
  root.replaceChildren(
    el(
      'div',
      { class: 'grid' },
      panel(
        'Set your goal',
        add,
        hint(
          'Simple contribution planning in EUR. No interest, investment returns, inflation, or account connection.',
        ),
      ),
      panel(
        data.name,
        el('div', { class: 'big-result' }, money(plan.monthly)),
        hint('Monthly contribution needed. Rounded up to the next cent.'),
        progress,
        hint(`${plan.progress.toFixed(1)}% of the target saved`),
        el(
          'div',
          { class: 'metrics' },
          metric('Remaining', money(plan.remaining)),
          metric('Timeline', `${data.months} months`),
          metric('Saved', money(cents(data.saved))),
        ),
      ),
    ),
    el(
      'div',
      { class: 'grid' },
      panel(
        'Compare another timeline',
        compare,
        comparison
          ? el(
              'p',
              { class: 'big-result' },
              `${money(comparison.monthly)} / month`,
            )
          : hint(
              'See how changing the timeline changes your monthly contribution.',
            ),
      ),
      panel(
        'Contribution milestones',
        el('ul', { class: 'item-list' }, schedule),
        data.months > 12 ? hint('Showing the first 12 months.') : null,
      ),
    ),
    row(
      button('Export plan', () => exportJSON('savings-goal.json', db.get())),
      button(
        'Reset plan',
        () =>
          confirmed('Reset the saved plan?', () => {
            db.clear();
            comparison = null;
            render();
          }),
        'danger',
      ),
    ),
  );
}
render();
