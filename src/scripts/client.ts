import { readProgress, readValue, writeValue, importProgress } from '../lib/progress.js';

type Quiz = { question: string; options: string[]; answer: number; explanation: string };
type Lesson = { id: string; chapter: number; title: string };
type SearchEntry = { id: string; title: string; kind: string; url: string; text: string };
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector);
const $$ = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const data: {
  kind: string;
  lessons: Lesson[];
  lesson?: { id: string; quiz: Quiz; checkpoint?: Quiz };
  frames: Record<string, string>;
} = JSON.parse($('#page-data')!.textContent!);
const ids = data.lessons.map((lesson) => lesson.id);
// Accessing localStorage itself can throw in restricted browser contexts.
let storage: Storage;
try {
  storage = window.localStorage;
} catch {
  storage = {
    getItem: () => null,
    setItem: () => {
      throw new Error('Storage unavailable');
    },
  } as unknown as Storage;
}
let progress = readProgress(storage, ids);
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  $('#toast')!.textContent = message;
  $('#toast')!.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast')!.classList.remove('visible'), 3500);
}
function persist(key: 'completed' | 'bookmarks' | 'quizzes' | 'practices') {
  const saved = writeValue(storage, key, progress[key]);
  if (!saved)
    toast(
      'Penyimpanan perangkat tidak tersedia. Perubahan hanya bertahan selama halaman ini terbuka.',
    );
  return saved;
}
function updateProgress() {
  const completed = new Set(progress.completed);
  const percent = Math.round((completed.size / ids.length) * 100);
  $('#progress-percent')!.textContent = percent + '%';
  $('#progress-bar')!.style.width = percent + '%';
  $('#progress-detail')!.textContent =
    `${completed.size} dari ${ids.length} materi ditandai selesai.`;
  $$('#chapter-nav .chapter-item').forEach((link, index) => {
    const done = data.lessons
      .filter((lesson) => lesson.chapter === index + 1)
      .every((lesson) => completed.has(lesson.id));
    link.querySelector('.done-marker')?.remove();
    if (done) {
      const marker = document.createElement('span');
      marker.className = 'done-marker';
      marker.textContent = '✓';
      marker.setAttribute('aria-label', 'Bab selesai');
      link.append(marker);
    }
  });
  $$('a[href^="/belajar/"] .lesson-check').forEach((marker) => {
    const id = marker.closest('a')!.getAttribute('href')!.split('/')[2];
    marker.textContent = completed.has(id) ? '✓' : '↗';
  });
  const current = data.lesson?.id;
  if (current) {
    const done = completed.has(current),
      saved = progress.bookmarks.includes(current);
    $('#complete-lesson')!.setAttribute('aria-pressed', String(done));
    $('#complete-lesson')!.textContent = done ? '✓ Sudah dipahami' : 'Tandai sudah dipahami ✓';
    $('#bookmark')!.setAttribute('aria-pressed', String(saved));
    $('#bookmark')!.classList.toggle('saved', saved);
    $('#bookmark span')!.textContent = saved ? 'Tersimpan' : 'Simpan';
    writeValue(storage, 'lastLesson', current);
  }
  const summary = $('#learning-summary');
  if (summary)
    summary.textContent = `${completed.size} materi ditandai selesai · ${Object.values(progress.quizzes).filter(Boolean).length} kuis dijawab benar · ${Object.keys(progress.practices).length} skenario browser selesai. Progres tersimpan di perangkat ini.`;
  const last = readValue(storage, 'lastLesson', 'kenalan-git');
  const resume = $('#resume-learning') as HTMLAnchorElement | null;
  if (resume && typeof last === 'string' && ids.includes(last))
    resume.href = '/belajar/' + last + '/';
  const savedList = $('#saved-lessons');
  if (savedList) {
    savedList.replaceChildren();
    for (const lesson of data.lessons.filter((lesson) => progress.bookmarks.includes(lesson.id))) {
      const link = document.createElement('a');
      link.href = `/belajar/${lesson.id}/`;
      link.textContent = lesson.title;
      link.className = 'text-button';
      savedList.append(link);
    }
    if (!savedList.children.length) savedList.textContent = 'Belum ada materi yang disimpan.';
  }
}

