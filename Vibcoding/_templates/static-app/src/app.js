const form = document.querySelector('#feature-form');
const input = document.querySelector('#feature');
const list = document.querySelector('#features');
const feedback = document.querySelector('#feedback');

form.addEventListener('submit', event => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) {
    feedback.textContent = 'Please write a feature first.';
    input.focus();
    return;
  }
  if (list.children.length >= 10) {
    feedback.textContent = 'Keep the sketch focused: remove an idea before adding another.';
    return;
  }
  const item = document.createElement('li');
  const text = document.createElement('span');
  text.textContent = value;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Remove';
  remove.setAttribute('aria-label', `Remove idea: ${value}`);
  remove.addEventListener('click', () => {
    item.remove();
    feedback.textContent = `${list.children.length} ideas in this sketch.`;
    input.focus();
  });
  item.append(text,remove);
  list.append(item);
  input.value = '';
  feedback.textContent = `${list.children.length} ideas in this sketch.`;
  input.focus();
});
