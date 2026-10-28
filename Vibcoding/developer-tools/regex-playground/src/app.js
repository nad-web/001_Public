import {
  root,
  el,
  button,
  input,
  field,
  panel,
  row,
  hint,
  report,
} from '../../../shared/js/shell.js';
const pattern = input('pattern', '\\b[a-z]+\\b', {
    maxlength: 500,
    spellcheck: 'false',
  }),
  flags = input('flags', 'gi', { maxlength: 10, spellcheck: 'false' });
const sample = el(
  'textarea',
  { id: 'sample', maxlength: 20000, class: 'code-area', spellcheck: 'false' },
  'Small ideas. Useful things. Build 20 apps.',
);
const highlighted = el('pre', {
    id: 'matches-preview',
    class: 'output',
    role: 'region',
    tabindex: 0,
    'aria-label': 'Highlighted matches',
  }),
  list = el('div', { id: 'match-list', class: 'stack' }),
  status = el(
    'p',
    { id: 'regex-summary', class: 'hint', role: 'status' },
    'Run the pattern to see matches.',
  );
let running = false;
function execute() {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.js', import.meta.url));
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(
        new Error(
          'Pattern stopped after 800 ms. Simplify it or use a shorter sample.',
        ),
      );
    }, 800);
    worker.onmessage = (event) => {
      clearTimeout(timeout);
      worker.terminate();
      event.data.ok ? resolve(event.data) : reject(new Error(event.data.error));
    };
    worker.onerror = () => {
      clearTimeout(timeout);
      worker.terminate();
      reject(
        new Error('The worker could not run. Reconnect and reload this app.'),
      );
    };
    worker.postMessage({
      pattern: pattern.value,
      flags: flags.value,
      text: sample.value,
    });
  });
}
const run = button(
  'Test pattern',
  async () => {
    if (running) return;
    running = true;
    run.disabled = true;
    highlighted.replaceChildren();
    list.replaceChildren();
    status.textContent = 'Testing in an isolated worker…';
    try {
      const started = performance.now();
      const { results, truncated } = await execute();
      let cursor = 0;
      for (const match of results) {
        highlighted.append(
          document.createTextNode(sample.value.slice(cursor, match.index)),
          el('mark', {}, match.text || '│'),
        );
        cursor = match.index + match.text.length;
      }
      highlighted.append(document.createTextNode(sample.value.slice(cursor)));
      list.replaceChildren(
        ...results
          .slice(0, 100)
          .map((match, i) =>
            el(
              'div',
              { class: 'item' },
              el(
                'span',
                { class: 'item-text' },
                `#${i + 1} at ${match.index}: ${JSON.stringify(match.text)}`,
              ),
              match.groups.length
                ? el('code', {}, JSON.stringify(match.groups))
                : null,
            ),
          ),
      );
      status.textContent = `${results.length}${truncated ? '+' : ''} matches · ${(performance.now() - started).toFixed(0)} ms. ${results.length > 100 ? 'Showing the first 100 in the list.' : ''}`;
      report('Pattern tested.');
    } catch (error) {
      status.textContent = 'Pattern could not complete.';
      throw error;
    } finally {
      running = false;
      run.disabled = false;
    }
  },
  'primary',
);
root.replaceChildren(
  el(
    'div',
    { class: 'grid' },
    panel(
      'Explore a JavaScript pattern',
      row(
        field('Pattern · without / delimiters', pattern),
        field('Flags', flags),
      ),
      field('Sample text', sample),
      run,
      hint(
        'Supports flags accepted by your browser. Add g for all matches. Maximum 500 pattern characters, 20,000 sample characters, and 1,000 matches. A separate worker is terminated on timeout.',
      ),
    ),
    panel('Matches in context', status, highlighted, list),
  ),
);
