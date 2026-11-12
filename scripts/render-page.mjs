import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Pages = require('../assets/pages.js');
const Routes = require('../assets/routes.js');
const data = require('../assets/content.js');

export const routes = Routes.entries();
export const resolveRoute = Routes.resolve;
const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function escape(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
}

export function siteOrigin(value = '') {
  if (!value) return null;
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error(
      'SITE_URL harus berupa origin HTTP(S), misalnya https://domain-kamu.com, tanpa path atau kredensial.',
    );
  return url.origin;
}

export function renderDocument(input = '/', { siteURL = '', relativeAssets = false } = {}) {
  const page = Routes.resolve(input);
  const origin = siteOrigin(siteURL);
  const lesson =
    page.kind === 'lesson' ? data.lessons.find((lesson) => lesson.id === page.id) : null;
  const noScript = /* HTML */ `<noscript
    ><div class="javascript-note">
      <p>
        Materi dan latihan terminal tetap bisa dibaca. Aktifkan JavaScript untuk simulator,
        pencarian, dan progres belajar.
      </p>
      <nav aria-label="Navigasi tanpa JavaScript">
        <a href="/roadmap/">Peta belajar</a><a href="/referensi/">Referensi</a
        ><a href="/latihan/">Latihan terminal</a>
      </nav>
    </div></noscript
  >`;
  const content = noScript + Pages.render(page);
  let document = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,
      (_, start, end) => start + escape(page.description) + end,
    )
    .replace(
      /<main\b[^>]*id="main"[^>]*><\/main>/,
      `<main id="main" tabindex="-1" data-page-path="${escape(page.path)}">${content}</main>`,
    )
    .replace(
      '<div id="chapter-nav"></div>',
      `<div id="chapter-nav">${Pages.sidebar(lesson)}</div>`,
    );
  const canonical =
    page.status === 200 ? (origin ? new URL(page.path, origin).href : page.path) : null;
  const metadata = [
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:type" content="${page.kind === 'lesson' ? 'article' : 'website'}" />`,
    ...(canonical
      ? [
          `<link rel="canonical" href="${escape(canonical)}" />`,
          `<meta property="og:url" content="${escape(canonical)}" />`,
        ]
      : ['<meta name="robots" content="noindex, follow" />']),
    ...(origin ? [`<meta name="gitguides-site-url" content="${escape(origin)}" />`] : []),
  ];
  document = document.replace('</head>', metadata.join('\n    ') + '\n  </head>');
  document = Pages.staticMarkup(document);
  const depth = page.path.split('/').filter(Boolean).length;
  const assetPrefix =
    relativeAssets && page.status === 200 ? '../'.repeat(depth) + 'assets/' : '/assets/';
  document = document.replace(
    /\b(src|href)="(?:\.\/|\/)assets\//g,
    (_, attribute) => `${attribute}="${assetPrefix}`,
  );
  return { ...page, html: document };
}
