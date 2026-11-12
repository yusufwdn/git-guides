const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const Routes = require('../assets/routes.js');
const Pages = require('../assets/pages.js');
const Content = require('../assets/content.js');

let renderDocument;
let buildSite;
const servers = [];
let developmentURL;
let previewURL;

before(async () => {
  ({ renderDocument } = await import('../scripts/render-page.mjs'));
  ({ buildSite } = await import('../scripts/build.mjs'));
  await buildSite({ siteURL: '' });
  const { createServer } = await import('../scripts/serve.mjs');
  for (const built of [false, true]) {
    const server = createServer({ built, siteURL: '' });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    servers.push(server);
    const url = 'http://127.0.0.1:' + server.address().port;
    if (built) previewURL = url;
    else developmentURL = url;
  }
});

after(async () => {
  for (const server of servers)
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
});

test('route canonical, query, anchor, dan tautan hash lama dikenali secara konsisten', () => {
  for (const value of [
    '/belajar/stash',
    '/belajar/stash/',
    '/belajar/stash/index.html',
    '#/belajar/stash',
  ])
    assert.equal(Routes.resolve(value).path, '/belajar/stash/');
  assert.equal(Routes.resolve('/playground?scenario=conflict#main').search, '?scenario=conflict');
  assert.equal(Routes.resolve('/playground?scenario=conflict#main').hash, '#main');
  for (const value of [
    '/belajar/tidak-ada/',
    '/bab/999/',
    '/latihan/tidak-ada/',
    '/belajar/stash/tambahan/',
    '/%E0%A4%A',
    '//external.invalid/',
    'https://external.invalid/',
  ])
    assert.equal(Routes.resolve(value).status, 404);
});

test('semua 112 route mempunyai dokumen HTML dan link internal menuju route nyata', async () => {
  assert.equal(Routes.entries().length, 112);
  for (const page of Routes.entries()) {
    const rendered = renderDocument(page.path);
    assert.equal(rendered.status, 200);
    assert(rendered.html.includes('<title>'));
    assert.equal((rendered.html.match(/<h1\b/g) || []).length, 1, page.path);
    assert(!rendered.html.includes('href="#/'), page.path);
    const main = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(rendered.html)?.[1];
    assert(main && main.length > 300, page.path);
    for (const [, value] of rendered.html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      if (value.startsWith('/assets/')) continue;
      assert.equal(Routes.resolve(value).status, 200, `${page.path} → ${value}`);
    }
    const output = await fs.readFile(
      path.join(__dirname, '..', 'dist', page.path.slice(1), 'index.html'),
      'utf8',
    );
    assert(output.includes(`data-page-path="${page.path}"`));
    assert.equal((output.match(/<h1\b/g) || []).length, 1);
  }
});

test('materi dan petunjuk tersedia sebagai HTML tanpa mengeksekusi script', () => {
  for (const lesson of Content.lessons) {
    const { html } = renderDocument(`/belajar/${lesson.id}/`);
    const main = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(html)[1];
    for (const id of [
      'situasi',
      'persiapan',
      'visualisasi',
      'konsep',
      'langkah',
      'perhatian',
      'latihan',
      'sumber',
    ])
      assert.equal(
        (main.match(new RegExp(`id="${id}"`, 'g')) || []).length,
        1,
        `${lesson.id}: ${id}`,
      );
    assert(main.includes('class="preparation-panel"') || main.includes('preparation-panel'));
    assert(main.includes('class="terminal-lab-panel"'));
    assert(main.includes('id="quiz-form"'));
    assert(main.includes('data-prerender-disabled'));
    assert(main.includes('exercise-solution'));
    assert(main.includes('git '));
  }
});

test('metadata per halaman memakai judul/deskripsi materi dan canonical tanpa query', () => {
  const page = renderDocument('/belajar/stash/?from=search#konsep', {
    siteURL: 'https://example.test',
  });
  assert(page.html.includes('<title>Simpan sebentar. Lanjutkan nanti. — Git Guides</title>'));
  assert(page.html.includes('rel="canonical" href="https://example.test/belajar/stash/"'));
  assert(page.html.includes('property="og:type" content="article"'));
  assert(!page.html.includes('noindex'));
  const missing = renderDocument('/tidak-ada/');
  assert.equal(missing.status, 404);
  assert(missing.html.includes('content="noindex, follow"'));
  assert(!missing.html.includes('rel="canonical"'));
  assert.throws(() => renderDocument('/', { siteURL: 'https://user:secret@example.test/' }));
});

