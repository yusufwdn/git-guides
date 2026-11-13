import type { APIRoute } from 'astro';
import Routes from '../lib/routes.js';
import { getSiteContent } from '../lib/site-content';

export const GET: APIRoute = async ({ site }) => {
  const routes = Routes.create(await getSiteContent());
  const urls = site
    ? routes
        .entries()
        .map((page) => `<url><loc>${new URL(page.path, site).href}</loc></url>`)
        .join('')
    : '';
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
