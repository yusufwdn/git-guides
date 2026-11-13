import type { APIRoute } from 'astro';
import { getSiteContent } from '../lib/site-content';
import { buildSearchIndex } from '../lib/search-index.js';

export const GET: APIRoute = async () => Response.json(buildSearchIndex(await getSiteContent()));
