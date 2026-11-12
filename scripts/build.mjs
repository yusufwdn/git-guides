import { cp, mkdir, writeFile, rm, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { renderDocument, routes, siteOrigin } from './render-page.mjs';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const destination = path.resolve(workspace, 'dist');

export async function buildSite({ siteURL = process.env.SITE_URL || '' } = {}) {
  const origin = siteOrigin(siteURL);
  // Only this project's generated dist directory may be replaced.
  if (
    path.relative(workspace, destination) !== 'dist' ||
    path.dirname(destination) !== path.resolve(workspace)
  )
    throw new Error('Output build berada di luar folder dist proyek.');
  const existing = await lstat(destination).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (existing?.isSymbolicLink())
    throw new Error('Folder dist tidak boleh berupa symlink atau junction.');
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await import(`./package-labs.mjs?build=${Date.now()}`);
  await cp(new URL('../assets/', import.meta.url), path.join(destination, 'assets'), {
    recursive: true,
  });

  for (const page of routes) {
    const rendered = renderDocument(page.path, { siteURL: origin || '', relativeAssets: true });
    const directory = path.join(destination, page.path.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.html'), rendered.html);
  }
  await writeFile(
    path.join(destination, '404.html'),
    renderDocument('/404/', { siteURL: origin || '' }).html,
  );
  if (origin) {
    const urls = routes
      .map(
        (page) =>
          `  <url><loc>${new URL(page.path, origin).href.replace(/&/g, '&amp;')}</loc></url>`,
      )
      .join('\n');
    await writeFile(
      path.join(destination, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    );
    await writeFile(
      path.join(destination, 'robots.txt'),
      `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
    );
  }
  console.log(
    `Build selesai: ${routes.length} halaman HTML, 404, dan aset di dist/.${origin ? ' Sitemap dan canonical memakai ' + origin + '.' : ' Atur SITE_URL saat domain publik sudah tersedia.'}`,
  );
  return { directory: destination, pages: routes.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await buildSite();
