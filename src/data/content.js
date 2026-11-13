import fs from 'node:fs';
import path from 'node:path';
const directory = path.resolve('src/content/lessons');
const lessons = fs
  .readdirSync(directory)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')))
  .sort((a, b) => a.order - b.order);
const catalog = JSON.parse(fs.readFileSync(path.resolve('src/data/catalog.json'), 'utf8'));
const labs = JSON.parse(fs.readFileSync(path.resolve('src/data/labs.json'), 'utf8'));
export default { ...catalog, lessons, labs };
