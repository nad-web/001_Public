import {
  root,
  el,
  button,
  field,
  select,
  panel,
  row,
  metric,
  store,
  exportJSON,
  confirmed,
  empty,
  hint,
  report,
} from './shell.js';
import { shuffle } from './logic.js';
import { WORDS } from './german-data.js';
export function startGerman({ articles = false }) {
  const app = articles ? 'artikel-trainer' : 'deutsch-daily',
    all = WORDS.filter((w) => !articles || w.article);
  const ids = new Set(all.map((w) => w.id));
  const valid = (x) =>
    x &&
    Array.isArray(x.known) &&
    Array.isArray(x.missed) &&
    x.known.length <= all.length &&
    x.missed.length <= all.length &&
    [...x.known, ...x.missed].every((id) => ids.has(id));
  const db = store(app, { known: [], missed: [] }, valid);
  let topic = 'All topics',
    review = false,
    size = 10,
    queue = [],
    index = 0,
    revealed = false,
    answer = null,
    correct = 0;
  const topics = ['All topics', ...new Set(all.map((w) => w.topic))];
  function start() {
    queue = shuffle(
      all.filter(
        (w) =>
          (topic === 'All topics' || w.topic === topic) &&
          (!review || db.get().missed.includes(w.id)),
      ),
    ).slice(0, size);
    index = 0;
    correct = 0;
    revealed = false;
    answer = null;
    render();
  }
  function record(success) {
    const word = queue[index],
      data = db.get();
    db.set({
      known: success
        ? [...new Set([...data.known, word.id])]
        : data.known.filter((x) => x !== word.id),
      missed: success
        ? data.missed.filter((x) => x !== word.id)
        : [...new Set([...data.missed, word.id])],
    });
    if (success) correct++;
  }
  function next() {
    index++;
    revealed = false;
    answer = null;
    render();
  }
  function render() {
    const topicSelect = select('topic', topics, topic);
    topicSelect.addEventListener('change', () => {
      topic = topicSelect.value;
      start();
    });
    const limit = select(
      'round-size',
      [
        [10, '10 cards'],
        [20, '20 cards'],
        [all.length, 'All cards'],
      ],
      size,
    );
    limit.addEventListener('change', () => {
      size = Number(limit.value);
      start();
    });
    const controls = row(
      field('Topic', topicSelect),
      field('Round length', limit),
      button(
        review ? 'Show all words' : 'Review missed words',
        () => {
          review = !review;
          start();
        },
        review ? 'active' : 'secondary',
      ),
      button('Shuffle new round', start),
    );
    const word = queue[index];
    let practice;
    if (!queue.length)
      practice = empty(
        'No missed words in this topic yet. Choose “Show all words” to practise.',
      );
    else if (!word)
      practice = panel(
        'Round complete',
        el('div', { class: 'big-result' }, `${correct} / ${queue.length}`),
        hint(
          articles
            ? 'Correct article answers this round.'
            : 'Cards you marked remembered this round.',
        ),
        button('Start another round', start, 'primary'),
      );
    else {
      const full = word.article ? `${word.article} ${word.word}` : word.word;
      const card = el(
        'div',
        { class: 'study-card' },
        hint(`${word.topic} · Card ${index + 1} of ${queue.length}`),
        el('div', { class: 'word', lang: 'de' }, articles ? word.word : full),
        revealed || answer !== null
          ? el('div', { class: 'translation' }, word.translation)
          : null,
        (revealed || answer !== null) && !articles
          ? el('p', { class: 'example', lang: 'de' }, word.example)
          : null,
      );
      let actions;
      if (articles) {
        actions = el(
          'div',
          { class: 'option-grid' },
          ['der', 'die', 'das'].map((article) =>
            button(
              article,
              () => {
                if (answer !== null) return;
                answer = article;
                record(article === word.article);
                report(
                  article === word.article
                    ? 'Correct!'
                    : `The correct article is ${word.article}.`,
                );
                render();
              },
              answer !== null
                ? article === word.article
                  ? 'correct'
                  : article === answer
                    ? 'wrong'
                    : 'secondary'
                : 'secondary',
              { disabled: answer !== null },
            ),
          ),
        );
      } else
        actions = revealed
          ? row(
              button(
                'Remembered',
                () => {
                  record(true);
                  next();
                },
                'primary',
              ),
              button('Practise again', () => {
                record(false);
                next();
              }),
            )
          : button(
              'Reveal meaning',
              () => {
                revealed = true;
                render();
              },
              'primary',
            );
      practice = panel(
        articles ? 'Choose the article' : 'A little German, every day',
        card,
        actions,
        articles && answer !== null
          ? el(
              'div',
              {},
              el('p', { class: 'big-result', lang: 'de' }, full),
              el('p', { lang: 'de' }, word.example),
              button('Next word', next, 'primary'),
            )
          : null,
        button(
          'Listen',
          () => {
            if (!('speechSynthesis' in window))
              throw new Error('Device speech is unavailable.');
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(full);
            utterance.lang = 'de-DE';
            utterance.rate = 0.85;
            speechSynthesis.speak(utterance);
          },
          'small',
          { disabled: !('speechSynthesis' in window) },
        ),
      );
    }
    root.replaceChildren(
      panel(
        'Choose your practice',
        controls,
        el(
          'div',
          { class: 'metrics' },
          metric('Remembered', db.get().known.length),
          metric('To review', db.get().missed.length),
          metric(
            'Starter collection',
            `${all.length} ${articles ? 'nouns' : 'cards'}`,
          ),
        ),
      ),
      practice,
      panel(
        'Your progress',
        hint(
          'Progress stays on this device. These original starter exercises are a small practice collection, not a complete language course. Pronunciation uses your device’s available German voice.',
        ),
        row(
          button('Export progress', () =>
            exportJSON(`${app}-progress.json`, db.get()),
          ),
          button(
            'Reset progress',
            () =>
              confirmed(
                'Delete your remembered and missed word records?',
                () => {
                  db.clear();
                  start();
                },
              ),
            'danger',
          ),
        ),
      ),
    );
  }
  start();
}
