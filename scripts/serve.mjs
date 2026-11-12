import http from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { renderDocument, resolveRoute } from './render-page.mjs';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.zip': 'application/zip',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

export function createServer({ built = false, siteURL = process.env.SITE_URL || '' } = {}) {
  const root = built ? path.join(workspace, 'dist') : workspace;
  return http.createServer(async (request, response) => {
    const head = request.method === 'HEAD';
    function send(status, content, type = 'text/html; charset=utf-8') {
      response.writeHead(status, {
        'Content-Type': type,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(head ? undefined : content);
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }
    try {
      const url = new URL(request.url, 'http://localhost');
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        send(400, 'Bad request', 'text/plain; charset=utf-8');
        return;
      }
      if (
        pathname.includes(path.win32.sep) ||
        pathname.includes(String.fromCharCode(0)) ||
        pathname.split('/').some((part) => part.startsWith('.'))
      ) {
        send(404, 'Not found', 'text/plain; charset=utf-8');
        return;
      }
      if (
        pathname.startsWith('/assets/') ||
        (built && ['/sitemap.xml', '/robots.txt'].includes(pathname))
      ) {
        const target = path.resolve(root, '.' + pathname);
        const allowedRoot = pathname.startsWith('/assets/') ? path.join(root, 'assets') : root;
        const resolved = await realpath(target);
        const relative = path.relative(await realpath(allowedRoot), resolved);
        if (
          relative.startsWith('..') ||
          path.isAbsolute(relative) ||
          !(await stat(resolved)).isFile()
        )
          throw new Error('Not a file');
        send(
          200,
          await readFile(resolved),
          types[path.extname(resolved)] || 'application/octet-stream',
        );
        return;
      }
      const page = resolveRoute(url.pathname + url.search);
      if (page.status === 200 && url.pathname !== page.path) {
        response.writeHead(308, { Location: page.path + url.search });
        response.end();
        return;
      }
      if (!built) {
        const rendered = renderDocument(url.pathname + url.search, { siteURL });
        send(rendered.status, rendered.html);
        return;
      }
      const target =
        page.status === 200
          ? path.join(root, page.path.slice(1), 'index.html')
          : path.join(root, '404.html');
      try {
        send(page.status, await readFile(target));
      } catch {
        send(404, await readFile(path.join(root, '404.html')));
      }
    } catch {
      if (response.headersSent) {
        response.end();
        return;
      }
      send(404, 'Not found', 'text/plain; charset=utf-8');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4321);
  const built = process.argv.includes('--dist');
  const server = createServer({ built });
  server.listen(port, '127.0.0.1', () =>
    console.log(
      'Git Guides ' + (built ? 'preview build' : 'dev') + ' siap: http://localhost:' + port,
    ),
  );
  server.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
