import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4321);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.zip': 'application/zip',
};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '');
    const relative = path.relative(root, file);
    if (
      relative.startsWith('..') ||
      path.isAbsolute(relative) ||
      relative.split(path.sep).some((part) => part.startsWith('.')) ||
      !['index.html', 'assets'].includes(relative.split(path.sep)[0])
    ) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Git Guides siap: http://localhost:${port}`));
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
