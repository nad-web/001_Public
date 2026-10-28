import {
  root,
  el,
  button,
  input,
  field,
  panel,
  row,
  store,
  copy,
  download,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { contrast, randomIndex } from '../../../shared/js/logic.js';
const valid = (x) =>
  Array.isArray(x) &&
  x.length === 5 &&
  x.every(
    (c) => c && /^#[\da-f]{6}$/i.test(c.hex) && typeof c.locked === 'boolean',
  );
const db = store(
  'palette-studio',
  ['#cff36b', '#20251e', '#d6e9f5', '#eee8f9', '#f5d8c6'].map((hex) => ({
    hex,
    locked: false,
  })),
  valid,
);
let foreground = '#20251e',
  background = '#cff36b';
const randomColor = () =>
  `#${randomIndex(256).toString(16).padStart(2, '0')}${randomIndex(256).toString(16).padStart(2, '0')}${randomIndex(256).toString(16).padStart(2, '0')}`;
const css = () =>
  `:root {\n${db
    .get()
    .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
    .join('\n')}\n}\n`;
function render() {
  const palette = db.get();
  const swatches = palette.map((color, i) => {
    const textColor =
      contrast(color.hex, '#ffffff') > contrast(color.hex, '#000000')
        ? '#ffffff'
        : '#000000';
    const picker = input(`color-${i}`, color.hex, {
      type: 'color',
      'aria-label': `Edit color ${i + 1}`,
    });
    picker.addEventListener('input', () => {
      const next = db
        .get()
        .map((c, n) => (n === i ? { ...c, hex: picker.value } : c));
      db.set(next);
    });
    picker.addEventListener('change', render);
    const patch = el('div', { class: 'swatch-color' }, picker);
    patch.style.background = color.hex;
    patch.style.color = textColor;
    return el(
      'article',
      { class: 'swatch' },
      patch,
      el('code', {}, color.hex.toUpperCase()),
      row(
        button(
          color.locked ? 'Unlock' : 'Lock',
          () => {
            db.set(
              palette.map((c, n) =>
                n === i ? { ...c, locked: !c.locked } : c,
              ),
            );
            render();
          },
          color.locked ? 'active' : 'small',
          {
            'aria-label': `${color.locked ? 'Unlock' : 'Lock'} color ${i + 1}`,
          },
        ),
        button('Copy', () => copy(color.hex), 'small', {
          'aria-label': `Copy color ${i + 1}`,
        }),
      ),
    );
  });
  const fg = input('foreground', foreground, { type: 'color' }),
    bg = input('background', background, { type: 'color' });
  const ratio = el('div', { id: 'contrast-ratio', class: 'big-result' }),
    sample = el('p', {}, 'Small ideas. Useful things.');
  sample.style.padding = '24px';
  sample.style.borderRadius = '9px';
  const assessment = el('p', { class: 'hint' });
  function update() {
    foreground = fg.value;
    background = bg.value;
    const value = contrast(foreground, background);
    ratio.textContent = `${value.toFixed(2)} : 1`;
    sample.style.color = foreground;
    sample.style.background = background;
    assessment.textContent =
      value >= 7
        ? 'Passes WCAG AAA for normal text.'
        : value >= 4.5
          ? 'Passes WCAG AA for normal text.'
          : value >= 3
            ? 'Passes WCAG AA for large text only.'
            : 'Below WCAG AA text contrast thresholds.';
  }
  fg.addEventListener('input', update);
  bg.addEventListener('input', update);
  update();
  root.replaceChildren(
    panel(
      'A palette to build on',
      row(
        button(
          'Generate unlocked colors',
          () => {
            db.set(
              db
                .get()
                .map((c) => (c.locked ? c : { ...c, hex: randomColor() })),
            );
            render();
          },
          'primary',
        ),
        button('Copy CSS', () => copy(css())),
        button('Download CSS', () =>
          download('noorullah-palette.css', css(), 'text/css'),
        ),
      ),
      hint(
        'Lock colors you like, edit a swatch, then generate the rest. This palette is saved locally.',
      ),
    ),
    el('div', { class: 'swatches' }, swatches),
    el(
      'div',
      { class: 'grid' },
      panel(
        'Check text contrast',
        row(field('Text color', fg), field('Background color', bg)),
        ratio,
        assessment,
        sample,
        hint(
          'Large text means at least 18 pt regular or 14 pt bold. Contrast is only one part of accessibility.',
        ),
      ),
      panel(
        'Ready for your stylesheet',
        el('pre', { class: 'output' }, css()),
        hint('CSS variables export as plain text, with no extra dependency.'),
      ),
    ),
  );
}
render();
