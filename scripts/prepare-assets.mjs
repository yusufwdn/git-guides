import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import './package-labs.mjs';

await mkdir(new URL('../public/assets/', import.meta.url), { recursive: true });
for (const name of ['styles.css', 'favicon.svg', 'downloads'])
  await cp(
    new URL('../assets/' + name, import.meta.url),
    new URL('../public/assets/' + name, import.meta.url),
    { recursive: true },
  );

await mkdir(new URL('../public/assets/fonts/', import.meta.url), { recursive: true });
for (const name of await readdir(new URL('../assets/fonts/', import.meta.url))) {
  if (name.endsWith('.woff2') || name === 'OFL.txt')
    await cp(
      new URL('../assets/fonts/' + name, import.meta.url),
      new URL('../public/assets/fonts/' + name, import.meta.url),
    );
  else if (name.endsWith('.ttf'))
    await rm(new URL('../public/assets/fonts/' + name, import.meta.url), { force: true });
}

await rm(new URL('../public/search-index.json', import.meta.url), { force: true });
