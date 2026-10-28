import { icon } from '../../src/icons.js';
import './pwa.js';
export const $ = (selector) => document.querySelector(selector);
export const root = $('#app');
export const id = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key.startsWith('on'))
      node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (
      key === 'checked' ||
      key === 'disabled' ||
      key === 'hidden' ||
      key === 'selected'
    )
      node[key] = Boolean(value);
    else if (value !== null && value !== undefined)
      node.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity))
    if (child !== null && child !== undefined && child !== false)
      node.append(
        child instanceof Node ? child : document.createTextNode(String(child)),
      );
  return node;
}
let storageWarning = '';
export function report(text, error = false) {
  const box = $('#feedback');
  box.textContent = text + (storageWarning ? ' ' + storageWarning : '');
  box.classList.toggle('error', error || Boolean(storageWarning));
}
export function button(text, fn, kind = 'secondary', attrs = {}) {
  return el(
    'button',
    {
      type: 'button',
      class: `btn ${kind}`,
      ...attrs,
      onclick: async (event) => {
        try {
          await fn(event);
        } catch (error) {
          report(error.message, true);
        }
      },
    },
    text,
  );
}
export const input = (name, value = '', attrs = {}) =>
  el('input', { id: name, name, value, ...attrs });
export const field = (label, control) =>
  el(
    'div',
    { class: 'field' },
    el('label', { for: control.id || control.name }, label),
    control,
  );
export function select(name, options, value) {
  return el(
    'select',
    { id: name, name },
    options.map((option) => {
      const [v, label] = Array.isArray(option) ? option : [option, option];
      return el(
        'option',
        { value: v, selected: String(v) === String(value) },
        label,
      );
    }),
  );
}
export const panel = (title, ...children) =>
  el(
    'section',
    { class: 'panel' },
    title ? el('h2', {}, title) : null,
    ...children,
  );
export const row = (...children) => el('div', { class: 'row' }, ...children);
export const stack = (...children) =>
  el('div', { class: 'stack' }, ...children);
export const hint = (text) => el('p', { class: 'hint' }, text);
export const heading = (text, sub) =>
  stack(el('h2', {}, text), sub ? hint(sub) : null);
export const metric = (label, value) =>
  el(
    'div',
    { class: 'metric' },
    el('span', {}, label),
    el('strong', {}, value),
  );
export function form(children, submit, label = 'Save') {
  return el(
    'form',
    {
      onsubmit: async (event) => {
        event.preventDefault();
        try {
          await submit(new FormData(event.target), event.target);
        } catch (error) {
          report(error.message, true);
        }
      },
    },
    ...children,
    el('button', { type: 'submit', class: 'btn primary' }, label),
  );
}
export const money = (value) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
    value / 100,
  );
export function store(app, fallback, validate = () => true) {
  const key = `noorullah-lab:${app}:v1`;
  let data = structuredClone(fallback);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !validate(saved.data))
        throw new Error('Invalid saved data');
      data = saved.data;
    }
  } catch {
    report(
      'Saved data is unavailable or invalid. This visit starts with a fresh view; use exports to keep a backup.',
      true,
    );
  }
  return {
    get: () => data,
    set(next) {
      if (!validate(next)) throw new Error('Data validation failed.');
      data = next;
      try {
        localStorage.setItem(key, JSON.stringify({ version: 1, data }));
        storageWarning = '';
      } catch {
        storageWarning =
          'Browser storage is unavailable. Changes last only for this visit; export a backup before leaving.';
        report('Changes kept in memory.', true);
      }
    },
    clear() {
      data = structuredClone(fallback);
      try {
        localStorage.removeItem(key);
        storageWarning = '';
      } catch {
        storageWarning =
          'Saved records could not be removed from browser storage. Use the browser’s site-data settings when storage is available.';
        report('Current view reset.', true);
      }
      return data;
    },
  };
}
export function download(name, content, type = 'application/json') {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  report(
    `Download prepared: ${name}. On iPhone, check Files or the Share menu.`,
  );
}
export const exportJSON = (name, data) =>
  download(name, JSON.stringify(data, null, 2));
export function importJSON(label, validate, onLoad) {
  const control = input(id(), '', {
    type: 'file',
    accept: '.json,application/json',
    'aria-label': label,
  });
  control.addEventListener('change', async () => {
    try {
      const file = control.files[0];
      if (!file) return;
      if (file.size > 1_000_000) throw new Error('Import is limited to 1 MB.');
      const data = JSON.parse(await file.text());
      if (!validate(data))
        throw new Error('This file does not match the expected data format.');
      if (!confirm('Replace the current data with this imported file?')) return;
      onLoad(data);
      report('Import completed.');
    } catch (e) {
      report(e.message, true);
    } finally {
      control.value = '';
    }
  });
  return field(label, control);
}
export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    report('Copied to clipboard.');
  } catch {
    report(
      'Clipboard unavailable. Select the text and copy it manually.',
      true,
    );
  }
}
export const confirmed = (message, fn) => {
  if (confirm(message)) fn();
};
export function empty(text = 'No items yet. Add your first one above.') {
  return el('p', { class: 'empty' }, text);
}
export function init() {
  let theme;
  try {
    theme = localStorage.getItem('001-public:theme');
  } catch {}
  document.documentElement.dataset.theme =
    theme ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const glyph = $('#app-icon');
  if (glyph) glyph.innerHTML = icon(document.body.dataset.icon);
  $('#theme')?.addEventListener('click', () => {
    const theme =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('001-public:theme', theme);
    } catch {}
  });
}
init();