// Native document navigation retains browser Back/Forward scroll restoration.
if (location.hash.startsWith('#/')) {
  const target = location.hash.slice(1);
  if (target.startsWith('/') && !target.startsWith('//')) location.replace(target);
}
for (const control of document.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
  '[data-prerender-disabled]',
)) {
  control.disabled = false;
  control.removeAttribute('data-prerender-disabled');
}
document.documentElement.classList.remove('no-js');
$('#main')!.dataset.hydrated = 'true';
const section =
  data.kind === 'playground'
    ? 'playground'
    : ['labs', 'lab'].includes(data.kind)
      ? 'latihan'
      : ['reference', 'glossary', 'problems'].includes(data.kind)
        ? 'referensi'
        : 'belajar';
$$('.topnav a').forEach((link) => {
  link.classList.toggle('active', link.dataset.nav === section);
  if (link.dataset.nav === section) link.setAttribute('aria-current', 'page');
});
updateProgress();
window.addEventListener('pageshow', updateProgress);
window.addEventListener('storage', () => {
  progress = readProgress(storage, ids);
  updateProgress();
});

$('#complete-lesson')?.addEventListener('click', () => {
  const id = data.lesson!.id;
  progress.completed = progress.completed.includes(id)
    ? progress.completed.filter((value) => value !== id)
    : [...progress.completed, id];
  if (persist('completed')) toast('Progres belajar diperbarui.');
  updateProgress();
});
$('#bookmark')?.addEventListener('click', () => {
  const id = data.lesson!.id;
  progress.bookmarks = progress.bookmarks.includes(id)
    ? progress.bookmarks.filter((value) => value !== id)
    : [...progress.bookmarks, id];
  if (persist('bookmarks')) toast('Daftar simpanan diperbarui.');
  updateProgress();
});
for (const [name, quiz] of [
  ['main', data.lesson?.quiz],
  ['checkpoint', data.lesson?.checkpoint],
] as const) {
  if (!quiz) continue;
  const form = $(name === 'main' ? '#quiz-form' : '#checkpoint-form') as HTMLFormElement;
  const feedback = form.querySelector<HTMLElement>('[role="status"]')!;
  const key = data.lesson!.id + ':' + name;
  if (progress.quizzes[key] === true)
    feedback.textContent = 'Sebelumnya dijawab benar di perangkat ini. Kamu bisa mencoba lagi.';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answer = new FormData(form).get('answer');
    if (answer === null) return;
    const correct = Number(answer) === quiz.answer;
    feedback.className = 'quiz-feedback ' + (correct ? 'correct' : 'incorrect');
    feedback.textContent = (correct ? 'Tepat! ' : 'Belum tepat. ') + quiz.explanation;
    progress.quizzes[key] = correct;
    persist('quizzes');
    updateProgress();
  });
}

let step = 0,
  mode = 'pop';
