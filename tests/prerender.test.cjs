const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Routes = require('../assets/routes.js');
const Content = require('../assets/content.js');

before(() => {
  execFileSync(process.execPath, ['scripts/prepare-assets.mjs'], { stdio: 'pipe' });
  const astroCLI = path.join(
    path.dirname(require.resolve('astro/package.json')),
    require('astro/package.json').bin.astro,
  );
  execFileSync(process.execPath, [astroCLI, 'build'], {
    stdio: 'pipe',
    env: { ...process.env, SITE_URL: 'https://example.test', ASTRO_TELEMETRY_DISABLED: '1' },
  });
});
const htmlFor = (route) =>
  fs.readFileSync(path.join(__dirname, '..', 'dist', route.slice(1), 'index.html'), 'utf8');

test('semua route dibangun Astro dengan konten, satu h1, ID unik, dan link internal valid', () => {
  assert.equal(Routes.entries().length, 113);
  for (const route of Routes.entries()) {
    const html = htmlFor(route.path);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route.path);
    assert(html.includes('data-page-path="' + route.path + '"'), route.path);
    const ids = [
      ...html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').matchAll(/\bid="([^"]+)"/g),
    ].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'Duplicate ID: ' + route.path);
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      if (href.startsWith('/assets/') || href.startsWith('/_astro/')) continue;
      assert.equal(Routes.resolve(href).status, 200, route.path + ' -> ' + href);
    }
  }
});

test('metadata produksi, sitemap, halaman 404, dan aset build benar', () => {
  const html = htmlFor('/belajar/stash/');
  assert(html.includes('rel="canonical" href="https://example.test/belajar/stash/"'));
  assert(html.includes('property="og:type" content="article"'));
  assert.equal(
    (fs.readFileSync('dist/sitemap.xml', 'utf8').match(/<loc>/g) || []).length,
    Routes.entries().length,
  );
  assert(
    fs
      .readFileSync('dist/robots.txt', 'utf8')
      .includes('Sitemap: https://example.test/sitemap.xml'),
  );
  const missing = fs.readFileSync('dist/404.html', 'utf8');
  assert(missing.includes('noindex, follow'));
  assert(!missing.includes('rel="canonical"'));
  for (const route of Routes.entries())
    for (const [, asset] of htmlFor(route.path).matchAll(
      /(?:src|href)="(\/(?:assets|_astro)\/[^"?]+)"/g,
    ))
      assert(fs.statSync(path.join('dist', asset.slice(1))).isFile(), asset);
});

test('seluruh materi, latihan, dan evaluasi tersedia pada HTML tanpa JS', () => {
  for (const lesson of Content.lessons) {
    const html = htmlFor('/belajar/' + lesson.id + '/');
    for (const id of [
      'situasi',
      'persiapan',
      'visualisasi',
      'konsep',
      'langkah',
      'perhatian',
      'latihan',
      'sumber',
      'quiz-form',
    ])
      assert(html.includes('id="' + id + '"'), lesson.id + ': ' + id);
    assert(html.includes('data-lab="' + lesson.lab + '"'));
    assert(html.includes('data-prerender-disabled'));
    if (lesson.checkpoint) assert(html.includes('id="checkpoint-form"'));
  }
  const setup = htmlFor('/persiapan/');
  for (const text of [
    'Windows',
    'macOS',
    'Linux',
    'git init -b main',
    'git commit',
    'working tree clean',
  ])
    assert(setup.includes(text));
});

test('browser menerima modul kecil dan data halaman saat ini, simulator dipisahkan', () => {
  const html = htmlFor('/belajar/snapshot/');
  assert(!/src="[^"]*(?:curriculum|content|pages|simulator)\.js/.test(html));
  const payload = JSON.parse(html.match(/<script id="page-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(payload.lesson.id, 'snapshot');
  assert(!JSON.stringify(payload.lessons).includes('initialState'));
  assert(Object.values(payload.lessons).every((lesson) => !lesson.concept));
  const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(scripts.length, 1);
  assert(fs.statSync(path.join('dist', scripts[0].slice(1))).size < 25000);
  const chunks = fs.readdirSync('dist/_astro');
  assert(chunks.some((name) => name.startsWith('playground.')));
});

test('indeks pencarian mencakup isi mendalam, istilah, dan masalah', () => {
  const index = JSON.parse(fs.readFileSync('dist/search-index.json', 'utf8'));
  assert(index.some((entry) => entry.id === 'bisect-run' && entry.text.includes('125')));
  assert(index.some((entry) => entry.kind === 'Istilah' && entry.title === 'HEAD'));
  assert(index.some((entry) => entry.kind === 'Masalah'));
  for (const entry of index) assert.equal(Routes.resolve(entry.url).status, 200, entry.url);
});
