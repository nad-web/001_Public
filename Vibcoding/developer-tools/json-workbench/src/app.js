import {
  root,
  el,
  button,
  field,
  panel,
  row,
  copy,
  download,
  hint,
  report,
} from '../../../shared/js/shell.js';
const source = el('textarea', {
  id: 'json-input',
  class: 'code-area',
  maxlength: 200000,
  spellcheck: 'false',
  placeholder: 'Paste JSON here. It stays on this device.',
});
const output = el('pre', {
  id: 'json-output',
  class: 'output',
  role: 'region',
  tabindex: 0,
  'aria-label': 'Processed JSON',
});
const details = el(
  'p',
  { class: 'hint', role: 'status' },
  'No JSON processed yet.',
);
function process(space) {
  output.textContent = '';
  if (!source.value.trim()) throw new Error('Paste JSON before processing.');
  if (new TextEncoder().encode(source.value).length > 500000)
    throw new Error('Input is limited to 500 KB.');
  try {
    const data = JSON.parse(source.value);
    output.textContent = JSON.stringify(data, null, space);
    const type = Array.isArray(data)
      ? `array · ${data.length} items`
      : data === null
        ? 'null'
        : typeof data === 'object'
          ? `object · ${Object.keys(data).length} keys`
          : typeof data;
    details.textContent = `Valid JSON · ${type} · ${new TextEncoder().encode(output.textContent).length} output bytes`;
    report('JSON processed locally.');
  } catch (error) {
    details.textContent = 'Invalid JSON';
    throw new Error(`JSON error: ${error.message}`);
  }
}
root.replaceChildren(
  el(
    'div',
    { class: 'grid' },
    panel(
      'Your input',
      field('JSON to inspect', source),
      row(
        button('Format JSON', () => process(2), 'primary'),
        button('Minify JSON', () => process(0)),
        button('Load example', () => {
          source.value = JSON.stringify(
            { project: 'Noorullah’s Build Lab', apps: 20, openSource: true },
            null,
            2,
          );
          output.textContent = '';
          details.textContent = 'Example loaded. Choose Format or Minify.';
        }),
        button('Clear', () => {
          source.value = '';
          output.textContent = '';
          details.textContent = 'No JSON processed yet.';
        }),
      ),
      hint(
        'Maximum 200,000 characters and 500 KB. No data is sent to a formatting service.',
      ),
    ),
    panel(
      'Readable result',
      details,
      output,
      row(
        button('Copy result', () => {
          if (!output.textContent) throw new Error('Process JSON first.');
          return copy(output.textContent);
        }),
        button('Download JSON', () => {
          if (!output.textContent) throw new Error('Process JSON first.');
          download('formatted.json', output.textContent);
        }),
      ),
    ),
  ),
);