function showFrame(next: number, nextMode = mode, focusSelector?: string) {
  const html = data.frames[`${nextMode}:${next}`] || data.frames[String(next)];
  if (!html) return;
  step = next;
  mode = nextMode;
  const host = $('#lesson-visual')!;
  host.innerHTML = html;
  host.querySelectorAll<HTMLButtonElement>('[data-prerender-disabled]').forEach((button) => {
    button.disabled = false;
    button.removeAttribute('data-prerender-disabled');
  });
  const focus = focusSelector ? host.querySelector<HTMLElement>(focusSelector) : null;
  (focus && !focus.hasAttribute('disabled')
    ? focus
    : host.querySelector<HTMLElement>('.sim-tab.active, [data-flow-step="0"], [data-sim-reset]')
  )?.focus({ preventScroll: true });
}
document.addEventListener('click', async (event) => {
  const target = (event.target as Element).closest<HTMLElement>('button,a');
  if (!target) return;
  if (target.hasAttribute('data-copy')) {
    try {
      await navigator.clipboard.writeText(target.dataset.copy!);
      toast('Command tersalin. Periksa keadaan repo sebelum menjalankannya.');
    } catch {
      toast('Pilih teks command untuk menyalinnya.');
    }
  }
  if (target.hasAttribute('data-flow-step'))
    showFrame(
      Number(target.dataset.flowStep),
      mode,
      `[data-flow-step="${target.dataset.flowStep}"]`,
    );
  if (target.hasAttribute('data-sim-step'))
    showFrame(Number(target.dataset.simStep), mode, `[data-sim-step="${target.dataset.simStep}"]`);
  if (target.hasAttribute('data-sim-next'))
    showFrame(Math.min(2, step + 1), mode, '[data-sim-next]');
  if (target.hasAttribute('data-sim-reset')) showFrame(0, mode, '[data-sim-reset]');
  if (target.hasAttribute('data-sim-mode'))
    showFrame(step, mode === 'pop' ? 'apply' : 'pop', '[data-sim-mode]');
  if (target.hasAttribute('data-resolve-value') || target.hasAttribute('data-conflict-choice')) {
    $('#conflict-preview')!.textContent =
      target.dataset.resolveValue || `const harga = ${target.dataset.conflictChoice};`;
    $('#conflict-note')!.textContent =
      'Marker konflik sudah diganti. Uji hasil, add file yang selesai, lalu lanjutkan proses Git yang sesuai. Stash tidak mempunyai --continue.';
  }
  if (target.hasAttribute('data-scroll')) {
    event.preventDefault();
    const id = target.dataset.scroll!;
    history.replaceState(history.state, '', '#' + id);
    document.getElementById(id)?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
    $$('.toc a').forEach((link) => link.classList.toggle('current', link === target));
  }
});
document.addEventListener('keydown', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('.sim-tab');
  if (!target || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tabs = [...target.parentElement!.querySelectorAll<HTMLElement>('.sim-tab')];
  const current = tabs.indexOf(target);
  const index =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : (current + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
  const next = tabs[index];
  showFrame(
    index,
    mode,
    next.hasAttribute('data-flow-step')
      ? `[data-flow-step="${index}"]`
      : `[data-sim-step="${index}"]`,
  );
});

let theme = readValue(storage, 'theme', 'light');
if (!['dark', 'light'].includes(theme)) theme = 'light';
function setTheme(value: string) {
  document.documentElement.dataset.theme = value;
  $('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#000000' : '#ff6200');
  $('#theme-toggle')!.textContent = value === 'dark' ? '☾' : '☼';
  $('#theme-toggle')!.setAttribute(
    'aria-label',
    value === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap',
  );
}
setTheme(theme);
$('#theme-toggle')!.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  writeValue(storage, 'theme', theme);
});
const menu = $('#sidebar')!,
  menuButton = $('#menu-toggle')!;
function closeMenu() {
  menu.classList.remove('open');
  $('#sidebar-scrim')!.classList.remove('visible');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Buka daftar bab');
  menu.inert = innerWidth <= 760;
}
closeMenu();
menuButton.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  if (!open) {
    closeMenu();
    return;
  }
  menu.classList.add('open');
  $('#sidebar-scrim')!.classList.add('visible');
  menu.inert = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Tutup daftar bab');
});
$('#sidebar-scrim')!.addEventListener('click', closeMenu);
matchMedia('(max-width:760px)').addEventListener('change', () => {
  menu.inert = innerWidth <= 760 && !menu.classList.contains('open');
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});

let searchIndex: Promise<SearchEntry[]> | undefined;
const dialog = $('#search-dialog') as HTMLDialogElement,
  searchInput = $('#search-input') as HTMLInputElement;