for (const mode of ['development', 'preview']) {
  test(`HTTP ${mode}: direct URL, refresh, redirect slash, aset, dan 404`, async () => {
    const base = mode === 'development' ? developmentURL : previewURL;
    for (const suffix of ['/belajar/stash/', '/latihan/remote/', '/bab/9/', '/referensi/']) {
      const response = await fetch(base + suffix);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert(html.includes('data-page-path="' + suffix + '"'));
      assert(html.includes('<h1'));
      assert.equal((await fetch(base + suffix)).status, 200);
    }
    const alias = await fetch(base + '/belajar/stash?from=copy', { redirect: 'manual' });
    assert.equal(alias.status, 308);
    assert.equal(alias.headers.get('location'), '/belajar/stash/?from=copy');
    const sourceAlias = await fetch(base + '/belajar/stash/index.html', { redirect: 'manual' });
    assert.equal(sourceAlias.headers.get('location'), '/belajar/stash/');
    const missing = await fetch(base + '/tidak/ada/');
    assert.equal(missing.status, 404);
    assert((await missing.text()).includes('Halaman tidak ditemukan'));
    for (const suffix of [
      '/package.json',
      '/.git/config',
      '/assets/%2e%2e%5cpackage.json',
      '/assets/%00',
      '/assets/tidak-ada.js',
    ])
      assert.equal((await fetch(base + suffix)).status, 404);
    assert.equal((await fetch(base + '/%E0%A4%A')).status, 400);
    assert.equal(
      (await fetch(base + '/assets/styles.css')).headers.get('content-type'),
      'text/css; charset=utf-8',
    );
    assert.equal(
      (await fetch(base + '/assets/downloads/kopi-kita-labs.zip')).headers.get('content-type'),
      'application/zip',
    );
    const head = await fetch(base + '/belajar/stash/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal((await fetch(base + '/belajar/stash/', { method: 'POST' })).status, 405);
  });
}

test('aset pada HTML nested tetap menuju file build yang benar', async () => {
  for (const url of ['/belajar/stash/', '/latihan/remote/', '/bab/1/']) {
    const file = path.join(__dirname, '..', 'dist', url.slice(1), 'index.html');
    const html = await fs.readFile(file, 'utf8');
    const assets = [...html.matchAll(/(?:src|href)="([^"]*assets\/[^"?]+)"/g)].map(
      (match) => match[1],
    );
    assert(assets.length > 8);
    for (const asset of assets)
      assert((await fs.stat(path.resolve(path.dirname(file), asset))).isFile(), `${url}: ${asset}`);
  }
});

test('render browser dan build memakai template dan data yang sama', () => {
  const page = Routes.resolve('/belajar/stash/');
  const server = Pages.render(page);
  const browser = Pages.lesson(
    Content.lessons.find((lesson) => lesson.id === 'stash'),
    {},
  );
  assert.equal(server.replace(/ disabled data-prerender-disabled/g, ''), browser);
});

test('SITE_URL menghasilkan sitemap dan build berikutnya membersihkan artefak domain lama', async () => {
  try {
    await buildSite({ siteURL: 'https://example.test' });
    const sitemap = await fs.readFile(path.join(__dirname, '..', 'dist', 'sitemap.xml'), 'utf8');
    assert.equal((sitemap.match(/<loc>/g) || []).length, Routes.entries().length);
    assert(sitemap.includes('<loc>https://example.test/belajar/stash/</loc>'));
    const html = await fs.readFile(
      path.join(__dirname, '..', 'dist', 'belajar', 'stash', 'index.html'),
      'utf8',
    );
    assert(html.includes('rel="canonical" href="https://example.test/belajar/stash/"'));
    assert(
      (await fs.readFile(path.join(__dirname, '..', 'dist', 'robots.txt'), 'utf8')).includes(
        'Sitemap: https://example.test/sitemap.xml',
      ),
    );
    await fs.writeFile(path.join(__dirname, '..', 'dist', 'halaman-lama.html'), 'old build');
  } finally {
    await buildSite({ siteURL: '' });
  }
  for (const name of ['sitemap.xml', 'robots.txt', 'halaman-lama.html']) {
    await assert.rejects(fs.stat(path.join(__dirname, '..', 'dist', name)), { code: 'ENOENT' });
  }
});
