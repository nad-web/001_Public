import {
  root,
  el,
  button,
  input,
  field,
  select,
  panel,
  row,
  store,
  download,
  exportJSON,
  importJSON,
  confirmed,
  hint,
  report,
} from '../../../shared/js/shell.js';
import { randomIndex } from '../../../shared/js/logic.js';
const prompts = {
  Reflective: [
    'Describe a place where you feel completely at ease, using only sounds and textures.',
    'Write a letter to yourself one year from now about a small habit you hope to keep.',
    'Recall a conversation that changed your mind. Begin with the first sentence you remember.',
    'Describe an ordinary object you have kept for years and the story it carries.',
    'Write about a skill you learned slowly. What made you return to it?',
    'Imagine meeting your childhood self at a train station. What do you talk about?',
  ],
  Adventure: [
    'A suitcase arrives at your door with your name on it, but you never ordered it.',
    'The last train of the evening stops at a station that is missing from every map.',
    'You discover a handwritten note hidden inside a library book. It contains tomorrow’s date.',
    'A town wakes up to find that every street sign has changed overnight.',
    'You have one afternoon to find the owner of a mysterious key.',
    'A familiar path leads somewhere entirely new after the first snowfall.',
  ],
  Everyday: [
    'Describe a busy café from the point of view of an empty chair.',
    'Tell the story of a shared meal without naming any food.',
    'Write about a short journey that took much longer than expected.',
    'A neighbor asks you to look after a plant with unusually specific instructions.',
    'Describe the morning routine of someone whose work begins when others sleep.',
    'Two strangers reach for the same forgotten umbrella.',
  ],
  Playful: [
    'Write a polite complaint from the moon to the streetlights.',
    'A houseplant starts giving career advice. Its first suggestion is surprisingly good.',
    'Invent a tiny holiday celebrating something people usually overlook.',
    'Describe a museum devoted entirely to lost socks.',
    'A robot learns the difference between being busy and being useful.',
    'Write a recipe for a good afternoon using no actual ingredients.',
  ],
};
const valid = (x) =>
  x &&
  typeof x.title === 'string' &&
  x.title.length <= 100 &&
  typeof x.text === 'string' &&
  x.text.length <= 50000 &&
  typeof x.prompt === 'string' &&
  x.prompt.length <= 1000;
const db = store(
  'writing-sparks',
  { title: '', text: '', prompt: prompts.Reflective[0] },
  valid,
);
let state = { ...db.get() },
  genre = 'Reflective',
  pending;
const title = input('draft-title', state.title, {
    maxlength: 100,
    placeholder: 'Give your draft a name',
  }),
  editor = el(
    'textarea',
    {
      id: 'draft',
      class: 'writer',
      maxlength: 50000,
      placeholder: 'Start with one sentence…',
    },
    state.text,
  ),
  promptText = el(
    'p',
    { class: 'study-card', id: 'writing-prompt' },
    state.prompt,
  ),
  count = el('p', { class: 'hint', role: 'status' });
function countWords() {
  const words = (
    editor.value.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []
  ).length;
  count.textContent = `${words} words · ${editor.value.length} / 50,000 characters · about ${Math.max(1, Math.ceil(words / 200))} min read`;
}
function save() {
  clearTimeout(pending);
  state = {
    title: title.value,
    text: editor.value,
    prompt: promptText.textContent,
  };
  db.set(state);
}
for (const control of [title, editor])
  control.addEventListener('input', () => {
    countWords();
    clearTimeout(pending);
    pending = setTimeout(save, 250);
  });
window.addEventListener('pagehide', save);
const choose = select('genre', Object.keys(prompts), genre);
choose.addEventListener('change', () => {
  genre = choose.value;
});
const spark = () => {
  const candidates = prompts[genre].filter(
    (text) => text !== promptText.textContent,
  );
  promptText.textContent = candidates[randomIndex(candidates.length)];
  save();
  report('A fresh prompt. Your existing draft is unchanged.');
};
function load(data) {
  clearTimeout(pending);
  state = { ...data };
  db.set(state);
  title.value = data.title;
  editor.value = data.text;
  promptText.textContent = data.prompt;
  countWords();
}
root.replaceChildren(
  el(
    'div',
    { class: 'grid' },
    panel(
      'A nudge for the blank page',
      field('Prompt style', choose),
      promptText,
      button('New writing spark', spark, 'primary'),
      hint(
        '24 original prompts, selected on this device. No AI service, account, or remote draft storage.',
      ),
    ),
    panel(
      'Make it your own',
      field('Draft title', title),
      hint(
        'Drafts save automatically in this browser. Export important writing before clearing browser data.',
      ),
    ),
  ),
  panel(
    'Your writing space',
    field('Draft', editor),
    count,
    row(
      button('Download text', () => {
        save();
        download(
          'writing-sparks.txt',
          `${state.title || 'Untitled'}\n\n${state.text}`,
          'text/plain;charset=utf-8',
        );
      }),
      button('Export JSON backup', () => {
        save();
        exportJSON('writing-sparks.json', state);
      }),
      button(
        'Clear draft',
        () =>
          confirmed('Delete the saved title and draft?', () => {
            load({ title: '', text: '', prompt: promptText.textContent });
            report('Draft cleared.');
          }),
        'danger',
      ),
    ),
    importJSON('Restore a draft JSON', valid, load),
  ),
);
countWords();
