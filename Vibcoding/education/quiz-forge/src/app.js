import {
  root,
  el,
  button,
  field,
  select,
  panel,
  row,
  store,
  exportJSON,
  importJSON,
  empty,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { validQuiz, shuffle } from '../../../shared/js/logic.js';
const banks = {
  'Web basics': [
    {
      question: 'Which HTML element creates a link?',
      options: ['<a>', '<p>', '<div>'],
      answer: 0,
      explanation:
        'The anchor element <a> creates a hyperlink when it has an href attribute.',
    },
    {
      question: 'What is the main role of CSS?',
      options: ['Structure a database', 'Style a document', 'Send email'],
      answer: 1,
      explanation:
        'CSS describes presentation, including layout, colors, and typography.',
    },
    {
      question: 'Which method safely displays user text in an element?',
      options: ['eval', 'innerHTML', 'textContent'],
      answer: 2,
      explanation: 'textContent inserts text without interpreting it as HTML.',
    },
    {
      question: 'What does a 404 HTTP response mean?',
      options: ['Not found', 'Success', 'Redirect'],
      answer: 0,
      explanation: '404 indicates that the requested resource was not found.',
    },
    {
      question: 'Which JSON value is valid?',
      options: ['{name: Noor}', '{"name":"Noor"}', '{"name":undefined}'],
      answer: 1,
      explanation:
        'JSON object keys and string values use double quotes; undefined is not a JSON value.',
    },
    {
      question: 'Which input type is intended for an email address?',
      options: ['email', 'mailbox', 'address'],
      answer: 0,
      explanation: 'HTML provides type="email" for email-address inputs.',
    },
  ],
  'Everyday numbers': [
    {
      question: 'What is 20% of 150?',
      options: ['20', '25', '30'],
      answer: 2,
      explanation: '150 × 0.20 = 30.',
    },
    {
      question: 'How many minutes are in 2.5 hours?',
      options: ['125', '150', '250'],
      answer: 1,
      explanation: '2.5 × 60 = 150 minutes.',
    },
    {
      question: 'Three friends split €12 equally. Each pays…',
      options: ['€3', '€4', '€6'],
      answer: 1,
      explanation: '12 ÷ 3 = 4.',
    },
    {
      question: 'One kilometre equals…',
      options: ['100 metres', '1,000 metres', '10,000 metres'],
      answer: 1,
      explanation: 'The prefix kilo means one thousand.',
    },
    {
      question: 'A €40 item is reduced by 25%. Its new price is…',
      options: ['€15', '€25', '€30'],
      answer: 2,
      explanation: 'The reduction is €10; €40 − €10 = €30.',
    },
  ],
  'German essentials': [
    {
      question: 'Which article belongs to “Haus”?',
      options: ['der', 'die', 'das'],
      answer: 2,
      explanation: 'It is das Haus.',
    },
    {
      question: '“Guten Morgen” means…',
      options: ['Good morning', 'Good evening', 'Goodbye'],
      answer: 0,
      explanation: 'Guten Morgen is the standard morning greeting.',
    },
    {
      question: 'Which word means “train”?',
      options: ['Zug', 'Tür', 'Tisch'],
      answer: 0,
      explanation: 'Der Zug means the train.',
    },
    {
      question: '“Vielen Dank” means…',
      options: ['See you later', 'Thank you very much', 'I am sorry'],
      answer: 1,
      explanation: 'Vielen Dank is an expression of thanks.',
    },
    {
      question: 'Which article belongs to “Frage”?',
      options: ['der', 'das', 'die'],
      answer: 2,
      explanation: 'It is die Frage.',
    },
  ],
};
const db = store('quiz-forge', banks['Web basics'], validQuiz);
let topic =
    Object.keys(banks).find(
      (key) => JSON.stringify(banks[key]) === JSON.stringify(db.get()),
    ) || 'Imported set',
  questions = shuffle(db.get()),
  index = 0,
  answer = null,
  score = 0,
  missed = [];
function restart() {
  questions = shuffle(db.get());
  index = 0;
  answer = null;
  score = 0;
  missed = [];
  render();
}
function render() {
  const choose = select(
    'quiz-topic',
    [...Object.keys(banks), 'Imported set'],
    topic,
  );
  choose.addEventListener('change', () => {
    topic = choose.value;
    if (banks[topic]) {
      db.set(banks[topic]);
      restart();
    } else {
      report('Import a JSON question set below.');
      render();
    }
  });
  const question = questions[index];
  let practice;
  if (!question) {
    practice = panel(
      'Round complete',
      el('div', { class: 'big-result' }, `${score} / ${questions.length}`),
      hint('Practice feedback, not a formal assessment.'),
      missed.length
        ? el(
            'div',
            { class: 'stack' },
            el('h3', {}, 'Review your missed questions'),
            missed.map((q) =>
              el(
                'div',
                {},
                el('strong', {}, q.question),
                el('p', {}, `Answer: ${q.options[q.answer]}`),
                hint(q.explanation),
              ),
            ),
          )
        : hint('Every answer correct. Nicely done!'),
      button('Shuffle another round', restart, 'primary'),
    );
  } else {
    practice = panel(
      `Question ${index + 1} of ${questions.length}`,
      el('h2', {}, question.question),
      el(
        'div',
        { class: 'stack' },
        question.options.map((option, i) =>
          button(
            option,
            () => {
              if (answer !== null) return;
              answer = i;
              if (i === question.answer) score++;
              else missed.push(question);
              render();
            },
            answer === null
              ? 'secondary'
              : i === question.answer
                ? 'correct'
                : i === answer
                  ? 'wrong'
                  : 'secondary',
            { disabled: answer !== null },
          ),
        ),
      ),
      answer !== null
        ? el(
            'div',
            {},
            el(
              'p',
              {},
              answer === question.answer
                ? 'Correct.'
                : `Correct answer: ${question.options[question.answer]}`,
            ),
            hint(question.explanation),
            button(
              'Next question',
              () => {
                index++;
                answer = null;
                render();
              },
              'primary',
            ),
          )
        : null,
    );
  }
  root.replaceChildren(
    panel(
      'A focused practice round',
      row(
        field('Question collection', choose),
        button('Restart round', restart),
      ),
      hint(`${questions.length} questions · score ${score}`),
    ),
    practice,
    panel(
      'Use your own question set',
      hint(
        'Import an array of objects with question, options (2–6 strings), answer (zero-based index), and explanation. Up to 100 questions and 1 MB.',
      ),
      button('Download current question set', () =>
        exportJSON('quiz-questions.json', db.get()),
      ),
      importJSON('Import questions JSON', validQuiz, (data) => {
        db.set(
          data.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
          })),
        );
        topic = 'Imported set';
        restart();
      }),
    ),
  );
}
render();
