import {
  root,
  el,
  button,
  field,
  select,
  panel,
  row,
  metric,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { shuffle } from '../../../shared/js/logic.js';
const symbols = ['✦', '☀', '☂', '♬', '☕', '♥', '✿', '⚓'];
let pairs = 8,
  cards = [],
  shown = [],
  matched = new Set(),
  moves = 0,
  busy = false,
  pending;
function restart() {
  clearTimeout(pending);
  cards = shuffle([...symbols.slice(0, pairs), ...symbols.slice(0, pairs)]);
  shown = [];
  matched = new Set();
  moves = 0;
  busy = false;
  render();
}
function flip(index) {
  if (busy || matched.has(index) || shown.includes(index)) return;
  shown.push(index);
  if (shown.length === 2) {
    moves++;
    if (cards[shown[0]] === cards[shown[1]]) {
      shown.forEach((i) => matched.add(i));
      shown = [];
      report(
        matched.size === cards.length
          ? `All pairs found in ${moves} moves. Nicely done!`
          : 'A match!',
      );
    } else {
      busy = true;
      pending = setTimeout(() => {
        shown = [];
        busy = false;
        render();
      }, 850);
    }
  }
  render();
}
function render() {
  const size = select(
    'pairs',
    [
      [4, '4 pairs'],
      [6, '6 pairs'],
      [8, '8 pairs'],
    ],
    pairs,
  );
  size.addEventListener('change', () => {
    pairs = Number(size.value);
    restart();
  });
  const board = el(
    'div',
    { class: 'memory-grid' },
    cards.map((face, index) => {
      const visible = matched.has(index) || shown.includes(index);
      return el(
        'button',
        {
          type: 'button',
          class: `memory-card ${matched.has(index) ? 'matched' : ''}`,
          disabled: matched.has(index) || shown.includes(index) || busy,
          'aria-label': `Card ${index + 1}, ${visible ? face : 'hidden'}`,
          onclick: () => flip(index),
        },
        visible ? face : '?',
      );
    }),
  );
  root.replaceChildren(
    panel(
      'Find the matching pairs',
      row(field('Board size', size), button('New game', restart)),
      el(
        'div',
        { class: 'metrics' },
        metric('Moves', moves),
        metric('Pairs found', `${matched.size / 2} / ${pairs}`),
        metric('Board', `${cards.length} cards`),
      ),
    ),
    panel(
      matched.size === cards.length
        ? 'Every pair found. Play again?'
        : 'A small game, a fresh perspective.',
      board,
      hint(
        'Tap or keyboard-focus a card and press Enter or Space. Two matching symbols stay face up.',
      ),
    ),
  );
}
restart();
