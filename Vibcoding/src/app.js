import { icon, hydrateIcons } from './icons.js';

const $ = selector => document.querySelector(selector);
const labels = { planned: 'On the roadmap', prototype: 'Prototype', ready: 'Ready to use' };
const state = { category: 'all', query: '', status: 'all', apps: [], categories: [], config: null };
const dialog = $('#app-dialog');
let lastOpener;

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function repositoryUrl() {
  const { githubUsername, repository } = state.config || {};
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(githubUsername || '')) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(repository || '')) return null;
  return `https://github.com/${githubUsername}/${repository}`;
}

function appPath(app) {
  return `./${encodeURIComponent(app.category)}/${encodeURIComponent(app.id)}/`;
}

function renderCategories() {
  const container = $('#categories');
  container.replaceChildren();
  const categories = [{ id: 'all', name: 'All collections', icon: 'grid' }, ...state.categories];
  for (const category of categories) {
    const button = element('button', 'category-chip');
    button.type = 'button';
    button.dataset.category = category.id;
    button.setAttribute('aria-pressed', String(category.id === state.category));
    const glyph = element('span', 'chip-icon');
    glyph.innerHTML = icon(category.icon);
    button.append(glyph, element('span', '', category.name));
    button.addEventListener('click', () => {
      state.category = category.id;
      container.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      renderApps();
    });
    container.append(button);
  }
}

function createCard(app) {
  const category = state.categories.find(item => item.id === app.category);
  const card = element('article', `app-card color-${category.color}`);
  const top = element('div', 'card-top');
  const badge = element('span', 'app-icon');
  badge.innerHTML = icon(category.icon);
  const stage = element('span', `stage-pill stage-${app.status}`, labels[app.status]);
  top.append(badge, stage);
  const meta = element('div', 'card-category', category.name);
  const title = element('h3', '', app.name);
  const description = element('p', 'card-description', app.summary);
  const skills = element('div', 'card-skills');
  app.skills.slice(0, 3).forEach(skill => skills.append(element('span', '', skill)));
  const bottom = element('div', 'card-bottom');
  bottom.append(element('span', 'card-index', `${String(state.apps.indexOf(app) + 1).padStart(2, '0')} / ${app.category}`));
  const button = element('button', 'concept-button', 'View concept');
  button.type = 'button';
  button.setAttribute('aria-label', `View concept: ${app.name}`);
  button.append(element('span', '', '↗'));
  button.addEventListener('click', () => openConcept(app, button));
  if (app.status !== 'planned') {
    const launch = element('a', 'launch-link', app.status === 'ready' ? 'Open app ↗' : 'Try prototype ↗');
    launch.href = appPath(app);
    bottom.append(launch);
    button.textContent = 'Details';
  }
  bottom.append(button);
  card.append(top, meta, title, description, skills, bottom);
  return card;
}

