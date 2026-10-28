import {
  root,
  el,
  button,
  field,
  panel,
  row,
  form,
  store,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { randomIndex } from '../../../shared/js/logic.js';
const valid = (x) =>
  Array.isArray(x) &&
  x.length >= 2 &&
  x.length <= 12 &&
  x.every((s) => typeof s === 'string' && s.trim() && s.length <= 60);
const db = store(
  'decision-wheel',
  ['Cook something new', 'Take a walk', 'Read a chapter'],
  valid,
);
let rotation = 0,
  spinning = false,
  result = '',
  history = [];
const colors = [
  '#cff36b',
  '#d6e9f5',
  '#f7d7c3',
  '#e5d9f4',
  '#f4e9ad',
  '#bfdcc6',
];
function render() {
  const options = db.get();
  const area = el(
    'textarea',
    { id: 'options', name: 'options', rows: 7, maxlength: 800, required: true },
    options.join('\n'),
  );
  const editor = form(
    [field('Options · one per line', area)],
    (data) => {
      if (spinning) throw new Error('Wait for the wheel to stop.');
      const next = data
        .get('options')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (!valid(next))
        throw new Error('Use 2–12 options, each at most 60 characters.');
      db.set(next);
      result = '';
      rotation = 0;
      render();
    },
    'Update wheel',
  );
  const wheel = el('div', {
    class: 'wheel',
    id: 'wheel',
    'aria-hidden': 'true',
  });
  wheel.style.background = `conic-gradient(${options.map((_, i) => `${colors[i % colors.length]} ${(i / options.length) * 100}% ${((i + 1) / options.length) * 100}%`).join(',')})`;
  wheel.style.transform = `rotate(${rotation}deg)`;
  const display = el(
    'div',
    { id: 'wheel-result', class: 'big-result', role: 'status' },
    result || 'What will it be?',
  );
  const spin = button(
    'Spin the wheel',
    () => {
      if (spinning) return;
      spinning = true;
      spin.disabled = true;
      const choice = randomIndex(options.length);
      const target = 360 - ((choice + 0.5) * 360) / options.length;
      const delta = (target - (rotation % 360) + 360) % 360;
      rotation += 1440 + delta;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      wheel.style.transform = `rotate(${rotation}deg)`;
      setTimeout(
        () => {
          spinning = false;
          result = options[choice];
          history = [result, ...history].slice(0, 5);
          report(`The wheel chose: ${result}`);
          render();
        },
        reduced ? 40 : 2700,
      );
    },
    'primary',
    { disabled: spinning, id: 'spin-wheel' },
  );
  root.replaceChildren(
    el(
      'div',
      { class: 'grid' },
      panel(
        'Make a little room for chance',
        editor,
        hint(
          'Each line has the same chance. Repeated options intentionally receive more chances.',
        ),
        el(
          'ol',
          {},
          options.map((text) => el('li', {}, text)),
        ),
      ),
      panel(
        'Give it a spin',
        el(
          'div',
          { class: 'wheel-wrap' },
          el('div', { class: 'wheel-pointer' }),
          wheel,
          el('span', { class: 'wheel-center' }, 'CHOOSE'),
        ),
        el('div', { class: 'center' }, spin, display),
      ),
    ),
    panel(
      'Recent choices',
      history.length
        ? el(
            'ol',
            {},
            history.map((text) => el('li', {}, text)),
          )
        : hint('Your last five results appear here for this visit.'),
    ),
  );
}
render();
