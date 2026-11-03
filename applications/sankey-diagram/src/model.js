// Sankey Studio · Developed by Noorullah Adel. MIT licensed.
export const LIMITS = Object.freeze({ nodes: 120, links: 300, bytes: 2 * 1024 * 1024, value: 1e15 });
export const THEMES = Object.freeze({
  studio: { name: 'Studio', background: '#ffffff', ink: '#222b3c', muted: '#6c7586', line: '#e9edf4' },
  paper: { name: 'Warm paper', background: '#faf7ef', ink: '#393930', muted: '#787565', line: '#e7e2d5' },
  midnight: { name: 'Midnight', background: '#151c30', ink: '#f2f4fc', muted: '#a9b4ce', line: '#303b54' },
  forest: { name: 'Forest', background: '#f1f7f2', ink: '#203f32', muted: '#648071', line: '#dce8df' },
  blush: { name: 'Soft blush', background: '#fff5f4', ink: '#54343c', muted: '#96717b', line: '#f0dfe1' },
});
export const PALETTES = Object.freeze({
  signature: { name: 'Studio spectrum', colors: ['#8671db', '#baa6ea', '#54a99a', '#e3a053', '#db849d', '#709ec9', '#91b579', '#cdac65'] },
  ocean: { name: 'Ocean blues', colors: ['#365b9d', '#4989b5', '#5cb8c0', '#82ced0', '#6476b8', '#9ab8e1', '#438c8c'] },
  earth: { name: 'Earth & olive', colors: ['#617d57', '#90a16c', '#b4b48a', '#c89866', '#a87459', '#d5bf94', '#638b85'] },
  sunset: { name: 'Sunset', colors: ['#ce6579', '#e08d70', '#eab56a', '#b77fb5', '#8f83c4', '#e2a4ae', '#c49b69'] },
  accessible: { name: 'Distinct colours', colors: ['#0072b2', '#e69f00', '#009e73', '#cc79a7', '#d55e00', '#56b4e9', '#7c6b28'] },
  graphite: { name: 'Graphite', colors: ['#3e536c', '#6b7d94', '#90a0b6', '#b0bccb', '#536782', '#7e90a8'] },
});
export const DEFAULT_SETTINGS = Object.freeze({
  title: 'Where the money flows', subtitle: 'A monthly income story',
  theme: 'studio', palette: 'signature', width: 1440, height: 920,
  nodeWidth: 22, nodeGap: 26, fontSize: 17, opacity: 0.42, curvature: 0.5,
  align: 'justify', linkMode: 'gradient', labels: 'both', decimals: 0,
  unit: '€', unitPosition: 'prefix', showCredit: true, background: '',
});
const ID = /^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const BAD_XML = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/;
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const colorValid = (value) => typeof value === 'string' && HEX.test(value);
function text(value, label, maximum, allowEmpty = false) {
  if (typeof value !== 'string' || value.length > maximum || BAD_XML.test(value) || (!allowEmpty && !value.trim()))
    throw new Error(label + ' must be ' + (allowEmpty ? 'at most ' : '1–') + maximum + ' characters.');
  return value.trim();
}
function bounded(value, fallback, min, max, name, integer = false) {
  const result = value === undefined ? fallback : value;
  if (typeof result !== 'number' || !Number.isFinite(result) || result < min || result > max || (integer && !Number.isInteger(result)))
    throw new Error(name + ' must be between ' + min + ' and ' + max + '.');
  return result;
}
function option(value, fallback, choices, name) {
  const result = value === undefined ? fallback : value;
  if (!choices.includes(result)) throw new Error('Invalid ' + name + '.');
  return result;
}
export function normalizeProject(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('This is not a Sankey project.');
  if (input.app !== undefined && input.app !== 'noorullah-sankey-studio') throw new Error('This project belongs to another application.');
  if (input.schemaVersion !== undefined && input.schemaVersion !== 1) throw new Error('This project version is not supported.');
  const raw = input.project === undefined ? input : input.project;
  if (!raw || !Array.isArray(raw.nodes) || !Array.isArray(raw.links)) throw new Error('A project needs nodes and links arrays.');
  if (raw.nodes.length > LIMITS.nodes || raw.links.length > LIMITS.links) throw new Error('Use at most 120 nodes and 300 flows per project.');
  const ids = new Set(), names = new Set(), linkIds = new Set();
  const nodes = raw.nodes.map((node) => {
    if (!node || !ID.test(node.id || '') || ids.has(node.id)) throw new Error('Node IDs must be unique letters, numbers, hyphens or underscores.');
    ids.add(node.id);
    const label = text(node.label, 'Node label', 80);
    if (names.has(label.toLocaleLowerCase())) throw new Error('Each node needs a different label: ' + label);
    names.add(label.toLocaleLowerCase());
    if (node.color && !colorValid(node.color)) throw new Error('Node colours must use six-digit hex values.');
    const result = { id: node.id, label, color: node.color || '' };
    if (node.position !== undefined) {
      if (!node.position || typeof node.position !== 'object') throw new Error('Invalid node position.');
      result.position = { y: bounded(node.position.y, 0, 0, 1, 'Node position') };
    }
    return result;
  });
  const links = raw.links.map((link, i) => {
    if (!link || typeof link !== 'object') throw new Error('Invalid flow.');
    const id = link.id === undefined ? 'flow-' + (i + 1) : link.id;
    if (!ID.test(id) || linkIds.has(id)) throw new Error('Flow IDs must be valid and unique.');
    linkIds.add(id);
    if (!ids.has(link.source) || !ids.has(link.target)) throw new Error('Every flow must refer to existing source and destination nodes.');
    if (link.source === link.target) throw new Error('A flow cannot connect a node to itself.');
    const value = bounded(link.value, undefined, 0, LIMITS.value, 'Flow value');
    if (link.color && !colorValid(link.color)) throw new Error('Flow colours must use six-digit hex values.');
    return { id, source: link.source, target: link.target, value, color: link.color || '' };
  });
  // Validate topology before giving the graph to the iterative layout engine.
  const degree = new Map(nodes.map((n) => [n.id, 0]));
  const next = new Map(nodes.map((n) => [n.id, []]));
  for (const link of links) {
    degree.set(link.target, degree.get(link.target) + 1);
    next.get(link.source).push(link.target);
  }
  const queue = nodes.filter((n) => degree.get(n.id) === 0).map((n) => n.id);
  let visited = 0;
  for (let i = 0; i < queue.length; i++) {
    visited++;
    for (const target of next.get(queue[i])) {
      degree.set(target, degree.get(target) - 1);
      if (degree.get(target) === 0) queue.push(target);
    }
  }
  if (visited !== nodes.length) throw new Error('Circular flows are not supported. Remove the connection that leads back to an earlier node.');
  const s = raw.settings || {};
  if (s.showCredit !== undefined && typeof s.showCredit !== 'boolean') throw new Error('Credit visibility must be true or false.');
  const settings = {
    title: text(s.title === undefined ? DEFAULT_SETTINGS.title : s.title, 'Title', 120, true),
    subtitle: text(s.subtitle === undefined ? DEFAULT_SETTINGS.subtitle : s.subtitle, 'Subtitle', 180, true),
    theme: option(s.theme, 'studio', Object.keys(THEMES), 'theme'),
    palette: option(s.palette, 'signature', Object.keys(PALETTES), 'palette'),
    width: bounded(s.width, 1440, 640, 3200, 'Canvas width', true),
    height: bounded(s.height, 920, 400, 2400, 'Canvas height', true),
    nodeWidth: bounded(s.nodeWidth, 22, 8, 60, 'Node width'),
    nodeGap: bounded(s.nodeGap, 26, 4, 80, 'Node spacing'),
    fontSize: bounded(s.fontSize, 17, 10, 28, 'Label size'),
    opacity: bounded(s.opacity, 0.42, 0.1, 1, 'Flow opacity'),
    curvature: bounded(s.curvature, 0.5, 0.1, 0.9, 'Curve'),
    align: option(s.align, 'justify', ['justify', 'left', 'right', 'center'], 'alignment'),
    linkMode: option(s.linkMode, 'gradient', ['gradient', 'source', 'target', 'neutral'], 'flow colour mode'),
    labels: option(s.labels, 'both', ['both', 'name', 'value', 'none'], 'labels'),
    decimals: bounded(s.decimals, 0, 0, 4, 'Decimal places', true),
    unit: text(s.unit === undefined ? '€' : s.unit, 'Unit', 20, true),
    unitPosition: option(s.unitPosition, 'prefix', ['prefix', 'suffix'], 'unit position'),
    showCredit: s.showCredit === undefined ? true : !!s.showCredit,
    background: s.background || '',
  };
  if (settings.background && !colorValid(settings.background)) throw new Error('Invalid background colour.');
  return { nodes, links, settings };
}
export function projectFile(project) {
  return { app: 'noorullah-sankey-studio', schemaVersion: 1, developer: 'Noorullah Adel', project: normalizeProject(project) };
}
export function nextId(prefix, items) {
  const ids = new Set(items.map((item) => item.id));
  let index = 1;
  while (ids.has(prefix + index)) index++;
  return prefix + index;
}
export function totals(project) {
  const incoming = new Map(project.nodes.map((n) => [n.id, 0]));
  const outgoing = new Map(project.nodes.map((n) => [n.id, 0]));
  for (const link of project.links) {
    incoming.set(link.target, incoming.get(link.target) + link.value);
    outgoing.set(link.source, outgoing.get(link.source) + link.value);
  }
  const sourceTotal = project.nodes.reduce((sum, n) => sum + (incoming.get(n.id) === 0 ? outgoing.get(n.id) : 0), 0);
  const sinkTotal = project.nodes.reduce((sum, n) => sum + (outgoing.get(n.id) === 0 ? incoming.get(n.id) : 0), 0);
  const imbalances = project.nodes.filter((n) => {
    const a = incoming.get(n.id), b = outgoing.get(n.id);
    return a > 0 && b > 0 && Math.abs(a - b) > Math.max(a, b) * 1e-9;
  }).map((n) => ({ id: n.id, label: n.label, incoming: incoming.get(n.id), outgoing: outgoing.get(n.id) }));
  return { incoming, outgoing, sourceTotal, sinkTotal, imbalances };
}
export function formatValue(value, settings, compact = false) {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: settings.decimals,
    minimumFractionDigits: settings.decimals,
    ...(compact ? { notation: 'compact', minimumFractionDigits: 0 } : {}),
  }).format(value);
  return settings.unitPosition === 'prefix' ? settings.unit + formatted : formatted + (settings.unit ? ' ' + settings.unit : '');
}
// CSV parser supports quoted fields, embedded newlines, BOM, tabs and semicolons.
export function parseDelimited(source) {
  if (typeof source !== 'string' || source.length > LIMITS.bytes) throw new Error('Import files must be smaller than 2 MB.');
  const input = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!input.trim()) throw new Error('Paste some rows first.');
  const counts = { ',': 0, ';': 0, '\t': 0 };
  let inside = false;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '"') {
      if (inside && input[i + 1] === '"') i++;
      else inside = !inside;
    } else if (!inside && input[i] === '\n') break;
    else if (!inside && input[i] in counts) counts[input[i]]++;
  }
  const delimiter = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const rows = [];
  let row = [], field = '', quoted = false, afterQuote = false;
  const finish = () => { row.push(field); field = ''; afterQuote = false; };
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"') {
        if (input[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; afterQuote = true; }
      } else field += c;
    } else if (c === '"' && !field && !afterQuote) quoted = true;
    else if (c === delimiter) finish();
    else if (c === '\n') { finish(); if (row.some((v) => v.trim())) rows.push(row); row = []; }
    else if (afterQuote && !/\s/.test(c)) throw new Error('Unexpected text after a quoted CSV field.');
    else if (!afterQuote) field += c;
  }
  if (quoted) throw new Error('A quoted CSV field was not closed.');
  finish();
  if (row.some((v) => v.trim())) rows.push(row);
  if (!rows.length) throw new Error('No data rows found.');
  let indices = [0, 1, 2];
  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const names = [['source', 'from'], ['target', 'to', 'destination'], ['value', 'amount', 'weight']];
  const detected = names.map((aliases) => header.findIndex((h) => aliases.includes(h)));
  if (detected.every((n) => n >= 0)) { indices = detected; rows.shift(); }
  if (!rows.length) throw new Error('Add at least one flow below the header.');
  if (rows.length > LIMITS.links) throw new Error('Import at most 300 flow rows.');
  const nodes = [], links = [], ids = new Map();
  function getNode(label) {
    const clean = text(label, 'Node label', 80);
    const key = clean.toLocaleLowerCase();
    if (!ids.has(key)) {
      const id = 'node-' + (nodes.length + 1);
      ids.set(key, id); nodes.push({ id, label: clean, color: '' });
    }
    return ids.get(key);
  }
  rows.forEach((cells, i) => {
    if (indices.some((index) => cells[index] === undefined)) throw new Error('Row ' + (i + 1) + ' needs source, target and value.');
    const rawValue = cells[indices[2]].trim();
    // Do not guess whether 1,234 means a decimal or a thousands separator.
    const numeric = delimiter === ';' || delimiter === '\t' ? rawValue.replace(',', '.') : rawValue;
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(numeric)) throw new Error('Row ' + (i + 1) + ': use a nonnegative number, without currency symbols or thousands separators.');
    links.push({ id: 'flow-' + (i + 1), source: getNode(cells[indices[0]]), target: getNode(cells[indices[1]]), value: Number(numeric), color: '' });
  });
  return normalizeProject({ nodes, links, settings: { ...DEFAULT_SETTINGS, title: 'Untitled flow', subtitle: 'Imported data', unit: '' } });
}
export function toCSV(project) {
  const names = new Map(project.nodes.map((n) => [n.id, n.label]));
  const cell = (value) => {
    let valueText = String(value);
    // Neutralise spreadsheet formulas in label fields.
    if (/^[=+@\-\t\r]/.test(valueText)) valueText = "'" + valueText;
    return '"' + valueText.replaceAll('"', '""') + '"';
  };
  return '\uFEFFsource,target,value\r\n' + project.links.map((l) => [cell(names.get(l.source)), cell(names.get(l.target)), String(l.value)].join(',')).join('\r\n') + '\r\n';
}
export function exportSize(width, height, scale) {
  if (![width, height, scale].every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0)) throw new Error('Invalid export dimensions.');
  const w = Math.round(width * scale), h = Math.round(height * scale);
  if (w > 8192 || h > 8192 || w * h > 16000000) throw new Error('This image is too large for a reliable mobile export. Choose a smaller size or export SVG.');
  return { width: w, height: h };
}
