import { test, expect } from '@playwright/test';
const Content = require('../../assets/content.js');
const Routes = require('../../assets/routes.js');

test('seluruh route HTTP, aset, download, dan 404 dilayani preview Astro', async ({ request }) => {
  for (const route of Routes.entries()) {
    const response = await request.get(route.path);
    expect(response.status(), route.path).toBe(200);
    expect(await response.text()).toContain('data-page-path="' + route.path + '"');
  }
  expect((await request.get('/halaman-tidak-ada/')).status()).toBe(404);
  const zip = await request.get('/assets/downloads/kopi-kita-labs.zip');
  expect(zip.status()).toBe(200);
  expect((await zip.body()).readUInt32LE(0)).toBe(0x04034b50);
});

test('66 materi dapat dibuka tanpa runtime error dan halaman biasa tidak mengambil simulator', async ({
  page,
}) => {
  const errors: string[] = [],
    scripts: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url());
  });
  await page.goto('/belajar/snapshot/');
  await expect(page.locator('#main')).toHaveAttribute('data-hydrated', 'true');
  expect(scripts.some((url) => url.includes('playground.'))).toBe(false);
  for (const lesson of Content.lessons) {
    await page.goto('/belajar/' + lesson.id + '/');
    await expect(page.locator('#main')).toHaveAttribute('data-hydrated', 'true');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#quiz-form')).toBeAttached();
  }
  expect(errors).toEqual([]);
});

test('hover link halaman memicu prefetch, tetapi tombol unduh ZIP tidak', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (request) => requested.push(new URL(request.url()).pathname));
  await page.goto('/latihan/remote/');
  await expect(page.locator('#main')).toHaveAttribute('data-hydrated', 'true');

  const lessonLink = page.locator('#main a[href="/belajar/fetch-pull/"]').first();
  const prefetched = page.waitForRequest(
    (request) => new URL(request.url()).pathname === '/belajar/fetch-pull/',
  );
  await lessonLink.hover();
  await prefetched;

  await page.locator('a[download]').first().hover();
  await page.waitForTimeout(300);
  expect(requested.filter((path) => path.endsWith('.zip'))).toEqual([]);
});

test('persiapan membawa pemula dari instalasi ke materi pertama', async ({ page }) => {
  await page.goto('/belajar/kenalan-git/');
  await page.getByRole('link', { name: 'Belum pasang Git? Ikuti halaman persiapan' }).click();
  await expect(page).toHaveURL(/\/persiapan\/$/);
  await expect(page.locator('#instalasi')).toContainText('Windows');
  await expect(page.locator('#terminal')).toContainText('prompt');
  await page.locator('#mulai a[href="/belajar/kenalan-git/"]').click();
  await expect(page).toHaveURL(/\/belajar\/kenalan-git\/$/);
});

test('tipe progres lama yang salah tidak mematikan interaksi; status tetap tersimpan', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('gitguides:completed', '{}');
    localStorage.setItem('gitguides:bookmarks', 'false');
  });
  await page.goto('/belajar/stash/');
  await expect(page.locator('#main')).toHaveAttribute('data-hydrated', 'true');
  await page.locator('#complete-lesson').click();
  await expect(page.locator('#complete-lesson')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('gitguides:completed')!)),
  ).toEqual(['stash']);
});

test('diagram mempertahankan fokus setelah aktivasi tombol dan navigasi panah', async ({
  page,
}) => {
  await page.goto('/belajar/branch/');
  const second = page.locator('.flow-tabs [data-flow-step="1"]');
  await second.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.flow-tabs [data-flow-step="1"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.flow-tabs [data-flow-step="2"]')).toBeFocused();
  await page.goto('/belajar/stash/');
  await page.locator('[data-sim-step="1"]').click();
  await expect(page.locator('[data-sim-step="1"]')).toBeFocused();
  await page.goto('/belajar/partial-staging/');
  await page.locator('.flow-tabs [data-flow-step="1"]').click();
  await expect(page.locator('#lesson-visual')).toContainText('hunk');
});

test('Back dan Forward memulihkan posisi baca kedua halaman', async ({ page }) => {
  await page.goto('/belajar/staging/');
  await expect(page.locator('#main')).toHaveAttribute('data-hydrated', 'true');
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
  await page.goto('/belajar/ignore/');
  await expect(page.locator('#main')).toHaveAttribute('data-hydrated', 'true');
  await page.evaluate(() => window.scrollTo({ top: 2100, behavior: 'instant' }));
  await page.goBack();
  await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY - 1200))).toBeLessThan(10);
  await page.goForward();
  await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY - 2100))).toBeLessThan(10);
});

