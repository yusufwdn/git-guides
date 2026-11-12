import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'artifacts');
await mkdir(directory, { recursive: true });
const executable = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find(existsSync);
if (!executable) throw new Error('Chrome/Edge tidak tersedia untuk pemeriksaan browser lokal.');
const browser = spawn(
  executable,
  [
    '--headless=new',
    '--disable-gpu',
    '--in-process-gpu',
    '--no-sandbox',
    '--disable-gpu-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--disable-breakpad',
    '--disable-crash-reporter',
    `--user-data-dir=${path.join(root, '.preview-browser')}`,
    '--remote-debugging-address=127.0.0.1',
    '--remote-debugging-port=9224',
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
);
let websocket;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  let page;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const pages = await fetch('http://127.0.0.1:9224/json/list').then((response) =>
        response.json(),
      );
      page = pages.find((item) => item.type === 'page');
      if (page) break;
    } catch {}
    await delay(250);
  }
  if (!page) throw new Error('Browser debugging tidak dapat dijangkau.');
  websocket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    websocket.onopen = resolve;
    websocket.onerror = reject;
  });
  let serial = 0;
  const pending = new Map(),
    errors = [];
  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown')
      errors.push(
        message.params.exceptionDetails.text +
          ': ' +
          (message.params.exceptionDetails.exception?.description || ''),
      );
  };

  function cdp(method, params = {}) {
    const id = ++serial;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 15000);
      pending.set(id, { resolve, reject, timer });
      websocket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await cdp('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails)
      throw new Error(
        result.exceptionDetails.exception?.description || result.exceptionDetails.text,
      );
    return result.result.value;
  }

  async function until(expression) {
    for (let i = 0; i < 50; i++) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    throw new Error(`Kondisi browser tidak tercapai: ${expression}`);
  }

  async function navigate(route) {
    await cdp('Page.navigate', { url: `http://localhost:4321/${route}` });
    await until("document.readyState === 'complete' && !!document.querySelector('#main h1')");
  }

  async function screenshot(name) {
    await evaluate('document.fonts.ready.then(() => true)');
    const result = await cdp('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    await writeFile(path.join(directory, name), Buffer.from(result.data, 'base64'));
  }

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Network.enable');
  await cdp('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  // Remote font loading must not be required for the offline preview to work.
  await cdp('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'] });
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1260,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await navigate('#/belajar/stash');
  await evaluate('localStorage.clear()');
  await cdp('Page.reload');
  await until("!!document.querySelector('#quiz-form')");
  await evaluate('document.fonts.ready.then(() => true)');
  assert.equal(await evaluate('getComputedStyle(document.body).fontSize'), '15px');
  assert.match(await evaluate('getComputedStyle(document.body).fontFamily'), /Poppins/);
  assert.equal(
    await evaluate(
      "[...document.fonts].find(font=>font.family==='Poppins' && font.weight==='400')?.status",
    ),
    'loaded',
    'Poppins lokal harus berhasil dimuat tanpa Google Fonts.',
  );
  assert.match(
    await evaluate("getComputedStyle(document.querySelector('.terminal-command')).fontFamily"),
    /IBM Plex Mono/,
  );
  assert.equal(
    await evaluate("getComputedStyle(document.querySelector('.lesson-section>p')).fontSize"),
    '15px',
  );
  assert.equal(
    await evaluate(
      "getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()",
    ),
    '#ff6200',
  );
  assert.match(await evaluate("document.querySelector('h1').innerText"), /Simpan sebentar/);
  await screenshot('preview-desktop.png');
  await evaluate("document.querySelector('[data-sim-next]').click()");
  assert.match(await evaluate("document.querySelector('#stash-scene').innerText"), /WIP diskon/);
  await evaluate("document.querySelector('[data-sim-next]').click()");
  assert.match(
    await evaluate("document.querySelector('.sim-caption').innerText"),
    /entri stash dihapus/,
  );
  await evaluate("document.querySelector('[data-sim-mode]').click()");
  assert.match(
    await evaluate("document.querySelector('.sim-caption').innerText"),
    /entri stash tetap ada/,
  );
  await evaluate(
    "document.querySelector('input[name=answer][value=\"1\"]').checked=true; document.querySelector('#quiz-form').requestSubmit()",
  );
  assert.match(await evaluate("document.querySelector('#quiz-feedback').innerText"), /Tepat/);
  await evaluate("document.querySelector('#complete-lesson').click()");
  assert.match(await evaluate("document.querySelector('#progress-detail').innerText"), /1 dari/);
  await evaluate(
    "document.querySelector('#bookmark').click(); document.querySelector('#theme-toggle').click()",
  );
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
  assert.equal(
    await evaluate('getComputedStyle(document.documentElement).backgroundColor'),
    'rgb(0, 0, 0)',
  );
  assert.equal(
    await evaluate("getComputedStyle(document.querySelector('.sidebar')).backgroundColor"),
    'rgb(0, 0, 0)',
  );
  assert.equal(
    await evaluate(
      "getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()",
    ),
    '#ff6a00',
  );
  for (const selector of ['.visual-card', '.scenario', '.sim-zone'])
    assert.equal(
      await evaluate(
        `(() => {const channels=getComputedStyle(document.querySelector(${JSON.stringify(selector)})).backgroundColor.match(/\\d+/g).slice(0,3);return channels.every(channel=>channel===channels[0]);})()`,
      ),
      true,
      `${selector} harus memakai abu netral saat dark mode.`,
    );
  await evaluate("document.querySelector('#toast').classList.remove('visible')");
  await screenshot('preview-dark.png');
  await cdp('Page.reload');
  await until("!!document.querySelector('#complete-lesson')");
  assert.equal(
    await evaluate("document.querySelector('#complete-lesson').getAttribute('aria-pressed')"),
    'true',
  );
  assert.equal(
    await evaluate("document.querySelector('#bookmark').getAttribute('aria-pressed')"),
    'true',
  );
  await evaluate(
    "document.querySelector('#open-search').click(); document.querySelector('#search-input').value='bisect'; document.querySelector('#search-input').dispatchEvent(new Event('input'))",
  );
  assert.match(
    await evaluate("document.querySelector('#search-results').innerText"),
    /membelah riwayat/,
  );
  await evaluate("document.querySelector('#search-results a').click()");
  await until("location.hash.includes('bisect') && !!document.querySelector('#quiz-form')");
  await navigate('#/playground?scenario=stash');
  for (const command of ['git stash push -u -m "Latihan"', 'git stash pop'])
    await evaluate(
      `document.querySelector('#terminal-input').value=${JSON.stringify(command)}; document.querySelector('#terminal-form').requestSubmit()`,
    );
  await evaluate("document.querySelector('#check-practice').click()");
  assert.match(await evaluate("document.querySelector('#practice-result').innerText"), /Tepat/);
  await navigate('#/playground?scenario=conflict');
  await evaluate(
    "document.querySelector('#terminal-input').value='git stash pop'; document.querySelector('#terminal-form').requestSubmit()",
  );
  await evaluate("document.querySelector('#resolve-sandbox').click()");
  for (const command of ['git add diskon.js', 'git commit -m "Selesai"'])
    await evaluate(
      `document.querySelector('#terminal-input').value=${JSON.stringify(command)}; document.querySelector('#terminal-form').requestSubmit()`,
    );
  await evaluate("document.querySelector('#check-practice').click()");
  assert.match(await evaluate("document.querySelector('#practice-result').innerText"), /Tepat/);
  await navigate('#/playground?scenario=staging');
  for (const command of ['git add menu.json', 'git commit -m "Menu"'])
    await evaluate(
      `document.querySelector('#terminal-input').value=${JSON.stringify(command)}; document.querySelector('#terminal-form').requestSubmit()`,
    );
  await evaluate("document.querySelector('#check-practice').click()");
  assert.match(await evaluate("document.querySelector('#practice-result').innerText"), /Tepat/);
  await navigate('#/referensi');
  await evaluate(
    "document.querySelector('#reference-filter').value='stash'; document.querySelector('#reference-filter').dispatchEvent(new Event('input'))",
  );
  assert(
    (await evaluate("document.querySelectorAll('#reference-results .reference-card').length")) >= 3,
  );
  await navigate('#/roadmap');
  assert.equal(await evaluate("document.querySelectorAll('.chapter-card').length"), 16);
  // Smoke-test all authored routes instead of relying on one representative page.
  const ids = await evaluate('GitGuidesContent.lessons.map(lesson=>lesson.id)');
  for (const id of ids) {
    await evaluate(`location.hash='#/belajar/${id}'`);
    await until(
      `document.querySelector('#main h1') && document.title.includes(${JSON.stringify(await titleFor(id))})`,
    );
    assert(
      await evaluate(
        "!!document.querySelector('#quiz-form') && !!document.querySelector('.preparation-panel') && !!document.querySelector('[data-lab]') && !!document.querySelector('.verification-panel')",
      ),
      `${id}: metadata belajar harus tampil.`,
    );
  }

  async function titleFor(id) {
    return await evaluate(
      `GitGuidesContent.lessons.find(lesson=>lesson.id===${JSON.stringify(id)}).title`,
    );
  }

  const lessonCount = ids.length;
  assert(lessonCount >= 60 && lessonCount <= 80);
  for (const [lesson, flow] of [
    ['branch', 'branch'],
    ['fast-forward', 'merge-ff'],
    ['merge', 'merge'],
    ['fetch-pull', 'remote'],
    ['rebase-dasar', 'rebase'],
    ['reset-modes', 'reset'],
    ['reflog-rescue', 'recovery'],
  ]) {
    await navigate(`#/belajar/${lesson}`);
    assert.equal(await evaluate("document.querySelector('.flow-card').dataset.flow"), flow);
    const steps = await evaluate(
      `GitGuidesVisuals.scenarios[${JSON.stringify(flow)}].frames.length`,
    );
    for (let step = 1; step < steps; step++)
      await evaluate(`document.querySelector('[data-flow-step="${step}"]').click()`);
    const text = await evaluate("document.querySelector('.flow-card .sim-caption').innerText");
    assert(text.length > 45);
  }
  await navigate('#/belajar/konflik');
  await evaluate("document.querySelector('[data-resolve-value]').click()");
  assert.equal(
    await evaluate("document.querySelector('#conflict-preview').innerText.includes('<<<<<<<')"),
    false,
  );
  await navigate('#/latihan');
  const labIds = await evaluate('Object.keys(GitGuidesContent.labs)');
  assert.equal(labIds.length, 23);
  const download = await fetch('http://localhost:4321/assets/downloads/kopi-kita-labs.zip');
  assert.equal(download.status, 200);
  assert.equal(download.headers.get('content-type'), 'application/zip');
  assert.equal(Buffer.from(await download.arrayBuffer()).readUInt32LE(0), 0x04034b50);
  for (const id of labIds) {
    await navigate(`#/latihan/${id}`);
    assert.equal(await evaluate("document.querySelector('.exercise-solution').open"), false);
    await evaluate("document.querySelector('.exercise-solution').open=true");
    assert(await evaluate("document.querySelector('.exercise-solution pre').innerText.length>20"));
  }
  await navigate('#/belajar/rebase-dasar');
  await evaluate("document.querySelector('#visualisasi').scrollIntoView()");
  await screenshot('preview-rebase.png');
  await navigate('#/latihan/remote');
  await screenshot('preview-labs.png');
  await navigate('#/belajar/maintenance');
  await evaluate('localStorage.clear()');
  await cdp('Page.reload');
  await until("!!document.querySelector('#quiz-form')");
  await navigate('#/');
  await screenshot('preview-home.png');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await navigate('#/belajar/stash');
  assert.equal(
    await evaluate('document.documentElement.scrollWidth > innerWidth'),
    false,
    'Halaman meluber pada layar mobile.',
  );
  assert.equal(
    await evaluate("getComputedStyle(document.querySelector('.scenario p')).fontSize"),
    '15px',
  );
  await screenshot('preview-mobile.png');
  await evaluate("document.querySelector('#visualisasi').scrollIntoView()");
  await screenshot('preview-mobile-demo.png');
  await evaluate("document.querySelector('#menu-toggle').click()");
  assert.equal(
    await evaluate("document.querySelector('#menu-toggle').getAttribute('aria-expanded')"),
    'true',
  );
  await evaluate("document.querySelector('#sidebar a').click()");
  await until("location.hash.includes('kenalan-git')");
  assert.equal(
    await evaluate("document.querySelector('#menu-toggle').getAttribute('aria-expanded')"),
    'false',
  );
  for (const width of [320, 768, 1024]) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 760,
    });
    for (const route of [
      '#/',
      '#/belajar/stash',
      '#/belajar/staging',
      '#/belajar/rebase-dasar',
      '#/belajar/fetch-pull',
      '#/belajar/reset-modes',
      '#/belajar/konflik',
      '#/playground',
      '#/referensi',
      '#/roadmap',
      '#/glosarium',
      '#/latihan',
      '#/latihan/remote',
    ]) {
      await navigate(route);
      await evaluate('document.fonts.ready.then(() => true)');
      assert.equal(
        await evaluate('document.documentElement.scrollWidth > innerWidth'),
        false,
        `Layout meluber pada ${width}px: ${route}`,
      );
    }
  }
  await cdp('Page.navigate', {
    url: new URL('../index.html#/belajar/stash', import.meta.url).href,
  });
  await until("document.readyState==='complete' && !!document.querySelector('#quiz-form')");
  assert.match(await evaluate("document.querySelector('h1').innerText"), /Simpan sebentar/);
  await evaluate("document.querySelector('[data-sim-next]').click()");
  assert.match(await evaluate("document.querySelector('#stash-scene').innerText"), /WIP diskon/);
  await evaluate('document.fonts.ready.then(() => true)');
  assert.equal(
    await evaluate(
      "[...document.fonts].find(font=>font.family==='Poppins' && font.weight==='400')?.status",
    ),
    'loaded',
    'Poppins juga harus termuat saat index.html dibuka langsung.',
  );
  await cdp('Page.navigate', {
    url: new URL('../index.html#/latihan/remote', import.meta.url).href,
  });
  await until("!!document.querySelector('.exercise-solution')");
  assert.match(
    await evaluate("document.querySelector('.page-title').innerText"),
    /Remote tanpa internet/,
  );
  assert.deepEqual(errors, [], 'Runtime browser errors');
  console.log(
    `Browser QA lulus: ${ids.length} materi, ${labIds.length} halaman latihan/ZIP, 7 diagram bertahap, 3 playground, pencarian, progres, bookmark, tema hitam, dan mobile. Screenshot: artifacts/.`,
  );
} finally {
  if (websocket?.readyState === WebSocket.OPEN) {
    try {
      websocket.send(JSON.stringify({ id: 999999, method: 'Browser.close' }));
    } catch {}
    websocket.close();
  }
  if (browser.exitCode === null) browser.kill();
}
