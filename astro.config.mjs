import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL;
if (site) {
  const url = new URL(site);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error('SITE_URL harus berupa origin HTTP(S) tanpa path atau kredensial.');
}

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  // Situs tetap MPA: setiap pindah halaman memuat dokumen baru. Prefetch mengunduh halaman
  // tujuan saat link di-hover atau difokus, sehingga halaman muncul hampir instan saat diklik.
  // Link yang bukan halaman (unduhan ZIP) diberi data-astro-prefetch="false".
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
});
