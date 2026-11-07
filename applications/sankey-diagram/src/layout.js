import sankey from './vendor/sankey.js';
import { justify, left, right, center } from './vendor/align.js';
import { PALETTES, normalizeProject } from './model.js';
const ALIGN = { justify, left, right, center };
export function createLayout(input) {
  const project = normalizeProject(input), settings = project.settings;
  const links = project.links.filter((l) => l.value > 0);
  const used = new Set(links.flatMap((l) => [l.source, l.target]));
  const palette = PALETTES[settings.palette].colors;
  const colors = new Map(project.nodes.map((n, i) => [n.id, n.color || palette[i % palette.length]]));
  const margin = { top: 145, bottom: 88, left: 130, right: 190 };
  if (settings.width < 1000) { margin.left = 95; margin.right = 140; }
  const extent = [[margin.left, margin.top], [settings.width - margin.right, settings.height - margin.bottom]];
  if (!links.length) return { nodes: [], links: [], extent, colors, settings, engine: null };
  const engine = sankey().nodeId((n) => n.id).nodeWidth(settings.nodeWidth).nodePadding(settings.nodeGap)
    .nodeAlign(ALIGN[settings.align]).extent(extent).iterations(32);
  let graph = engine({
    nodes: project.nodes.filter((n) => used.has(n.id)).map((n) => ({ ...n })),
    links: links.map((l) => ({ ...l })),
  });
  const counts = new Map();
  graph.nodes.forEach((n) => counts.set(n.layer, (counts.get(n.layer) || 0) + 1));
  const maxColumn = Math.max(...counts.values());
  const effectiveGap = maxColumn > 1 ? Math.min(settings.nodeGap, (extent[1][1] - extent[0][1]) * 0.30 / (maxColumn - 1)) : settings.nodeGap;
  if (effectiveGap < settings.nodeGap) graph = engine.nodePadding(effectiveGap)(graph);
  for (const node of graph.nodes) {
    node.color = colors.get(node.id);
    if (node.position) {
      const height = node.y1 - node.y0;
      const room = extent[1][1] - extent[0][1] - height;
      node.y0 = extent[0][1] + node.position.y * Math.max(0, room);
      node.y1 = node.y0 + height;
    }
  }
  engine.update(graph);
  for (const node of graph.nodes)
    if (![node.x0, node.x1, node.y0, node.y1].every(Number.isFinite)) throw new Error('This graph cannot be laid out. Try larger spacing or a smaller diagram.');
  return { ...graph, extent, colors, settings, engine, effectiveGap };
}
export function linkPath(link, curvature = 0.5) {
  const x0 = link.source.x1, x1 = link.target.x0;
  return 'M' + x0 + ',' + link.y0 + 'C' + (x0 + (x1 - x0) * curvature) + ',' + link.y0 + ' ' +
    (x1 - (x1 - x0) * curvature) + ',' + link.y1 + ' ' + x1 + ',' + link.y1;
}
export function positionNode(graph, id, y) {
  const node = graph.nodes.find((n) => n.id === id);
  if (!node) return null;
  const height = node.y1 - node.y0;
  const min = graph.extent[0][1], max = graph.extent[1][1] - height;
  node.y0 = Math.max(min, Math.min(max, y)); node.y1 = node.y0 + height;
  graph.engine.update(graph);
  return max > min ? (node.y0 - min) / (max - min) : 0;
}