test('pencarian isi mendalam dan seluruh hasil; kuis menyimpan hasil', async ({ page }) => {
  await page.goto('/');
  await page.locator('#open-search').click();
  await page.locator('#search-input').fill('125');
  await expect(page.locator('#search-results a[href="/belajar/bisect-run/"]')).toContainText('125');
  await page.locator('#search-input').fill('git');
  await expect.poll(() => page.locator('#search-results a').count()).toBeGreaterThan(12);
  await page.goto('/belajar/snapshot/');
  const payload = JSON.parse((await page.locator('#page-data').textContent()) || '{}');
  await page.locator(`#quiz-form input[value="${payload.lesson.quiz.answer}"]`).check();
  await page.locator('#quiz-form button[type=submit]').click();
  await expect(page.locator('#quiz-feedback')).toContainText('Tepat!');
  await page.locator(`#checkpoint-form input[value="${payload.lesson.checkpoint.answer}"]`).check();
  await page.locator('#checkpoint-form button[type=submit]').click();
  await page.reload();
  await expect(page.locator('#checkpoint-feedback')).toContainText('Sebelumnya dijawab benar');
});

for (const [scenario, commands] of Object.entries({
  stash: ['git stash push -u -m "Latihan"', 'git stash pop'],
  staging: ['git add menu.json', 'git commit -m "Menu"'],
  branch: ['git switch -c hotfix', 'git add diskon.js', 'git commit -m "Hotfix"'],
  conflict: ['git stash pop', 'RESOLVE', 'git add diskon.js', 'git commit -m "Selesai"'],
}))
  test('playground ' + scenario + ': kondisi awal ke hasil dan penyimpanan', async ({ page }) => {
    await page.goto('/playground/?scenario=' + scenario);
    await expect(page.locator('#terminal-history')).toContainText('Selamat datang');
    for (const command of commands) {
      if (command === 'RESOLVE') {
        await page.locator('#resolve-sandbox').click();
        continue;
      }
      await page.locator('#terminal-input').fill(command);
      await page.locator('#terminal-input').press('Enter');
    }
    await page.locator('#check-practice').click();
    await expect(page.locator('#practice-result')).toContainText('Tepat!');
    expect(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem('gitguides:practices')!)[key],
        scenario,
      ),
    ).toBe(true);
  });

test('ekspor, impor, dan daftar simpanan memulihkan progres', async ({ page }) => {
  await page.goto('/roadmap/');
  const file = {
    version: 1,
    completed: ['stash'],
    bookmarks: ['branch'],
    quizzes: { 'stash:main': true },
    practices: { stash: true },
  };
  await page.locator('#import-progress').setInputFiles({
    name: 'progres.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(file)),
  });
  await expect(page.locator('#progress-detail')).toContainText('1 dari');
  await expect(page.locator('#saved-lessons')).toContainText('jalur');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#export-progress').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('git-guides-progres.json');
});

test('mobile 320–1024px dan desktop tidak meluber; menu dan tema dapat dipakai', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/',
      '/persiapan/',
      '/belajar/stash/',
      '/belajar/partial-staging/',
      '/belajar/submodule/',
      '/roadmap/',
      '/playground/',
    ]) {
      await page.goto(route);
      await expect(page.locator('#main')).toHaveAttribute('data-hydrated', 'true');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        width + ': ' + route,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/belajar/stash/');
  await page.locator('#menu-toggle').click();
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-toggle')).toBeFocused();
  await page.locator('#theme-toggle').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'artifacts/astro-mobile.png', fullPage: false });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await page.screenshot({ path: 'artifacts/astro-home.png', fullPage: false });
});

test('materi dan unduhan tetap tersedia tanpa JavaScript; tautan hash lama dinormalisasi', async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const plain = await context.newPage();
  await plain.goto('/belajar/stash/');
  await expect(plain.locator('#konsep')).toContainText('stash');
  await expect(plain.locator('#quiz-form button')).toBeDisabled();
  await plain.goto('/latihan/submodule/');
  await expect(plain.locator('a[download]')).toBeVisible();
  await context.close();
  await page.goto('/#/belajar/stash');
  await expect(page).toHaveURL(/\/belajar\/stash\/?$/);
});
