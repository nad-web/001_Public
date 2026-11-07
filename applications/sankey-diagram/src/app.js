import { DEFAULT_SETTINGS, LIMITS, PALETTES, THEMES, clone, normalizeProject, projectFile, nextId, totals, formatValue, parseDelimited, toCSV, exportSize } from './model.js';
import { SAMPLES, fromSample, blankProject } from './samples.js';
import { createLayout, positionNode } from './layout.js';
import { renderSVG } from './render.js';
import { svgBlob, imageBlob, downloadBlob, filename, shareBlob } from './export.js';
import './pwa.js';

const $ = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const STORAGE = 'noorullah-lab:sankey-diagram:project:v1';
const UI_STORAGE = 'noorullah-lab:sankey-diagram:interface:v1';
let project = fromSample('income'), selected = null, graph, zoom = 1, fitting = true;
let undoStack = [], redoStack = [], lastEdit = { key: '', time: 0 }, pendingShare = null, toastTimer, lastExportURL;
let startupWarning = '';
try {
  const saved = localStorage.getItem(STORAGE);
  if (saved) project = normalizeProject(JSON.parse(saved));
  const ui = localStorage.getItem(UI_STORAGE);
  if (ui === 'dark') document.body.dataset.interface = 'dark';
} catch {
  startupWarning = 'The saved project could not be read. An example is open. Import a project backup to restore your work.';
}
function element(tag, className, content) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (content !== undefined) result.textContent = content;
  return result;
}
function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon'); svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  use.setAttribute('href', '#i-' + name); svg.append(use);
  return svg;
}
function button(label, className, handler, iconName) {
  const b = element('button', className); b.type = 'button';
  if (iconName) b.append(icon(iconName));
  if (label) b.append(document.createTextNode(label));
  b.addEventListener('click', handler); return b;
}
function toast(message, error = false) {
  clearTimeout(toastTimer);
  const output = $('#toast'); output.textContent = message;
  output.classList.toggle('error', error); output.hidden = false;
  toastTimer = setTimeout(() => { output.hidden = true; }, error ? 8500 : 4500);
}
function safe(action, errorSelector) {
  try { action(); return true; } catch (error) {
    if (errorSelector) $(errorSelector).textContent = error.message;
    else toast(error.message, true);
    return false;
  }
}
function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify(projectFile(project))); $('#save-state').textContent = 'Saved locally'; }
  catch { $('#save-state').textContent = 'Not saved'; toast('Browser storage is unavailable or full. Download your project to keep your work.', true); }
}
function commit(candidate, { key = '', controls = true, data = true } = {}) {
  const next = normalizeProject(candidate);
  if (JSON.stringify(next) === JSON.stringify(project)) return;
  const now = Date.now();
  if (!key || key !== lastEdit.key || now - lastEdit.time > 900) {
    undoStack.push(clone(project)); if (undoStack.length > 80) undoStack.shift();
  }
  lastEdit = { key, time: now }; redoStack = [];
  project = next; pendingShare = null; $('#share-button').textContent = 'Share a PNG file';
  if (selected && !(selected.type === 'node' ? project.nodes : project.links).some((n) => n.id === selected.id)) selected = null;
  persist(); renderAll({ controls, data });
}
function change(mutator, options) {
  const candidate = clone(project); mutator(candidate); commit(candidate, options);
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(clone(project)); project = undoStack.pop(); selected = null;
  lastEdit = { key: '', time: 0 }; pendingShare = null; $('#share-button').textContent = 'Share a PNG file'; persist(); renderAll();
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(clone(project)); project = redoStack.pop(); selected = null;
  lastEdit = { key: '', time: 0 }; pendingShare = null; $('#share-button').textContent = 'Share a PNG file'; persist(); renderAll();
}
function openDialog(id) {
  const dialog = $('#' + id);
  if (!dialog.open) dialog.showModal();
}
async function confirmAction(title, message) {
  const dialog = $('#confirm-dialog');
  $('#confirm-title').textContent = title; $('#confirm-message').textContent = message;
  dialog.returnValue = 'cancel'; dialog.showModal();
  return new Promise((resolve) => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'), { once: true }));
}
function panel(name, focus = false) {
  all('[data-panel]').forEach((tab) => {
    const active = tab.dataset.panel === name;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    $('#panel-' + tab.dataset.panel).hidden = !active;
    if (active && focus) tab.focus();
  });
}
function select(kind, id) {
  selected = { type: kind, id }; renderDiagram(); renderSelection();
}
function sourceSelect(current, label, onChange) {
  const input = element('select');
  input.setAttribute('aria-label', label);
  project.nodes.forEach((n) => {
    const option = element('option', '', n.label); option.value = n.id;
    input.append(option);
  });
  input.value = current; input.addEventListener('change', () => { if (!safe(() => onChange(input.value))) renderFlows(); });
  return input;
}
function renderFlows() {
  const list = $('#flow-list'); list.replaceChildren();
  if (!project.links.length) list.append(element('p', 'empty-data', 'Add your first connection below.'));
  project.links.forEach((link, index) => {
    const row = element('div', 'flow-row'); row.dataset.rowId = link.id;
    const source = sourceSelect(link.source, 'Flow ' + (index + 1) + ' source', (id) => change((p) => { p.links[index].source = id; }));
    const target = sourceSelect(link.target, 'Flow ' + (index + 1) + ' destination', (id) => change((p) => { p.links[index].target = id; }));
    const input = element('input'); input.type = 'number'; input.min = '0'; input.max = String(LIMITS.value); input.step = 'any';
    input.inputMode = 'decimal'; input.value = link.value;
    input.setAttribute('aria-label', 'Flow ' + (index + 1) + ' value');
    input.addEventListener('input', () => {
      if (!input.value.trim() || !input.validity.valid) return;
      safe(() => change((p) => { p.links[index].value = Number(input.value); }, { key: 'flow-value-' + link.id, data: false, controls: false }));
    });
    input.addEventListener('change', () => {
      const success = safe(() => {
        if (!input.value.trim()) throw new Error('Enter a flow value, or delete the flow.');
        change((p) => { p.links[index].value = Number(input.value); }, { key: 'flow-value-' + link.id });
      });
      if (!success) input.value = link.value;
    });
    const remove = button('', 'icon-button', () => safe(() => change((p) => { p.links.splice(index, 1); })), 'delete');
    remove.setAttribute('aria-label', 'Delete flow ' + (index + 1)); remove.title = 'Delete flow';
    row.append(source, target, input, remove); list.append(row);
  });
  $('#link-count').textContent = project.links.length + (project.links.length === 1 ? ' flow' : ' flows');
}
function renderNodes() {
  const list = $('#node-list'); list.replaceChildren();
  if (!project.nodes.length) list.append(element('p', 'empty-data', 'Nodes are created when you add flows.'));
  const palette = PALETTES[project.settings.palette].colors;
  project.nodes.forEach((node, index) => {
    const row = element('div', 'node-row');
    const colour = element('input'); colour.type = 'color'; colour.value = node.color || palette[index % palette.length];
    colour.setAttribute('aria-label', 'Colour for ' + node.label);
    colour.addEventListener('input', () => safe(() => change((p) => { p.nodes[index].color = colour.value; }, { key: 'node-colour-' + node.id, data: false, controls: false })));
    const name = element('input'); name.type = 'text'; name.value = node.label; name.maxLength = 80;
    name.setAttribute('aria-label', 'Name for ' + node.label);
    name.addEventListener('change', () => { if (!safe(() => change((p) => { p.nodes[index].label = name.value; }))) name.value = node.label; });
    const reset = button('↺', 'icon-button', () => safe(() => change((p) => { p.nodes[index].color = ''; })));
    reset.setAttribute('aria-label', 'Reset ' + node.label + ' colour to palette'); reset.title = 'Use palette colour';
    const remove = button('', 'icon-button', async () => {
      const count = project.links.filter((l) => l.source === node.id || l.target === node.id).length;
      if (count && !await confirmAction('Delete ' + node.label + '?', 'This will also remove ' + count + ' connected flows. You can undo this action.')) return;
      safe(() => change((p) => { p.nodes = p.nodes.filter((n) => n.id !== node.id); p.links = p.links.filter((l) => l.source !== node.id && l.target !== node.id); }));
    }, 'delete');
    remove.setAttribute('aria-label', 'Delete node ' + node.label);
    row.append(colour, name, reset, remove); list.append(row);
  });
}
function renderHealth() {
  const summary = totals(project), container = $('#health-content'); container.replaceChildren();
  const zeros = project.links.filter((l) => l.value === 0).length;
  const unused = project.nodes.filter((n) => !project.links.some((l) => l.value > 0 && (l.source === n.id || l.target === n.id))).length;
  const count = summary.imbalances.length + (zeros ? 1 : 0) + (unused ? 1 : 0);
  $('#health-summary').textContent = count ? 'Data checks · ' + count + ' notes' : 'Data checks · all clear';
  $('#health-details').classList.toggle('warning', !!count);
  if (!count) container.append(element('p', '', 'Valid one-way flows. All intermediate totals balance.'));
  summary.imbalances.forEach((n) => container.append(element('p', '', n.label + ': incoming ' + formatValue(n.incoming, project.settings) + ', outgoing ' + formatValue(n.outgoing, project.settings) + '. No balancing flow has been added.')));
  if (zeros) container.append(element('p', '', zeros + ' zero-value flows are saved but not drawn.'));
  if (unused) container.append(element('p', '', unused + ' nodes have no positive flows and are not drawn.'));
  container.append(element('p', '', 'Total input counts source nodes once; it does not add every ribbon across all stages.'));
  if (graph.effectiveGap < project.settings.nodeGap - 0.1) container.append(element('p', '', 'Spacing was reduced to keep this dense diagram visible. Increase the canvas height or hide labels for a clearer view.'));
}
function renderSelection() {
  const container = $('#selection-panel'); container.replaceChildren(); container.hidden = !selected;
  if (!selected) return;
  if (selected.type === 'link') {
    const link = project.links.find((l) => l.id === selected.id);
    if (!link) { container.hidden = true; return; }
    const names = new Map(project.nodes.map((n) => [n.id, n.label]));
    container.append(element('h3', '', names.get(link.source) + ' → ' + names.get(link.target)));
    container.append(element('p', '', formatValue(link.value, project.settings)));
    const label = element('label', 'field', 'Individual flow colour');
    const input = element('input'); input.type = 'color'; input.value = link.color || graph.colors.get(link.source);
    input.addEventListener('input', () => safe(() => change((p) => { p.links.find((l) => l.id === link.id).color = input.value; }, { key: 'flow-colour-' + link.id, data: false, controls: false })));
    label.append(input); container.append(label, button('Use palette / gradient', 'text-button', () => safe(() => change((p) => { p.links.find((l) => l.id === link.id).color = ''; }))));
  } else {
    const node = project.nodes.find((n) => n.id === selected.id);
    if (!node) { container.hidden = true; return; }
    const values = totals(project);
    container.append(element('h3', '', node.label), element('p', '', 'In: ' + formatValue(values.incoming.get(node.id), project.settings) + ' · Out: ' + formatValue(values.outgoing.get(node.id), project.settings)));
    const actions = element('div', 'dialog-actions');
    actions.append(button('Move up ↑', 'button', () => nudgeNode(node.id, -12)), button('Move down ↓', 'button', () => nudgeNode(node.id, 12)));
    container.append(actions, button('Edit node names & colours', 'text-button', () => { setDataView('nodes'); }));
  }
  container.append(button('Clear selection', 'text-button', () => { selected = null; renderDiagram(); renderSelection(); }));
}
function renderControls() {
  all('[data-setting]').forEach((input) => {
    const value = project.settings[input.dataset.setting];
    if (input.type === 'checkbox') input.checked = value;
    else input.value = String(value);
  });
  all('[data-theme]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === project.settings.theme)));
  all('[data-palette]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.palette === project.settings.palette)));
  $('#canvas-background').value = project.settings.background || THEMES[project.settings.theme].background;
  renderOutputs();
}
function renderOutputs() {
  ['opacity', 'nodeWidth', 'nodeGap', 'curvature'].forEach((key) => {
    $('#output-' + key).value = (key === 'opacity' || key === 'curvature') ? Math.round(project.settings[key] * 100) + '%' : project.settings[key] + ' px';
  });
  try {
    const size = exportSize(project.settings.width, project.settings.height, Number($('#export-scale').value));
    $('#export-dimensions').textContent = size.width + ' × ' + size.height + ' pixels · SVG remains resolution independent.';
  } catch (error) { $('#export-dimensions').textContent = error.message; }
}
function fitSurface() {
  if (!graph) return;
  const viewport = $('#diagram-viewport'), surface = $('#diagram-surface');
  const availableWidth = Math.max(100, viewport.clientWidth - (innerWidth < 680 ? 22 : 42));
  const availableHeight = Math.max(100, viewport.clientHeight - 38);
  const fitScale = Math.min(availableWidth / project.settings.width, availableHeight / project.settings.height);
  const ratio = fitScale * zoom;
  surface.style.width = Math.max(80, project.settings.width * ratio) + 'px';
  surface.style.height = Math.max(50, project.settings.height * ratio) + 'px';
  $('#fit-button').textContent = fitting ? 'Fit' : Math.round(ratio * 100) + '%';
  $('.preview-tip').textContent = innerWidth <= 680 ? 'Zoom with + · edit data below' : 'Drag nodes to arrange · tap a flow to edit';
}
function renderDiagram() {
  $('#diagram-surface').replaceChildren(renderSVG(graph, {
    selected: selected?.id || '', onSelect: select, onDragStart: beginDrag,
    onKey: (event, node) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault(); nudgeNode(node.id, (event.key === 'ArrowUp' ? -1 : 1) * (event.shiftKey ? 30 : 5));
      } else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select('node', node.id); }
    },
  }));
  fitSurface();
}
function renderAll({ controls = true, data = true } = {}) {
  graph = createLayout(project);
  renderDiagram();
  if (data) { renderFlows(); renderNodes(); }
  renderHealth(); renderSelection();
  if (controls) renderControls(); else renderOutputs();
  $('#metric-total').textContent = formatValue(totals(project).sourceTotal, project.settings);
  $('#metric-nodes').textContent = project.nodes.length;
  $('#metric-links').textContent = project.links.length;
  $('#document-title').textContent = project.settings.title || 'Untitled flow';
  $('#undo-button').disabled = !undoStack.length; $('#redo-button').disabled = !redoStack.length;
  document.title = (project.settings.title || 'Sankey Studio') + ' · Sankey Studio by Noorullah Adel';
  $('#diagram-accessible').textContent = project.nodes.length + ' nodes, ' + project.links.length + ' flows. Total input ' + formatValue(totals(project).sourceTotal, project.settings) + '. All flows are available in the Data editor.';
}
function nudgeNode(id, delta) {
  const node = graph.nodes.find((n) => n.id === id); if (!node) return;
  const y = positionNode(graph, id, node.y0 + delta);
  safe(() => change((p) => { p.nodes.find((n) => n.id === id).position = { y }; }, { key: 'move-' + id }));
  selected = { type: 'node', id }; renderSelection();
  $('#diagram-surface').querySelector('[data-node-id="' + id + '"]')?.focus();
}
function beginDrag(event, node) {
  if (event.button !== 0) return;
  event.preventDefault();
  const initialSVG = $('#diagram-surface svg'), matrix = initialSVG.getScreenCTM();
  if (!matrix) return;
  const point = (e) => new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
  const start = point(event), oldY = node.y0;
  let moved = false, y = node.position?.y;
  function move(e) {
    if (e.pointerId !== event.pointerId) return;
    const dy = point(e).y - start.y;
    if (Math.abs(dy) > 2) moved = true;
    if (moved) { y = positionNode(graph, node.id, oldY + dy); selected = { type: 'node', id: node.id }; renderDiagram(); }
  }
  function finish(e) {
    if (e.pointerId !== event.pointerId) return;
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', cancel);
    if (moved) safe(() => change((p) => { p.nodes.find((n) => n.id === node.id).position = { y }; }));
    select('node', node.id);
  }
  function cancel() {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', cancel);
    graph = createLayout(project); renderDiagram();
  }
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', cancel);
}
function setDataView(view) {
  $('#flows-view').hidden = view !== 'flows'; $('#nodes-view').hidden = view !== 'nodes';
  ['flows', 'nodes'].forEach((name) => { $('#view-' + name).classList.toggle('active', name === view); $('#view-' + name).setAttribute('aria-pressed', String(name === view)); });
  panel('data');
}
function setupDesign() {
  for (const [id, theme] of Object.entries(THEMES)) {
    const b = button('', 'theme-option', () => safe(() => change((p) => { p.settings.theme = id; p.settings.background = ''; })));
    b.dataset.theme = id; b.setAttribute('aria-label', theme.name + ' canvas theme');
    const preview = element('span'); preview.style.background = theme.background; preview.style.border = '1px solid ' + theme.line;
    preview.append(element('i'), element('i'), element('i')); b.append(preview, document.createTextNode(theme.name));
    $('#theme-options').append(b);
  }
  for (const [id, palette] of Object.entries(PALETTES)) {
    const b = button('', 'palette-option', () => safe(() => change((p) => { p.settings.palette = id; })));
    b.dataset.palette = id; b.setAttribute('aria-label', palette.name + ' palette');
    const swatches = element('span', 'palette-swatches'); swatches.setAttribute('aria-hidden', 'true');
    palette.colors.slice(0, 6).forEach((color) => { const swatch = element('span'); swatch.style.background = color; swatches.append(swatch); });
    b.append(swatches, document.createTextNode(palette.name)); $('#palette-options').append(b);
  }
  all('[data-setting]').forEach((input) => {
    const update = () => {
      const key = input.dataset.setting;
      const numeric = ['width', 'height', 'nodeWidth', 'nodeGap', 'fontSize', 'opacity', 'curvature', 'decimals'].includes(key);
      const value = input.type === 'checkbox' ? input.checked : numeric ? Number(input.value) : input.value;
      const success = safe(() => {
        if (numeric && input.value.trim() === '') throw new Error('Enter a value for ' + key + '.');
        change((p) => { p.settings[key] = value; }, { key: 'setting-' + key, controls: false, data: false });
      });
      if (!success) renderControls();
    };
    input.addEventListener(input.type === 'range' || (input.tagName === 'INPUT' && input.type !== 'checkbox' && input.type !== 'number') ? 'input' : 'change', update);
  });
  $('#canvas-background').addEventListener('input', (event) => safe(() => change((p) => { p.settings.background = event.target.value; }, { key: 'canvas-background', controls: false, data: false })));
  $('#reset-background').addEventListener('click', () => safe(() => change((p) => { p.settings.background = ''; })));
  $('#reset-design').addEventListener('click', async () => {
    if (!await confirmAction('Reset styling?', 'Your flow data and labels will stay. Custom colours, positions and styling will reset.')) return;
    safe(() => change((p) => {
      p.settings = { ...DEFAULT_SETTINGS, title: p.settings.title, subtitle: p.settings.subtitle, unit: p.settings.unit, unitPosition: p.settings.unitPosition };
      p.nodes.forEach((n) => { n.color = ''; delete n.position; }); p.links.forEach((l) => { l.color = ''; });
    }));
  });
}
function setupTemplates() {
  SAMPLES.forEach((sample) => {
    const card = button('', 'template-card', async () => {
      $('#templates-dialog').close();
      if (!await confirmAction('Use ' + sample.name + '?', 'This replaces the current diagram with example data. Download a project backup first if needed. You can also undo.')) return;
      selected = null; safe(() => commit(fromSample(sample.id))); zoom = 1; fitting = true; fitSurface(); toast(sample.name + ' is ready to customise.');
    });
    const miniature = element('span', 'template-mini');
    const data = fromSample(sample.id); Object.assign(data.settings, { title: '', subtitle: '', width: 640, height: 400, labels: 'none', showCredit: false });
    const svg = renderSVG(createLayout(data), { interactive: false }); svg.style.width = '100%'; svg.style.height = '100%'; svg.setAttribute('aria-hidden', 'true');
    miniature.append(svg); card.append(miniature, element('small', '', sample.category), element('strong', '', sample.name), element('p', '', sample.description));
    $('#template-grid').append(card);
  });
}
function importProject(source, forceJSON = false) {
  if (new Blob([source]).size > LIMITS.bytes) throw new Error('Files must be smaller than 2 MB.');
  let candidate;
  if (forceJSON || source.trim().startsWith('{')) {
    try { candidate = normalizeProject(JSON.parse(source)); }
    catch (error) { throw new Error('Project could not be opened: ' + error.message); }
  } else candidate = parseDelimited(source);
  selected = null; commit(candidate); zoom = 1; fitting = true; fitSurface();
  $('#import-dialog').close(); $('#import-error').textContent = ''; toast('Imported ' + project.links.length + ' flows. Your diagram is editable.');
}
async function importFile(file) {
  if (!file) return;
  $('#import-error').textContent = '';
  try {
    if (file.size > LIMITS.bytes) throw new Error('Files must be smaller than 2 MB.');
    importProject(await file.text(), /\.json$/i.test(file.name));
  } catch (error) { $('#import-error').textContent = error.message; }
  $('#file-input').value = '';
}
function setupImports() {
  const openImport = () => { $('#import-error').textContent = ''; openDialog('import-dialog'); };
  $('#open-button').addEventListener('click', openImport);
  $('#paste-button').addEventListener('click', () => { openImport(); $('#import-text').focus(); });
  $('#apply-import').addEventListener('click', () => safe(() => importProject($('#import-text').value), '#import-error'));
  $('#file-input').addEventListener('change', (e) => importFile(e.target.files[0]));
  const drop = $('.file-drop');
  drop.addEventListener('dragover', (event) => { event.preventDefault(); drop.classList.add('dragging'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('dragging'));
  drop.addEventListener('drop', (event) => { event.preventDefault(); drop.classList.remove('dragging'); importFile(event.dataTransfer.files[0]); });
}
function setupData() {
  $('#view-flows').addEventListener('click', () => setDataView('flows'));
  $('#view-nodes').addEventListener('click', () => setDataView('nodes'));
  $('#add-flow-button').addEventListener('click', () => {
    $('#flow-form').reset(); $('#flow-error').textContent = '';
    $('#node-suggestions').replaceChildren(...project.nodes.map((n) => { const o = element('option'); o.value = n.label; return o; }));
    openDialog('flow-dialog');
  });
  $('#flow-form').addEventListener('submit', (event) => {
    event.preventDefault();
    safe(() => {
      change((p) => {
        function getNode(label) {
          const existing = p.nodes.find((n) => n.label.toLocaleLowerCase() === label.trim().toLocaleLowerCase());
          if (existing) return existing.id;
          const id = nextId('node-', p.nodes); p.nodes.push({ id, label: label.trim(), color: '' }); return id;
        }
        const source = getNode($('#new-source').value), target = getNode($('#new-target').value);
        const id = nextId('flow-', p.links);
        p.links.push({ id, source, target, value: Number($('#new-value').value), color: '' });
      });
      $('#flow-dialog').close(); toast('Connection added.');
    }, '#flow-error');
  });
  $('#add-node-button').addEventListener('click', () => { $('#node-form').reset(); $('#node-error').textContent = ''; openDialog('node-dialog'); });
  $('#node-form').addEventListener('submit', (event) => {
    event.preventDefault();
    safe(() => { change((p) => p.nodes.push({ id: nextId('node-', p.nodes), label: $('#new-node-name').value, color: '' })); $('#node-dialog').close(); }, '#node-error');
  });
}
function offerFile(blob, name, isImage = false) {
  if (lastExportURL) URL.revokeObjectURL(lastExportURL);
  lastExportURL = downloadBlob(blob, name, true);
  const saveLink = $('#export-save-link'); saveLink.href = lastExportURL; saveLink.download = name;
  saveLink.textContent = 'Save ' + name; $('#export-result').hidden = false;
  $('#export-preview').hidden = !isImage;
  if (isImage) $('#export-preview').src = lastExportURL;
}
function saveProject() {
  offerFile(new Blob([JSON.stringify(projectFile(project), null, 2) + '\n'], { type: 'application/json' }), filename(project.settings.title, 'sankey.json'));
  toast('Project ready. Reopen it with Import data. A backup save link is available in Export.');
}
async function exportImage(type, initiatingButton) {
  initiatingButton.disabled = true;
  try {
    const transparent = $('#export-transparent').checked;
    const blob = type === 'svg' ? svgBlob(graph, transparent) : await imageBlob(graph, 'image/' + type, Number($('#export-scale').value), transparent);
    const name = filename(project.settings.title, type === 'jpeg' ? 'jpg' : type);
    offerFile(blob, name, true);
    $('#export-preview').alt = 'Preview of the exported ' + type.toUpperCase() + ' diagram';
    toast(type.toUpperCase() + ' exported. On iPhone, check your downloads or save the opened file to Files.');
  } catch (error) { toast(error.message, true); }
  finally { initiatingButton.disabled = false; }
}
function setupExports() {
  all('[data-export]').forEach((b) => b.addEventListener('click', () => exportImage(b.dataset.export, b)));
  $('#export-scale').addEventListener('change', renderOutputs);
  $('#save-project').addEventListener('click', saveProject);
  $('#export-csv').addEventListener('click', () => { offerFile(new Blob([toCSV(project)], { type: 'text/csv;charset=utf-8' }), filename(project.settings.title, 'csv')); toast('Flow data ready. Use Project JSON to preserve styling.'); });
  $('#print-button').addEventListener('click', () => { all('dialog[open]').forEach((d) => d.close()); window.print(); });
  $('#share-button').addEventListener('click', async () => {
    const b = $('#share-button');
    if (pendingShare) {
      try { await shareBlob(pendingShare.blob, pendingShare.name); pendingShare = null; b.textContent = 'Share a PNG file'; }
      catch (error) { if (error.name !== 'AbortError') toast(error.message, true); }
      return;
    }
    b.disabled = true; b.textContent = 'Preparing PNG…';
    try {
      const blob = await imageBlob(graph, 'image/png', Number($('#export-scale').value), $('#export-transparent').checked);
      const name = filename(project.settings.title, 'png');
      const file = new File([blob], name, { type: blob.type });
      if (!navigator.canShare?.({ files: [file] })) {
        downloadBlob(blob, name); toast('Sharing is unavailable here. Your PNG has been downloaded instead.'); b.textContent = 'Share a PNG file';
      } else {
        pendingShare = { blob, name }; b.textContent = 'Share PNG now'; toast('Your PNG is ready. Tap “Share PNG now” to choose where to save or send it.');
      }
    } catch (error) { toast(error.message, true); b.textContent = 'Share a PNG file'; }
    finally { b.disabled = false; }
  });
}
function setupWorkspace() {
  all('[data-panel]').forEach((tab, i, tabs) => {
    tab.addEventListener('click', () => panel(tab.dataset.panel));
    tab.addEventListener('keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        panel(tabs[next].dataset.panel, true);
      }
    });
  });
  all('[data-close]').forEach((b) => b.addEventListener('click', () => $('#' + b.dataset.close).close()));
  all('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }));
  $('#templates-button').addEventListener('click', () => openDialog('templates-dialog'));
  $('#help-button').addEventListener('click', () => openDialog('help-dialog'));
  $('#new-button').addEventListener('click', async () => { if (await confirmAction('Start a new diagram?', 'The current diagram will be replaced. Download a project backup first if needed. You can undo this action.')) { selected = null; safe(() => commit(blankProject())); } });
  $('#undo-button').addEventListener('click', undo); $('#redo-button').addEventListener('click', redo);
  $('#auto-layout').addEventListener('click', () => { safe(() => change((p) => p.nodes.forEach((n) => delete n.position))); toast('Automatic layout restored.'); });
  $('#reset-positions').addEventListener('click', () => { safe(() => change((p) => p.nodes.forEach((n) => delete n.position))); toast('Automatic layout restored.'); });
  $('#zoom-in').addEventListener('click', () => { zoom = Math.min(6, zoom * 1.25); fitting = false; fitSurface(); });
  $('#zoom-out').addEventListener('click', () => { zoom = Math.max(0.4, zoom / 1.25); fitting = false; fitSurface(); });
  $('#fit-button').addEventListener('click', () => { zoom = 1; fitting = true; fitSurface(); });
  $('#expand-button').addEventListener('click', () => {
    const expanded = $('.preview-panel').classList.toggle('expanded');
    $('#expand-button').setAttribute('aria-label', expanded ? 'Close expanded preview' : 'Expand diagram preview');
    $('#expand-button').setAttribute('aria-expanded', String(expanded)); requestAnimationFrame(fitSurface);
  });
  $('#interface-theme').addEventListener('click', () => {
    const dark = document.body.dataset.interface !== 'dark';
    document.body.dataset.interface = dark ? 'dark' : 'light';
    $('#interface-theme').setAttribute('aria-pressed', String(dark));
    try { localStorage.setItem(UI_STORAGE, dark ? 'dark' : 'light'); } catch { /* Editor still works without stored preferences. */ }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('.preview-panel').classList.contains('expanded')) { $('.preview-panel').classList.remove('expanded'); fitSurface(); }
    if (event.target.closest('input,textarea,select,[contenteditable]') || $('dialog[open]')) return;
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      if (event.key.toLowerCase() === 's') { event.preventDefault(); saveProject(); }
    }
  });
  if (window.ResizeObserver) new ResizeObserver(fitSurface).observe($('#diagram-viewport'));
  else window.addEventListener('resize', fitSurface);
}
setupDesign(); setupTemplates(); setupImports(); setupData(); setupExports(); setupWorkspace();
renderAll();
if (startupWarning) toast(startupWarning, true);
