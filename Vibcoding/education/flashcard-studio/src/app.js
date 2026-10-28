import {
  root,
  el,
  button,
  input,
  field,
  panel,
  row,
  form,
  store,
  exportJSON,
  importJSON,
  confirmed,
  empty,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { validCards, shuffle } from '../../../shared/js/logic.js';
const starter = [
  { question: 'How do you say “thank you” in German?', answer: 'Danke.' },
  {
    question: 'What does HTML stand for?',
    answer: 'HyperText Markup Language.',
  },
  {
    question: 'How many centimetres are in one metre?',
    answer: '100 centimetres.',
  },
  { question: 'What is 15% of 200?', answer: '30.' },
];
const db = store('flashcard-studio', starter, validCards);
let editing = null,
  deck = [],
  index = 0,
  revealed = false,
  remembered = 0,
  practising = false;
function render() {
  const cards = db.get(),
    current = editing === null ? null : cards[editing];
  const editor = form(
    [
      field(
        'Question',
        el(
          'textarea',
          { id: 'question', name: 'question', maxlength: 500, required: true },
          current?.question || '',
        ),
      ),
      field(
        'Answer',
        el(
          'textarea',
          { id: 'answer', name: 'answer', maxlength: 1000, required: true },
          current?.answer || '',
        ),
      ),
    ],
    (data) => {
      const card = {
        question: data.get('question').trim(),
        answer: data.get('answer').trim(),
      };
      if (!validCards([card]))
        throw new Error('Enter both a question and an answer.');
      if (editing === null && cards.length >= 500)
        throw new Error('A deck supports up to 500 cards.');
      db.set(
        editing === null
          ? [...cards, card]
          : cards.map((c, i) => (i === editing ? card : c)),
      );
      editing = null;
      practising = false;
      render();
    },
    editing === null ? 'Add card' : 'Save card',
  );
  const start = () => {
    deck = shuffle(db.get());
    index = 0;
    revealed = false;
    remembered = 0;
    practising = true;
    render();
  };
  let practice = empty(
    'Add your own cards or try the four editable starter cards.',
  );
  if (practising && deck.length) {
    const card = deck[index];
    practice = card
      ? el(
          'div',
          { class: 'stack' },
          el(
            'div',
            { class: 'study-card' },
            hint(`Card ${index + 1} of ${deck.length}`),
            el('div', { class: 'word' }, card.question),
            revealed ? el('p', { class: 'translation' }, card.answer) : null,
          ),
          revealed
            ? row(
                button(
                  'Remembered',
                  () => {
                    remembered++;
                    index++;
                    revealed = false;
                    render();
                  },
                  'primary',
                ),
                button('Needs practice', () => {
                  index++;
                  revealed = false;
                  render();
                }),
              )
            : button(
                'Reveal answer',
                () => {
                  revealed = true;
                  render();
                },
                'primary',
              ),
        )
      : el(
          'div',
          {},
          el('div', { class: 'big-result' }, `${remembered} / ${deck.length}`),
          hint(
            'Cards marked remembered. Shuffle another round to keep practising.',
          ),
        );
  }
  const list = el(
    'ul',
    { class: 'item-list' },
    cards.map((card, i) =>
      el(
        'li',
        { class: 'item' },
        el(
          'div',
          { class: 'item-text' },
          el('strong', {}, card.question),
          el('small', {}, card.answer),
        ),
        row(
          button(
            'Edit',
            () => {
              editing = i;
              render();
              document.querySelector('#question').focus();
            },
            'small',
            { 'aria-label': `Edit card ${i + 1}` },
          ),
          button(
            'Delete',
            () =>
              confirmed('Delete this card?', () => {
                db.set(cards.filter((_, n) => n !== i));
                editing = null;
                practising = false;
                render();
              }),
            'small',
            { 'aria-label': `Delete card ${i + 1}` },
          ),
        ),
      ),
    ),
  );
  root.replaceChildren(
    el(
      'div',
      { class: 'grid' },
      panel(
        editing === null ? 'Create a card' : 'Edit card',
        editor,
        editing !== null
          ? button('Cancel edit', () => {
              editing = null;
              render();
            })
          : null,
      ),
      panel(
        'Practise your deck',
        button('Shuffle and practise', start, 'primary', {
          disabled: !cards.length,
        }),
        practice,
      ),
    ),
    panel(`Your cards · ${cards.length}`, cards.length ? list : empty()),
    panel(
      'Take your deck with you',
      row(
        button('Export deck', () => exportJSON('flashcards.json', db.get())),
        button(
          'Clear deck',
          () =>
            confirmed('Delete every card?', () => {
              db.set([]);
              editing = null;
              practising = false;
              render();
            }),
          'danger',
        ),
      ),
      importJSON('Import deck · replaces current cards', validCards, (data) => {
        db.set(data.map((c) => ({ question: c.question, answer: c.answer })));
        editing = null;
        practising = false;
        render();
      }),
    ),
  );
}
render();
