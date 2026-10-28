import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, isMain } from './lib.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8',
};

export function createStaticServer({ root = ROOT, basePath = '/' } = {}) {
  const resolvedRoot = path.resolve(root);
  if (
    !basePath.startsWith('/') ||
    !basePath.endsWith('/') ||
    basePath.includes('..')
  )
    throw new Error(
      'Base path must start and end with / and contain no .. segments.',
    );
  return http.createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      );
      if (pathname === basePath.slice(0, -1)) {
        response.writeHead(301, { Location: basePath }).end();
        return;
      }
      if (!pathname.startsWith(basePath)) {
        response.writeHead(404).end('Not found');
        return;
      }
      const relative = pathname.slice(basePath.length);
      if (relative.split('/').some((part) => part.startsWith('.'))) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      let file = path.resolve(resolvedRoot, relative);
      if (file !== resolvedRoot && !file.startsWith(resolvedRoot + path.sep)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      let stat = await fs.stat(file);
      if (stat.isDirectory()) {
        if (!pathname.endsWith('/')) {
          response
            .writeHead(301, {
              Location:
                pathname +
                '/' +
                new URL(request.url, 'http://localhost').search,
            })
            .end();
          return;
        }
        file = path.join(file, 'index.html');
      }
      const real = await fs.realpath(file);
      const realRoot = await fs.realpath(resolvedRoot);
      if (real !== realRoot && !real.startsWith(realRoot + path.sep)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      const bytes = await fs.readFile(file);
      response.writeHead(200, {
        'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
        'Content-Length': bytes.length,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      response
        .writeHead(error instanceof URIError ? 400 : 404)
        .end('Not found');
    }
  });
}

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2);
  const directory = args[0] && !args[0].startsWith('--') ? args.shift() : '.';
  let basePath = '/';
  let port = Number(process.env.PORT || 4173);
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '--base') basePath = args[i + 1];
    else if (args[i] === '--port') port = Number(args[i + 1]);
    else throw new Error(`Unknown option: ${args[i]}`);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid port.');
  const server = createStaticServer({
    root: path.resolve(ROOT, directory),
    basePath,
  });
  server.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () =>
    console.log(
      `Local preview: http://127.0.0.1:${port}${basePath}\nPress Ctrl+C to stop. Use npm run build before previewing dist/.`,
    ),
  );
}
