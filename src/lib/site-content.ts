import { getCollection } from 'astro:content';
import catalog from '../data/catalog.json';
import labs from '../data/labs.json';

export async function getSiteContent() {
  const entries = await getCollection('lessons');
  for (const entry of entries) {
    if (entry.id !== entry.data.id)
      throw new Error('ID materi harus sama dengan nama file: ' + entry.id);
  }
  return {
    ...catalog,
    labs,
    lessons: entries.map((entry) => entry.data).sort((a, b) => a.order - b.order),
  };
}
