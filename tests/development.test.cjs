const { test } = require('node:test');
const assert = require('node:assert/strict');

test('Astro development melayani renderer ESM dan indeks content collection', async (t) => {
  const { dev } = await import('astro');
  const server = await dev({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
  t.after(() => server.stop());
  const origin = 'http://127.0.0.1:' + server.address.port;
  for (const route of ['/persiapan/', '/belajar/snapshot/', '/belajar/stash/', '/roadmap/']) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    assert((await response.text()).includes('<h1'), route);
  }
  const indexResponse = await fetch(origin + '/search-index.json');
  assert.equal(indexResponse.status, 200);
  const index = await indexResponse.json();
  assert(index.some((entry) => entry.id === 'bisect-run' && entry.text.includes('125')));
});
