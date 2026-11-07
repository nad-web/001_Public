import { THEMES, formatValue } from './model.js';
import { linkPath } from './layout.js';
export const NS = 'http://www.w3.org/2000/svg';
export function svgElement(tag, attributes = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}
function truncate(text, maximum = 25) {
  return text.length > maximum ? text.slice(0, maximum - 1) + '…' : text;
}
export function renderSVG(graph, { selected = '', interactive = true, transparent = false, onSelect, onDragStart, onKey } = {}) {
  const s = graph.settings, theme = THEMES[s.theme];
  const svg = svgElement('svg', {
    xmlns: NS, width: s.width, height: s.height, viewBox: '0 0 ' + s.width + ' ' + s.height,
    role: 'img', 'aria-label': s.title || 'Sankey diagram', 'font-family': 'Arial, Helvetica, sans-serif',
  });
  svg.append(svgElement('title', {}, s.title || 'Sankey diagram'));
  svg.append(svgElement('desc', {}, s.subtitle + '. Flow widths are proportional to their values. Developed by Noorullah Adel.'));
  if (!transparent) svg.append(svgElement('rect', { width: s.width, height: s.height, fill: s.background || theme.background, 'data-background': 'true' }));
  svg.append(svgElement('text', { x: 48, y: 58, 'font-size': 29, 'font-weight': '700', fill: theme.ink }, s.title));
  svg.append(svgElement('text', { x: 48, y: 89, 'font-size': 16, fill: theme.muted }, s.subtitle));
  svg.append(svgElement('line', { x1: 48, x2: s.width - 48, y1: 112, y2: 112, stroke: theme.line }));
  const defs = svgElement('defs'), paths = svgElement('g', { 'data-layer': 'flows', fill: 'none' });
  for (const link of [...graph.links].sort((a, b) => b.width - a.width)) {
    const gradientId = 'flow-gradient-' + link.index;
    const gradient = svgElement('linearGradient', { id: gradientId, gradientUnits: 'userSpaceOnUse', x1: link.source.x1, x2: link.target.x0, y1: link.y0, y2: link.y1 });
    gradient.append(svgElement('stop', { offset: '0%', 'stop-color': link.source.color }), svgElement('stop', { offset: '100%', 'stop-color': link.target.color }));
    defs.append(gradient);
    const stroke = link.color || (s.linkMode === 'gradient' ? 'url(#' + gradientId + ')' :
      s.linkMode === 'source' ? link.source.color : s.linkMode === 'target' ? link.target.color : theme.muted);
    const active = selected === link.id;
    const path = svgElement('path', {
      d: linkPath(link, s.curvature), stroke, 'stroke-width': Math.max(0.3, link.width),
      'stroke-opacity': active ? 0.85 : s.opacity, 'data-flow-id': link.id,
      ...(interactive ? { tabindex: 0, role: 'button', 'aria-label': link.source.label + ' to ' + link.target.label + ': ' + formatValue(link.value, s) } : {}),
    });
    path.append(svgElement('title', {}, link.source.label + ' → ' + link.target.label + '\n' + formatValue(link.value, s)));
    if (interactive) {
      path.addEventListener('click', () => onSelect?.('link', link.id));
      path.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.('link', link.id); } });
    }
    paths.append(path);
  }
  svg.append(defs, paths);
  const nodes = svgElement('g', { 'data-layer': 'nodes' });
  for (const node of graph.nodes) {
    const active = selected === node.id;
    const g = svgElement('g', {
      'data-node-id': node.id,
      ...(interactive ? { tabindex: 0, role: 'button', 'aria-pressed': active, 'aria-label': node.label + ': ' + formatValue(node.value, s) + '. Use up and down arrows to move.' } : {}),
    });
    const rect = svgElement('rect', {
      x: node.x0, y: node.y0, width: node.x1 - node.x0, height: Math.max(0.5, node.y1 - node.y0),
      rx: 3, fill: node.color, stroke: active ? theme.ink : node.color, 'stroke-width': active ? 3 : 0,
    });
    const onRight = node.x0 < s.width * 0.7;
    const labelX = onRight ? node.x1 + 12 : node.x0 - 12;
    const labelY = (node.y0 + node.y1) / 2;
    const labelGroup = svgElement('g', { 'pointer-events': 'none' });
    if (s.labels !== 'none') {
      const label = svgElement('text', { x: labelX, y: labelY + (s.labels === 'both' ? -3 : 5), fill: theme.ink, 'text-anchor': onRight ? 'start' : 'end', 'font-size': s.fontSize, 'font-weight': '600' },
        s.labels === 'value' ? formatValue(node.value, s) : truncate(node.label, s.width < 1000 ? 18 : 25));
      // Paint a thin canvas-coloured halo to keep labels legible over ribbons.
      label.setAttribute('paint-order', 'stroke');
      label.setAttribute('stroke', s.background || theme.background);
      label.setAttribute('stroke-width', '4');
      label.setAttribute('stroke-linejoin', 'round');
      labelGroup.append(label);
      if (s.labels === 'both') {
        const valueLabel = svgElement('text', { x: labelX, y: labelY + s.fontSize + 1, fill: theme.muted, 'text-anchor': onRight ? 'start' : 'end', 'font-size': s.fontSize - 2, 'paint-order': 'stroke', stroke: s.background || theme.background, 'stroke-width': 3 }, formatValue(node.value, s));
        labelGroup.append(valueLabel);
      }
    }
    g.append(svgElement('title', {}, node.label + '\n' + formatValue(node.value, s)), rect, labelGroup);
    if (interactive) {
      g.addEventListener('click', () => onSelect?.('node', node.id));
      g.addEventListener('pointerdown', (event) => onDragStart?.(event, node));
      g.addEventListener('keydown', (event) => onKey?.(event, node));
    }
    nodes.append(g);
  }
  svg.append(nodes);
  if (!graph.nodes.length) {
    svg.append(svgElement('text', { x: s.width / 2, y: s.height / 2 - 12, 'text-anchor': 'middle', fill: theme.ink, 'font-size': 28, 'font-weight': 600 }, 'Every story starts with a flow.'));
    svg.append(svgElement('text', { x: s.width / 2, y: s.height / 2 + 28, 'text-anchor': 'middle', fill: theme.muted, 'font-size': 18 }, 'Add a flow or choose a template to get started.'));
  }
  if (s.showCredit) {
    svg.append(svgElement('circle', { cx: 54, cy: s.height - 39, r: 5, fill: '#8671db' }));
    svg.append(svgElement('text', { x: 69, y: s.height - 34, fill: theme.muted, 'font-size': 13 }, 'Created with Sankey Studio · Developed by Noorullah Adel'));
  }
  return svg;
}