let searchSerial = 0;
async function search() {
  const serial = ++searchSerial;
  const term = searchInput.value.trim().toLocaleLowerCase('id');
  const results = $('#search-results')!;
  results.textContent = 'Menyiapkan pencarian…';
  try {
    searchIndex ||= fetch('/search-index.json')
      .then((response) => {
        if (!response.ok) throw new Error('Search unavailable');
        return response.json();
      })
      .catch((error) => {
        searchIndex = undefined;
        throw error;
      });
    const entries = await searchIndex;
    if (serial !== searchSerial) return;
    const tokens = term.split(/\s+/).filter(Boolean);
    const matches = entries
      .map((entry) => ({
        entry,
        score: tokens.reduce(
          (score, token) =>
            score +
            (entry.title.toLowerCase().includes(token) ? 10 : 0) +
            (entry.text.toLowerCase().includes(token) ? 1 : 0),
          0,
        ),
      }))
      .filter((item) =>
        tokens.every((token) =>
          (item.entry.title + ' ' + item.entry.text).toLowerCase().includes(token),
        ),
      )
      .sort((a, b) => b.score - a.score);
    results.replaceChildren();
    const count = document.createElement('p');
    count.className = 'search-count';
    count.setAttribute('role', 'status');
    count.textContent = `${matches.length} hasil${term ? ' untuk “' + searchInput.value.trim() + '”' : ''}`;
    results.append(count);
    for (const { entry } of matches) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.url;
      link.dataset.searchResult = '';
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const snippet = document.createElement('small');
      const index = term ? entry.text.toLowerCase().indexOf(tokens[0]) : 0;
      const start = Math.max(0, index - 40);
      snippet.textContent =
        entry.kind + ' · ' + (start ? '…' : '') + entry.text.slice(start, start + 145) + '…';
      link.append(title, snippet);
      results.append(link);
    }
    if (!matches.length)
      results.append(
        document.createTextNode('Belum ketemu. Coba istilah lain atau buka referensi command.'),
      );
  } catch {
    if (serial === searchSerial)
      results.textContent =
        'Pencarian belum tersedia. Periksa koneksi, lalu coba lagi atau buka peta belajar.';
  }
}
function openSearch() {
  dialog.showModal();
  searchInput.focus();
  void search();
}
$('#open-search')!.addEventListener('click', openSearch);
$('#close-search')!.addEventListener('click', () => dialog.close());
searchInput.addEventListener('input', search);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    $('#search-results a')?.focus();
  }
  if (event.key === 'Enter') $('#search-results a')?.click();
});
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (
    event.target === dialog &&
    (event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom)
  )
    dialog.close();
});
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (dialog.open) dialog.close();
    else openSearch();
  }
});

for (const [inputId, selector] of [
  ['reference-filter', '.reference-card'],
  ['glossary-filter', '.glossary-item'],
]) {
  $(inputId.startsWith('#') ? inputId : '#' + inputId)?.addEventListener('input', (event) => {
    const term = (event.target as HTMLInputElement).value.trim().toLowerCase();
    $$(selector).forEach((card) => {
      card.hidden = !card.textContent!.toLowerCase().includes(term);
    });
  });
}
$('#export-progress')?.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  link.href = url;
  link.download = 'git-guides-progres.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('#import-progress')?.addEventListener('change', async (event) => {
  const input = event.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 100000) throw new Error('Ukuran berkas progres maksimal 100 KB.');
    progress = importProgress(storage, JSON.parse(await file.text()), ids);
    updateProgress();
    toast('Progres berhasil diimpor.');
  } catch (error) {
    toast(error instanceof Error ? error.message : 'Berkas progres tidak dapat dibaca.');
  } finally {
    input.value = '';
  }
});

if (data.kind === 'playground') {
  import('./playground')
    .then((module) =>
      module.startPlayground((scenario: string) => {
        progress.practices[scenario] = true;
        persist('practices');
        updateProgress();
      }),
    )
    .catch(() => {
      $('#practice-result')!.textContent =
        'Simulator belum berhasil dimuat. Muat ulang halaman untuk mencoba lagi.';
    });
}
