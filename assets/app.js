(function () {
  'use strict';
  const { chapters, lessons, glossary, problems } = window.GitGuidesContent;
  const Sim = window.GitGuidesSimulator;
  const Pages = window.GitGuidesPages;
  const Routing = window.GitGuidesRoutes;
  const fileChip = Pages.fileChip;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );

  const href = (id) => Routing.href('/belajar/' + id + '/');
  const store = {
    get(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(`gitguides:${key}`)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`gitguides:${key}`, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
  };
  let completed = new Set(
    store.get('completed', []).filter((id) => lessons.some((lesson) => lesson.id === id)),
  );
  let bookmarks = new Set(store.get('bookmarks', []));
  let currentLesson = null,
    miniStep = 0,
    miniMode = 'pop',
    sandbox = null,
    sandboxScenario = 'stash',
    history = [],
    toastTimer;

  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000);
  }

  function updateProgress() {
    const percent = Math.round((completed.size / lessons.length) * 100);
    $('#progress-percent').textContent = `${percent}%`;
    $('#progress-bar').style.width = `${percent}%`;
    $('#progress-detail').textContent = completed.size
      ? `${completed.size} dari ${lessons.length} materi selesai. Terus melangkah.`
      : 'Satu langkah kecil setiap hari.';
  }

  function renderSidebar() {
    $('#chapter-nav').innerHTML = Pages.sidebar(currentLesson, completed);
    updateProgress();
  }

  function renderHome() {
    $('#main').innerHTML = /* HTML */ Pages.home({
      completed,
      lastLesson: store.get('lastLesson', 'stash'),
    });
  }

  function renderLesson(lesson) {
    currentLesson = lesson;
    miniStep = 0;
    miniMode = 'pop';
    store.set('lastLesson', lesson.id);

    $('#main').innerHTML = /* HTML */ Pages.lesson(lesson, { completed, bookmarks });
    renderVisual();
    window.GitGuidesLearning.enhanceLesson(lesson);
    $('#quiz-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const answer = Number(new FormData(event.target).get('answer')),
        correct = answer === lesson.quiz.answer;
      $('#quiz-feedback').className = `quiz-feedback ${correct ? 'correct' : 'incorrect'}`;
      $('#quiz-feedback').textContent =
        `${correct ? 'Tepat!' : 'Belum tepat. Coba pikirkan lagi.'} ${lesson.quiz.explanation}`;
    });
    $('#bookmark').addEventListener('click', () => {
      if (bookmarks.has(lesson.id)) bookmarks.delete(lesson.id);
      else bookmarks.add(lesson.id);
      const saved = store.set('bookmarks', [...bookmarks]);
      $('#bookmark').classList.toggle('saved', bookmarks.has(lesson.id));
      $('#bookmark').setAttribute('aria-pressed', bookmarks.has(lesson.id));
      $('#bookmark span').textContent = bookmarks.has(lesson.id) ? 'Tersimpan' : 'Simpan';
      toast(
        saved
          ? 'Daftar simpanan diperbarui.'
          : 'Simpanan hanya bertahan selama halaman ini terbuka. Penyimpanan perangkat tidak tersedia.',
      );
    });
    $('#complete-lesson').addEventListener('click', () => {
      if (completed.has(lesson.id)) completed.delete(lesson.id);
      else completed.add(lesson.id);
      const saved = store.set('completed', [...completed]);
      $('#complete-lesson').innerHTML = completed.has(lesson.id)
        ? '✓ Sudah dipahami'
        : 'Tandai sudah dipahami <span>✓</span>';
      $('#complete-lesson').setAttribute('aria-pressed', completed.has(lesson.id));
      renderSidebar();
      toast(
        saved
          ? completed.has(lesson.id)
            ? 'Satu langkah lagi. Progresmu sudah tersimpan.'
            : 'Materi ditandai belum selesai.'
          : 'Progres tersimpan sementara. Penyimpanan perangkat tidak tersedia.',
      );
    });
  }

  function renderVisual() {
    const host = $('#lesson-visual');
    if (host && currentLesson) host.innerHTML = Pages.visual(currentLesson, miniStep, miniMode);
  }

  function renderRoadmap(id) {
    const chosen = id ? chapters.filter((chapter) => chapter.id === Number(id)) : chapters;
    if (!chosen.length) {
      renderNotFound();
      return;
    }
    $('#main').innerHTML = /* HTML */ Pages.roadmap(id, { completed, bookmarks });
  }

  function renderReference() {
    $('#main').innerHTML = /* HTML */ Pages.reference();

    function filter() {
      $('#reference-results').innerHTML = Pages.referenceCards($('#reference-filter').value);
    }

    $('#reference-filter').addEventListener('input', filter);
    filter();
  }

  function renderProblems() {
    $('#main').innerHTML = /* HTML */ Pages.problems();
  }

  function renderGlossary() {
    $('#main').innerHTML = /* HTML */ Pages.glossary();

    function filter() {
      $('#glossary-results').innerHTML = Pages.glossaryEntries($('#glossary-filter').value);
    }

    $('#glossary-filter').addEventListener('input', filter);
    filter();
  }

  const scenarioInfo = Pages.scenarioInfo;

  function renderPlayground(scenario) {
    sandboxScenario = Object.hasOwn(scenarioInfo, scenario) ? scenario : 'stash';
    sandbox = Sim.createState(sandboxScenario);
    history = [];
    const info = scenarioInfo[sandboxScenario];
    $('#main').innerHTML = /* HTML */ Pages.playground(sandboxScenario);
    appendHistory('Selamat datang di Kopi Kita. Ketik git status atau klik command di bawah.');
    refreshSandbox();
    $('#terminal-form').addEventListener('submit', (event) => {
      event.preventDefault();
      runSandbox($('#terminal-input').value);
      $('#terminal-input').value = '';
    });
    $('#scenario-select').addEventListener('change', (event) => {
      Routing.navigate('/playground/?scenario=' + event.target.value);
    });
    $('#reset-playground').addEventListener('click', () => renderPlayground(sandboxScenario));
    $('#check-practice').addEventListener('click', () => {
      const observed =
        sandboxScenario !== 'stash' ||
        (history.some((command) => /^git stash(?: push)?.*-u/.test(command)) &&
          history.some((command) => /^git stash (?:pop|apply)/.test(command)));
      const complete = observed && info.isComplete(sandbox);
      $('#practice-result').className = `quiz-feedback ${complete ? 'correct' : 'incorrect'}`;
      $('#practice-result').textContent = complete
        ? 'Tepat! Keadaan akhir sesuai tujuan latihan. Coba status untuk memeriksa lagi.'
        : 'Belum sampai tujuan. Baca panel file, index, dan stash; lalu bandingkan dengan keadaan yang diminta.';
    });
  }

  function appendHistory(message, className = '') {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = message || '(tidak ada output)';
    $('#terminal-history').append(line);
    $('#terminal-history').scrollTop = $('#terminal-history').scrollHeight;
  }

  function runSandbox(command) {
    if (!command.trim()) return;
    appendHistory(`$ ${command}`, 'history-command');
    const result = Sim.execute(sandbox, command);
    sandbox = result.state;
    if (result.ok) history.push(command.trim());
    appendHistory(result.output, result.ok ? '' : 'history-error');
    refreshSandbox();
  }

  function refreshSandbox() {
    const base = Sim.head(sandbox).files;
    $('#sandbox-files').innerHTML = /* HTML */ `<h3>Keadaan pekerjaan</h3>
      <span class="branch-pill">⑂ ${esc(sandbox.branch)}</span>${Object.keys(sandbox.working)
        .map((path) => {
          const status = sandbox.conflicts.includes(path)
            ? '!'
            : !Object.hasOwn(sandbox.index, path)
              ? '?'
              : sandbox.working[path] !== sandbox.index[path]
                ? 'M'
                : sandbox.index[path] !== base[path]
                  ? 'S'
                  : '✓';
          return fileChip(
            path,
            status === '!'
              ? 'Konflik belum ditandai selesai'
              : sandbox.working[path].replace(/\n/g, ' ').slice(0, 35),
            status,
          );
        })
        .join('')}
      <p style="margin-top:12px">
        Index: ${Sim.changed(base, sandbox.index).length} perubahan staged
      </p>
      <p>HEAD: ${esc(Sim.head(sandbox).id)}</p>
      ${sandbox.conflicts.length
        ? '<button class="button small secondary" id="resolve-sandbox" style="margin-top:10px">Pilih diskon 10% di file</button>'
        : ''}`;
    $('#sandbox-stashes').innerHTML = /* HTML */ `<h3>
        Laci stash <span style="color:var(--muted)">(${sandbox.stashes.length})</span>
      </h3>
      ${sandbox.stashes.length
        ? sandbox.stashes
            .map((stash, index) =>
              fileChip(stash.message, `stash@{${index}} · ${stash.branch}`, '', true),
            )
            .join('')
        : '<p>Belum ada entri stash.</p>'}
      <p style="margin-top:12px">
        File baru hanya ikut push dengan -u. Pop yang berkonflik mempertahankan entri.
      </p>`;
    if ($('#resolve-sandbox'))
      $('#resolve-sandbox').addEventListener('click', () => {
        sandbox = Sim.resolveConflict(sandbox);
        appendHistory(
          'Editor: isi diskon.js dipilih menjadi const diskon = 10;\nLanjutkan dengan git add diskon.js untuk menandai penyelesaian.',
        );
        refreshSandbox();
      });
  }

  function renderNotFound() {
    $('#main').innerHTML = /* HTML */ Pages.notFound();
  }

  function route(page = Routing.current(), options = {}) {
    currentLesson = null;
    const section =
      page.kind === 'playground'
        ? 'playground'
        : ['labs', 'lab'].includes(page.kind)
          ? 'latihan'
          : ['reference', 'glossary', 'problems'].includes(page.kind)
            ? 'referensi'
            : 'belajar';
    $$('.topnav a').forEach((link) =>
      link.classList.toggle('active', link.dataset.nav === section),
    );
    switch (page.kind) {
      case 'home':
        renderHome();
        break;
      case 'lesson':
        renderLesson(lessons.find((lesson) => lesson.id === page.id));
        break;
      case 'chapter':
        renderRoadmap(page.id);
        break;
      case 'roadmap':
        renderRoadmap();
        break;
      case 'reference':
        renderReference();
        break;
      case 'glossary':
        renderGlossary();
        break;
      case 'problems':
        renderProblems();
        break;
      case 'playground':
        renderPlayground(new URLSearchParams(page.search).get('scenario') || 'stash');
        break;
      case 'labs':
        window.GitGuidesLearning.renderLabs();
        break;
      case 'lab':
        window.GitGuidesLearning.renderLabs(page.id);
        break;
      default:
        renderNotFound();
    }
    $('#main').dataset.pagePath = page.path;
    $('#main').dataset.hydrated = 'true';
    Routing.applyMetadata(page);
    renderSidebar();
    closeMenu();
    let anchor = null;
    try {
      anchor = page.hash ? document.getElementById(decodeURIComponent(page.hash.slice(1))) : null;
    } catch {}
    if (anchor) anchor.scrollIntoView();
    else window.scrollTo({ top: options.scrollY || 0, behavior: 'instant' });
    if (options.focus) $('#main').focus({ preventScroll: true });
  }

  function closeMenu() {
    $('#sidebar').classList.remove('open');
    $('#sidebar-scrim').classList.remove('visible');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
    $('#menu-toggle').setAttribute('aria-label', 'Buka daftar bab');
    $('#sidebar').inert = window.innerWidth <= 760;
  }

  function search() {
    const term = $('#search-input').value.trim().toLowerCase();
    const found = lessons.filter(
      (lesson) =>
        !term ||
        [lesson.title, lesson.summary, lesson.scenario, ...lesson.commands]
          .join(' ')
          .toLowerCase()
          .includes(term),
    );
    $('#search-results').innerHTML = found.length
      ? found
          .slice(0, 12)
          .map(
            (lesson) =>
              /* HTML */ `<a class="search-result" href="${href(lesson.id)}" data-search-result
                ><strong>${esc(lesson.title)}</strong
                ><small
                  >BAB ${String(lesson.chapter).padStart(2, '0')} ·
                  ${esc(lesson.commands.slice(0, 2).join(' · '))}</small
                ></a
              >`,
          )
          .join('')
      : '<div class="results-empty">Belum ketemu. Coba “stash”, “riwayat”, atau “commit”.</div>';
  }

  function openSearch() {
    search();
    $('#search-dialog').showModal();
    $('#search-input').focus();
  }

  $('#open-search').addEventListener('click', openSearch);
  $('#close-search').addEventListener('click', () => $('#search-dialog').close());
  $('#search-input').addEventListener('input', search);
  $('#search-dialog').addEventListener('click', (event) => {
    if (event.target === $('#search-dialog')) {
      const rect = event.target.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        event.target.close();
    }
  });
  $('#search-input').addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      $('.search-result')?.focus();
      event.preventDefault();
    }
    if (event.key === 'Enter') {
      $('.search-result')?.click();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (!$('#search-dialog').open) openSearch();
      else $('#search-dialog').close();
    }
    if (event.key === 'Escape') closeMenu();
  });
  $('#menu-toggle').addEventListener('click', () => {
    const open = $('#sidebar').classList.toggle('open');
    $('#sidebar-scrim').classList.toggle('visible', open);
    $('#sidebar').inert = !open;
    $('#menu-toggle').setAttribute('aria-expanded', open);
    $('#menu-toggle').setAttribute('aria-label', open ? 'Tutup daftar bab' : 'Buka daftar bab');
  });
  $('#sidebar-scrim').addEventListener('click', closeMenu);
  matchMedia('(max-width: 760px)').addEventListener('change', (event) => {
    $('#sidebar').inert = event.matches && !$('#sidebar').classList.contains('open');
  });
  let theme = store.get('theme', null);
  if (!['dark', 'light'].includes(theme)) theme = 'light';

  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    document.querySelector('meta[name="theme-color"]').content =
      value === 'dark' ? '#000000' : '#ff6200';
    $('#theme-toggle').textContent = value === 'dark' ? '☾' : '☼';
    $('#theme-toggle').setAttribute(
      'aria-label',
      value === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap',
    );
  }

  setTheme(theme);
  $('#theme-toggle').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    store.set('theme', theme);
  });

  async function copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.append(input);
        input.select();
        const copied = document.execCommand('copy');
        input.remove();
        if (!copied) throw new Error('Copy failed');
      }
      toast('Command tersalin. Periksa keadaan repo sebelum menjalankannya.');
    } catch {
      toast('Belum bisa menyalin otomatis. Pilih teks command untuk menyalinnya.');
    }
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button,a');
    if (!target) return;
    if (target.matches('[data-copy]')) copy(target.dataset.copy);
    if (target.matches('[data-search-result]')) $('#search-dialog').close();
    if (target.matches('[data-scroll]')) {
      event.preventDefault();
      Routing.section(target.dataset.scroll);
      $$('.toc a').forEach((link) => link.classList.toggle('current', link === target));
      document.getElementById(target.dataset.scroll)?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
    if (target.matches('.skip-link')) {
      event.preventDefault();
      $('#main').focus();
      $('#main').scrollIntoView();
    }
    if (target.matches('[data-sim-step]')) {
      miniStep = Number(target.dataset.simStep);
      renderVisual();
    }
    if (target.matches('[data-sim-next]')) {
      miniStep = Math.min(2, miniStep + 1);
      renderVisual();
    }
    if (target.matches('[data-sim-reset]')) {
      miniStep = 0;
      renderVisual();
    }
    if (target.matches('[data-sim-mode]')) {
      miniMode = miniMode === 'pop' ? 'apply' : 'pop';
      renderVisual();
    }
    if (target.matches('[data-conflict-choice]')) {
      $('#conflict-preview').textContent = `const harga = ${target.dataset.conflictChoice};`;
      $('#conflict-note').textContent =
        'Marker dihapus. Sekarang periksa logika, uji, lalu git add file yang telah diselesaikan.';
    }
    if (target.matches('[data-suggest]')) {
      $('#terminal-input').value = target.dataset.suggest;
      $('#terminal-input').focus();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (
      !event.target.matches('.sim-tab') ||
      !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
    )
      return;
    event.preventDefault();
    miniStep =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 2
          : (miniStep + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
    renderVisual();
    $(`[data-sim-step="${miniStep}"]`)?.focus();
  });
  Routing.start(route);
})();
