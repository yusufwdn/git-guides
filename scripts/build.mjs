import { cp, mkdir } from 'node:fs/promises';
import './package-labs.mjs';
const destination = new URL('../dist/', import.meta.url);
await mkdir(destination, { recursive: true });
await cp(new URL('../index.html', import.meta.url), new URL('index.html', destination));
await cp(new URL('../assets/', import.meta.url), new URL('assets/', destination), {
  recursive: true,
});
console.log('Build selesai: dist/ — static HTML, CSS, dan JavaScript.');
