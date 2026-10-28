import {
  root,
  el,
  button,
  field,
  select,
  panel,
  row,
  form,
  download,
  hint,
  report,
} from '../../../shared/js/shell.js';
import qrcode from './vendor/qrcode.mjs';
qrcode.stringToBytes = (text) => Array.from(new TextEncoder().encode(text));
const text = el('textarea', {
  id: 'qr-text',
  name: 'text',
  maxlength: 1200,
  required: true,
  placeholder: 'https://nad-web.github.io/001_Public/Vibcoding/',
});
const preview = el(
  'div',
  { class: 'qr-preview', id: 'qr-preview' },
  hint('Your QR code will appear here.'),
);
const level = select(
  'level',
  [
    ['L', 'Low · 7%'],
    ['M', 'Medium · 15%'],
    ['Q', 'Quartile · 25%'],
    ['H', 'High · 30%'],
  ],
  'M',
);
let code = null,
  svg = null;
const ns = 'http://www.w3.org/2000/svg';
function generate(data) {
  const value = data.get('text').trim();
  if (!value) throw new Error('Enter text or a web address.');
  if (new TextEncoder().encode(value).length > 1200)
    throw new Error(
      'Use at most 1,200 UTF-8 bytes. Long non-Latin text can use several bytes per character.',
    );
  const next = qrcode(0, data.get('level'));
  next.addData(value, 'Byte');
  try {
    next.make();
  } catch {
    throw new Error(
      'This content is too long at that correction level. Use less text.',
    );
  }
  code = next;
  const size = code.getModuleCount();
  svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('xmlns', ns);
  svg.setAttribute('viewBox', `0 0 ${size + 8} ${size + 8}`);
  svg.setAttribute('width', '512');
  svg.setAttribute('height', '512');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Generated QR code');
  svg.setAttribute('shape-rendering', 'crispEdges');
  const background = document.createElementNS(ns, 'rect');
  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', '#fff');
  svg.append(background);
  const path = document.createElementNS(ns, 'path');
  let d = '';
  for (let row = 0; row < size; row++)
    for (let col = 0; col < size; col++)
      if (code.isDark(row, col)) d += `M${col + 4},${row + 4}h1v1h-1z `;
  path.setAttribute('d', d);
  path.setAttribute('fill', '#000');
  svg.append(path);
  preview.replaceChildren(svg);
  report(
    'QR code generated on this device. Test it with your camera before sharing.',
  );
}
async function png() {
  if (!code) throw new Error('Generate a QR code first.');
  const modules = code.getModuleCount() + 8,
    scale = Math.max(4, Math.floor(1024 / modules)),
    size = modules * scale;
  const canvas = el('canvas', { width: size, height: size });
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  for (let row = 0; row < modules - 8; row++)
    for (let col = 0; col < modules - 8; col++)
      if (code.isDark(row, col))
        ctx.fillRect((col + 4) * scale, (row + 4) * scale, scale, scale);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  if (!blob) throw new Error('PNG export failed. Try SVG export.');
  download('noorullah-qr.png', blob, 'image/png');
}
root.replaceChildren(
  el(
    'div',
    { class: 'grid' },
    panel(
      'A link, a note, a little shortcut',
      form(
        [field('Text or web address', text), field('Error correction', level)],
        generate,
        'Generate QR code',
      ),
      hint(
        'Local encoding. No account, tracking link, or remote QR service. Keep the white quiet zone around the code when printing.',
      ),
    ),
    panel(
      'Ready to scan',
      preview,
      row(
        button('Download PNG', png),
        button('Download SVG', () => {
          if (!svg) throw new Error('Generate a QR code first.');
          download(
            'noorullah-qr.svg',
            new XMLSerializer().serializeToString(svg),
            'image/svg+xml',
          );
        }),
      ),
      hint(
        'The preview and exported files contain the last generated content. Regenerate after editing. Encoder: qrcode-generator 2.0.4 by Kazuhiko Arase, MIT license.',
      ),
    ),
  ),
);