function renderApps() {
  const query = state.query.toLocaleLowerCase().trim();
  const filtered = state.apps.filter(app =>
    (state.category === 'all' || app.category === state.category) &&
    (state.status === 'all' || app.status === state.status) &&
    (!query || [app.name, app.summary, app.category, ...app.skills].join(' ').toLocaleLowerCase().includes(query))
  );
  $('#app-grid').replaceChildren(...filtered.map(createCard));
  $('#app-grid').setAttribute('aria-busy', 'false');
  $('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'project' : 'projects'} on the board`;
  $('#empty-state').hidden = filtered.length !== 0;
  $('#clear-filters').hidden = state.category === 'all' && state.status === 'all' && !state.query;
}

function resetFilters() {
  state.category = 'all'; state.query = ''; state.status = 'all';
  $('#search').value = ''; $('#status-filter').value = 'all';
  renderCategories(); renderApps();
}

function openConcept(app, opener) {
  lastOpener = opener;
  $('#dialog-category').textContent = state.categories.find(c => c.id === app.category).name;
  $('#dialog-status').textContent = labels[app.status];
  $('#dialog-status').className = `stage-pill stage-${app.status}`;
  $('#dialog-title').textContent = app.name;
  $('#dialog-summary').textContent = app.summary;
  $('#dialog-problem').textContent = app.brief.problem;
  $('#dialog-audience').textContent = app.brief.audience;
  $('#dialog-features').replaceChildren(...app.brief.features.map(feature => element('li', '', feature)));
  $('#dialog-skills').replaceChildren(...app.skills.map(skill => element('span', '', skill)));
  $('#dialog-note').textContent = app.status === 'planned'
    ? 'This is a project idea, not a working app yet. The repository foundation is ready for its implementation.'
    : app.status === 'prototype' ? 'This is an early prototype. Its case study records the current scope and limitations.' : 'This app is marked ready. See its source and case study for implementation details.';
  const actions = $('#dialog-actions');
  actions.replaceChildren();
  if (app.status !== 'planned') {
    const launch = element('a', 'button button-dark', app.status === 'ready' ? 'Open app ↗' : 'Try prototype ↗');
    launch.href = appPath(app); actions.append(launch);
    if (repositoryUrl()) {
      const source = element('a', 'text-link', 'View source ↗');
      source.href = `${repositoryUrl()}/tree/main/Vibcoding/${app.category}/${app.id}`;
      actions.append(source);
    }
  } else {
    actions.append(element('code', 'generator-command', `npm run create:app -- ${app.category} ${app.id}`));
  }
  dialog.showModal();
}

function closeDialog() { dialog.close(); lastOpener?.focus(); }
$('#close-dialog').addEventListener('click', closeDialog);
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(); } });
dialog.addEventListener('close', () => lastOpener?.focus());
$('#search').addEventListener('input', event => { state.query = event.target.value; renderApps(); });
$('#status-filter').addEventListener('change', event => { state.status = event.target.value; renderApps(); });
$('#clear-filters').addEventListener('click', resetFilters);
$('#reset-empty').addEventListener('click', resetFilters);
$('#retry-load').addEventListener('click', load);
document.addEventListener('keydown', event => {
  if (event.key === '/' && !dialog.open && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    event.preventDefault(); $('#search').focus();
  }
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const next = theme === 'dark' ? 'light' : 'dark';
  $('#theme-toggle').innerHTML = icon(next === 'dark' ? 'moon' : 'sun');
  $('#theme-toggle').setAttribute('aria-label', `Switch to ${next} theme`);
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#181d18' : '#f7f8f2';
}
let savedTheme;
try { savedTheme = localStorage.getItem('001-public:theme'); } catch { /* Storage is optional. */ }
setTheme(['dark', 'light'].includes(savedTheme) ? savedTheme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
$('#theme-toggle').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem('001-public:theme', theme); } catch { /* Still works for this visit. */ }
});
hydrateIcons();
$('#year').textContent = new Date().getFullYear();

async function load() {
  $('#load-error').hidden = true;
  $('#empty-state').hidden = true;
  $('#app-grid').setAttribute('aria-busy', 'true');
  try {
    const [apps, categories, config] = await Promise.all(['./catalogue.json', './categories.json', '../portfolio.json'].map(async path => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }));
    Object.assign(state, { apps, categories, config });
    $('#collection-count').textContent = categories.length;
    $('#idea-count').textContent = apps.filter(app => app.status === 'planned').length;
    $('#live-count').textContent = apps.filter(app => app.status === 'ready').length;
    $('#owner-name').textContent = config.ownerName;
    if (repositoryUrl()) { $('#repo-link').href = repositoryUrl(); $('#repo-link').textContent = 'View on GitHub ↗'; }
    renderCategories(); renderApps();
  } catch (error) {
    $('#app-grid').replaceChildren();
    $('#app-grid').setAttribute('aria-busy', 'false');
    $('#result-count').textContent = 'Collection unavailable';
    $('#load-error').hidden = false;
    console.error('Could not load the app catalogue:', error);
  }
}
load();
