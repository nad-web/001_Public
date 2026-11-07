import { exportSize, THEMES } from './model.js';
import { renderSVG } from './render.js';
export function filename(title, extension) {
  const stem = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 75);
  return (stem || 'sankey-diagram') + '.' + extension;
}
export function svgBlob(graph, transparent = false) {
  const svg = renderSVG(graph, { interactive: false, transparent });
  return new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
}
export async function imageBlob(graph, type, scale = 2, transparent = false) {
  const size = exportSize(graph.settings.width, graph.settings.height, scale);
  if (document.fonts?.ready) await document.fonts.ready;
  const url = URL.createObjectURL(svgBlob(graph, transparent && type !== 'image/jpeg'));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('The diagram could not be rendered. Try exporting SVG.')); image.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = size.width; canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image export is unavailable in this browser. Export SVG instead.');
    if (type === 'image/jpeg') {
      context.fillStyle = graph.settings.background || THEMES[graph.settings.theme].background;
      context.fillRect(0, 0, size.width, size.height);
    }
    context.drawImage(image, 0, 0, size.width, size.height);
    const result = await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image export failed. Try a smaller size or export SVG.')), type, 0.95));
    // Some browsers silently fall back to PNG. Never return a mislabeled file.
    if (result.type !== type) throw new Error('Your browser cannot create this format. Choose PNG, JPEG or SVG instead.');
    return result;
  } finally { URL.revokeObjectURL(url); }
}
export function downloadBlob(blob, name, retain = false) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = name; link.rel = 'noopener';
  document.body.append(link); link.click(); link.remove();
  if (!retain) setTimeout(() => URL.revokeObjectURL(url), 120000);
  return url;
}
export async function shareBlob(blob, name) {
  const file = new File([blob], name, { type: blob.type });
  if (!navigator.canShare?.({ files: [file] }) || !navigator.share) throw new Error('File sharing is unavailable here. Use Download, then save or share the file.');
  await navigator.share({ files: [file], title: name });
}
