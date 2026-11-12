(function () {
  'use strict';
  const { chapters, lessons, glossary, problems } = window.GitGuidesContent;
  const Sim = window.GitGuidesSimulator;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  const inline = (value) =>
    esc(value).replace(
      /\b(git [a-z][a-z-]*(?: --[a-z-]+)?|HEAD(?:~\d)?|origin\/main|--staged|--index|--soft|--mixed|--hard|\.gitignore|\.gitattributes)\b/g,
      '<code>$1</code>',
    );
  const href = (id) => `#/belajar/${id}`;
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
  const cup = /* HTML */ `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    aria-hidden="true"
  >
    <path
      d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Zm12 1h2a3 3 0 0 1 0 6h-2M3 22h16M8 3v2m4-3v3m4-2v2"
    />
  </svg>`;
  const bookmarkIcon = /* HTML */ `<svg
    viewBox="0 0 14 17"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
    aria-hidden="true"
  >
    <path d="M2 1h10v14L7 12l-5 3V1Z" />
  </svg>`;

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
    let lastGroup = '';
    $('#chapter-nav').innerHTML = chapters
      .map((chapter) => {
        const first = lessons.find((lesson) => lesson.chapter === chapter.id);
        const group =
          chapter.group !== lastGroup
            ? /* HTML */ `<div class="chapter-group">${esc(chapter.group)}</div>`
            : '';
        lastGroup = chapter.group;
        const done = lessons
          .filter((lesson) => lesson.chapter === chapter.id)
          .every((lesson) => completed.has(lesson.id));
        const active = currentLesson?.chapter === chapter.id;
        return /* HTML */ `${group}<a
            class="chapter-item ${active ? 'active' : ''}"
            href="${href(first.id)}"
            ${active ? 'aria-current="page"' : ''}
            ><span class="chapter-number">${String(chapter.id).padStart(2, '0')}</span
            ><span>${esc(chapter.title)}</span>${active
              ? '<span class="active-dot" aria-hidden="true"></span>'
              : done
                ? '<span class="done-marker" aria-label="Bab selesai">✓</span>'
                : ''}</a
          >`;
      })
      .join('');
    updateProgress();
  }

  function crumbs(parts) {
    return /* HTML */ `<div class="breadcrumbs">
      <a href="#/">Beranda</a>${parts
        .map(
          ([label, url]) =>
            /* HTML */ `<span class="crumb-divider" aria-hidden="true">›</span>${url
                ? /* HTML */ `<a href="${url}">${esc(label)}</a>`
                : /* HTML */ `<strong>${esc(label)}</strong>`}`,
        )
        .join('')}
    </div>`;
  }

  function commandBlock(command) {
    return /* HTML */ `<div class="command-block">
      <pre><code>${esc(command)}</code></pre>
      <button class="copy-button" data-copy="${esc(command)}" aria-label="Salin command">
        Salin <span aria-hidden="true">⧉</span>
      </button>
    </div>`;
  }

  function quizHTML(lesson) {
    return /* HTML */ `<div class="quiz-card">
      <div class="quiz-eyebrow">CEK PEMAHAMANMU</div>
      <h3>${esc(lesson.quiz.question)}</h3>
      <form id="quiz-form">
        <div class="quiz-options">
          ${lesson.quiz.options
            .map(
              (option, index) =>
                /* HTML */ `<label class="quiz-option"
                  ><input type="radio" name="answer" value="${index}" required /><span
                    >${esc(option)}</span
                  ></label
                >`,
            )
            .join('')}
        </div>
        <button class="button small" type="submit">
          Periksa jawaban <span aria-hidden="true">→</span>
        </button>
        <div class="quiz-feedback" id="quiz-feedback" role="status"></div>
      </form>
    </div>`;
  }

  function homeGraph() {
    return /* HTML */ `<div class="home-illustration">
      <div class="illustration-caption">
        <span>SEBUAH IDE. JALURNYA SENDIRI.</span><span>↗</span>
      </div>
      <svg
        viewBox="0 0 310 175"
        role="img"
        aria-label="Grafik: main berlanjut lurus, fitur bercabang lalu digabung kembali"
      >
        <path d="M25 113H285" stroke="var(--graph-main)" stroke-width="2" fill="none" />
        <path
          d="M75 113C105 113 97 53 130 53H190C228 53 217 113 255 113"
          stroke="var(--graph-feature)"
          stroke-width="2"
          fill="none"
        />
        <g fill="var(--surface)" stroke="var(--graph-main)" stroke-width="2">
          <circle cx="27" cy="113" r="6" />
          <circle cx="75" cy="113" r="6" />
          <circle cx="195" cy="113" r="6" />
          <circle cx="255" cy="113" r="6" />
        </g>
        <g fill="var(--accent-soft)" stroke="var(--graph-feature)" stroke-width="2">
          <circle cx="135" cy="53" r="6" />
          <circle cx="188" cy="53" r="6" />
        </g>
        <rect x="117" y="15" width="91" height="21" rx="4" fill="var(--accent-soft)" />
        <text
          x="162"
          y="29"
          text-anchor="middle"
          fill="var(--primary-ink)"
          font-size="11"
          font-family="monospace"
        >
          fitur-diskon
        </text>
        <rect x="172" y="138" width="45" height="21" rx="4" fill="var(--soft)" />
        <text
          x="194"
          y="152"
          text-anchor="middle"
          fill="var(--ink)"
          font-size="11"
          font-family="monospace"
        >
          main
        </text>
        <text
          x="252"
          y="92"
          text-anchor="middle"
          fill="var(--muted)"
          font-size="10"
          font-family="monospace"
        >
          merge
        </text>
      </svg>
      <div class="illustration-bottom">Bukan sulap. Cuma alur yang mulai masuk akal.</div>
    </div>`;
  }

  function renderHome() {
    const last = store.get('lastLesson', 'stash'),
      resume = lessons.find((lesson) => lesson.id === last) || lessons[0];
    $('#main').innerHTML = /* HTML */ `<div class="page-container scroll-reveal">
      ${crumbs([['Selamat datang']])}
      <section class="home-hero">
        <div>
          <div class="eyebrow">GIT, SELANGKAH LEBIH PAHAM</div>
          <h1 class="page-title">Lebih dari sekadar<br /><em>push dan pull.</em></h1>
          <p class="page-intro">
            Pahami apa yang terjadi di balik setiap command. Belajar Git lewat cerita sehari-hari,
            visual yang masuk akal, dan tempat aman untuk mencoba.
          </p>
          <div class="home-actions">
            <a class="button" href="${href('kenalan-git')}">Mulai dari awal <span>→</span></a
            ><a class="button secondary" href="${href('stash')}"
              >Lihat contoh interaktif <span>↗</span></a
            >
          </div>
        </div>
        ${homeGraph()}
      </section>
      <div class="section-heading">
        <div>
          <h2>Mulai dari tempatmu sekarang.</h2>
          <p>Belum pernah commit atau sudah sering nge-push? Ada jalan buatmu.</p>
        </div>
        <a href="#/roadmap">Lihat 16 bab <span>↗</span></a>
      </div>
      <div class="learning-paths">
        <a class="path-card" href="${href('kenalan-git')}"
          ><div class="path-icon" aria-hidden="true">⌁</div>
          <h3>Aku baru mulai</h3>
          <p>
            Dari “Git itu apa?” sampai commit pertamamu. Pelan-pelan, dengan fondasi yang jelas.
          </p>
          <small>BAB 01–04 · FONDASI</small><span class="path-arrow">↗</span></a
        ><a class="path-card" href="#/masalah"
          ><div class="path-icon" aria-hidden="true">⌘</div>
          <h3>Aku lagi ada masalah</h3>
          <p>
            Salah commit, push ditolak, atau perlu jeda kerja? Cari jalan keluar sesuai keadaanmu.
          </p>
          <small>BELAJAR DARI KASUS</small><span class="path-arrow">↗</span></a
        ><a class="path-card" href="#/playground"
          ><div class="path-icon" aria-hidden="true">&gt;_</div>
          <h3>Aku ingin mencoba</h3>
          <p>Coba command, lihat efeknya, lalu ulangi. Pekerjaan aslimu tetap di tempatnya.</p>
          <small>SIMULATOR DI BROWSER</small><span class="path-arrow">↗</span></a
        >
      </div>
      <section class="home-feature">
        <div>
          <div class="eyebrow">SATU KASUS, SATU PEMAHAMAN BARU</div>
          <h2>Kerjaan belum selesai.<br />Ada bug yang harus dibereskan.</h2>
          <p>
            Kenali stash lewat situasi yang pasti akan kamu temui. Simpan pekerjaan, tangani yang
            mendesak, lalu lanjutkan lagi.
          </p>
          <a class="text-button" href="${href('stash')}">Buka pelajaran stash <span>→</span></a>
        </div>
        ${commandBlock(
          'git stash push -m "WIP diskon"\n\n# Simpan sebentar. Lanjutkan nanti.\ngit stash pop',
        )}
      </section>
      <div class="section-heading">
        <div>
          <h2>Perjalananmu, langkahmu.</h2>
          <p>
            ${completed.size} dari ${lessons.length} materi sudah kamu tandai selesai. Progres
            tersimpan di perangkat ini.
          </p>
        </div>
        <a href="${href(resume.id)}"
          >${completed.size ? 'Lanjutkan belajar' : 'Coba bab pilihan'} →</a
        >
      </div>
    </div>`;
  }

  function renderLesson(lesson) {
    currentLesson = lesson;
    miniStep = 0;
    miniMode = 'pop';
    store.set('lastLesson', lesson.id);
    const chapter = chapters.find((chapter) => chapter.id === lesson.chapter),
      index = lessons.indexOf(lesson),
      previous = lessons[index - 1],
      next = lessons[index + 1];
    const title =
      lesson.id === 'stash'
        ? 'Simpan sebentar.<br/><span class="title-accent">Lanjutkan nanti.</span>'
        : esc(lesson.title);
    const firstSource = lesson.commands[0].split(' ')[1]?.replace(/^--.*/, 'git') || 'git';
    const toc = [
      ['situasi', 'Situasinya begini'],
      ['visualisasi', 'Lihat alurnya'],
      ['konsep', 'Pahami konsepnya'],
      ['langkah', 'Coba langkahnya'],
      ['perhatian', 'Yang perlu diingat'],
      ['latihan', 'Giliranmu mencoba'],
      ['sumber', 'Baca lebih lanjut'],
    ];
    $('#main').innerHTML = /* HTML */ `<div class="lesson-layout scroll-reveal">
      <article class="lesson">
        ${crumbs([
          ['Jalur belajar', '#/roadmap'],
          [`Bab ${String(lesson.chapter).padStart(2, '0')}`, `#/bab/${lesson.chapter}`],
          [lesson.commands[0]],
        ])}
        <div class="eyebrow">
          BAB ${String(lesson.chapter).padStart(2, '0')} · ${esc(chapter.title)}
        </div>
        <h1>${title}</h1>
        <p class="lesson-intro">${inline(lesson.summary)}</p>
        <div class="meta-row">
          <span class="meta-level">${esc(lesson.level)}</span
          ><span class="meta-dot" aria-hidden="true"></span
          ><span>◷ ${lesson.minutes} menit baca & coba</span
          ><span class="meta-dot" aria-hidden="true"></span
          ><span
            >${lessons.filter((item) => item.chapter === lesson.chapter).length} materi dalam bab
            ini</span
          ><button
            class="bookmark-button ${bookmarks.has(lesson.id) ? 'saved' : ''}"
            id="bookmark"
            aria-pressed="${bookmarks.has(lesson.id)}"
          >
            ${bookmarkIcon}<span>${bookmarks.has(lesson.id) ? 'Tersimpan' : 'Simpan'}</span>
          </button>
        </div>
        <section id="situasi" class="scenario">
          <div class="scenario-icon">${cup}</div>
          <div>
            <div class="scenario-label">BAYANGKAN SITUASI INI</div>
            <h2>
              ${lesson.id === 'stash'
                ? 'Lagi asyik bikin fitur. Tiba-tiba, ada bug.'
                : 'Satu masalah dari proyek Kopi Kita.'}
            </h2>
            <p>${inline(lesson.scenario)}</p>
          </div>
        </section>
        <section id="visualisasi" class="lesson-section">
          <div class="section-kicker">01 / LIHAT DULU ALURNYA</div>
          <h2>
            ${lesson.visual === 'stash'
              ? 'Pekerjaanmu pindah ke mana?'
              : lesson.visual === 'staging'
                ? 'Dari file kerja ke snapshot.'
                : 'Gambaran besarnya.'}
          </h2>
          <p>
            ${lesson.visual === 'stash'
              ? 'Klik setiap langkah. Perhatikan file di meja kerja dan simpanan di laci stash.'
              : lesson.visual === 'staging'
                ? 'Perhatikan perbedaan file kerja, isi index, dan snapshot yang sudah direkam.'
                : 'Gunakan gambaran ini sambil membaca konsep dan contoh di bawah.'}
          </p>
          <div id="lesson-visual"></div>
        </section>
        <section id="konsep" class="lesson-section">
          <div class="section-kicker">02 / PAHAMI IDE DI BALIKNYA</div>
          <h2>
            ${lesson.id === 'stash'
              ? 'Anggap saja laci di meja kerjamu.'
              : 'Kenali konsepnya, bukan cuma sintaksnya.'}
          </h2>
          <p>${inline(lesson.concept)}</p>
          <div class="analogy">
            <div class="analogy-label">KALAU DI KEHIDUPAN SEHARI-HARI…</div>
            <p>${esc(lesson.analogy)}</p>
          </div>
        </section>
        <section id="langkah" class="lesson-section">
          <div class="section-kicker">03 / SEKARANG, COBA SENDIRI</div>
          <h2>Satu langkah pada satu waktu.</h2>
          <p>
            Gunakan repository latihan. Nama file dan branch mengikuti skenario; sesuaikan dengan
            keadaan awalmu. Baris output dan hash di komputermu dapat berbeda.
          </p>
          <ol class="step-list">
            ${lesson.steps
              .map(
                (step) =>
                  /* HTML */ `<li>
                    <h3>${esc(step.title)}</h3>
                    <p>${inline(step.explanation)}</p>
                    ${commandBlock(step.command)}
                  </li>`,
              )
              .join('')}
          </ol>
          <div class="notice">
            <span aria-hidden="true">✓</span>
            <p><strong>Keadaan yang ingin dicapai:</strong> ${esc(lesson.result)}</p>
          </div>
        </section>
        ${lesson.visual === 'stash'
          ? /* HTML */ `<section class="lesson-section">
              <h2>Apply atau pop? Bedanya di simpanannya.</h2>
              <table class="compare-table">
                <thead>
                  <tr>
                    <th>Command</th>
                    <th>Perubahan kembali?</th>
                    <th>Entri stash</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>stash apply</code></td>
                    <td>Ya, bila berhasil</td>
                    <td>Tetap ada</td>
                  </tr>
                  <tr>
                    <td><code>stash pop</code></td>
                    <td>Ya, bila berhasil</td>
                    <td>Dihapus setelah berhasil; tetap ada saat konflik</td>
                  </tr>
                  <tr>
                    <td><code>stash drop</code></td>
                    <td>Tidak diterapkan</td>
                    <td>Dihapus</td>
                  </tr>
                </tbody>
              </table>
            </section>`
          : ''}
        <section id="perhatian" class="lesson-section">
          <div class="section-kicker">04 / SEBELUM TERBURU-BURU</div>
          <h2>Yang sering bikin tersandung.</h2>
          <div class="notice">
            <span aria-hidden="true">↳</span>
            <p>${inline(lesson.pitfall)}</p>
          </div>
        </section>
        <section id="latihan" class="lesson-section">
          <div class="section-kicker">05 / SEKARANG GILIRANMU</div>
          <h2>Dari “oh, paham” ke “bisa pakai”.</h2>
          <p>${inline(lesson.practice)}</p>
          ${quizHTML(lesson)}<a
            class="text-button"
            href="#/playground?scenario=${lesson.visual === 'stash'
              ? 'stash'
              : lesson.visual === 'conflict'
                ? 'conflict'
                : 'staging'}"
            >Buka tempat latihan <span>↗</span></a
          >
        </section>
        <section id="sumber" class="lesson-section">
          <h3>Masih penasaran?</h3>
          <div class="lesson-sources">
            <a
              href="${firstSource === 'git'
                ? 'https://git-scm.com/docs/git'
                : 'https://git-scm.com/docs/git-' + esc(firstSource)}"
              target="_blank"
              rel="noopener noreferrer"
              >Manual resmi ${esc(lesson.commands[0])} ↗</a
            ><a href="https://git-scm.com/book/en/v2" target="_blank" rel="noopener noreferrer"
              >Buku Pro Git ↗</a
            ><a href="#/glosarium">Glosarium istilah ↗</a>
          </div>
        </section>
        <div class="lesson-complete">
          <button class="button" id="complete-lesson" aria-pressed="${completed.has(lesson.id)}">
            ${completed.has(lesson.id) ? '✓ Sudah dipahami' : 'Tandai sudah dipahami'}
            <span>✓</span></button
          ><span class="completion-hint">Bisa kamu ubah kapan saja.</span>
        </div>
        <nav class="lesson-pagination" aria-label="Materi lain">
          ${previous
            ? /* HTML */ `<a class="pagination-link" href="${href(previous.id)}"
                ><small>← SEBELUMNYA</small><span>${esc(previous.title)}</span></a
              >`
            : '<div></div>'}${next
            ? /* HTML */ `<a class="pagination-link next" href="${href(next.id)}"
                ><small>SELANJUTNYA →</small><span>${esc(next.title)}</span></a
              >`
            : /* HTML */ `<a class="pagination-link next" href="#/roadmap"
                ><small>PERJALANAN BERIKUTNYA →</small><span>Lihat peta belajarmu</span></a
              >`}
        </nav>
      </article>
      <aside class="toc" aria-label="Daftar isi halaman">
        <div class="toc-label">DI HALAMAN INI</div>
        <nav>
          ${toc
            .map(
              ([id, label], index) =>
                /* HTML */ `<a
                  class="${index === 0 ? 'current' : ''}"
                  href="${href(lesson.id)}"
                  data-scroll="${id}"
                  >${label}</a
                >`,
            )
            .join('')}
        </nav>
        <div class="toc-note">
          <span class="small-seed" aria-hidden="true">⌁</span
          ><strong>Nggak perlu hafal semuanya.</strong><br />Pahami alurnya. Command-nya bisa kamu
          cari lagi.
        </div>
      </aside>
    </div>`;
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

  function fileChip(path, description, status = 'M', stash = false) {
    return /* HTML */ `<div class="file-chip ${stash ? 'stash-chip' : ''}">
      <span class="file-icon" aria-hidden="true"></span
      ><span>${esc(path)}${description ? /* HTML */ `<small>${esc(description)}</small>` : ''}</span
      >${status ? /* HTML */ `<span class="file-status">${esc(status)}</span>` : ''}
    </div>`;
  }

  function renderVisual() {
    const host = $('#lesson-visual');
    if (!host || !currentLesson) return;
    const kind = currentLesson.visual;
    if (kind === 'stash') {
      let state = Sim.createState('lesson');
      if (miniStep >= 1) state = Sim.execute(state, 'git stash push -m "WIP diskon"').state;
      if (miniStep >= 2) state = Sim.execute(state, `git stash ${miniMode}`).state;
      const dirty = Sim.changed(Sim.head(state).files, state.working).length > 0;
      const commands = ['git status', 'git stash push -m "WIP diskon"', `git stash ${miniMode}`];
      const captions = [
        'Perubahan diskon masih di working tree. Belum ada entri stash.',
        'Perubahan tracked tersimpan. Working tree dan index kembali ke HEAD.',
        miniMode === 'pop'
          ? 'Perubahan kembali. Karena penerapan berhasil, entri stash dihapus.'
          : 'Perubahan kembali. Dengan apply, entri stash tetap ada untuk dipakai lagi.',
      ];
      host.innerHTML = /* HTML */ `<div class="visual-card">
          <div class="visual-header">
            <div>
              <h3>Satu pekerjaan, tiga keadaan.</h3>
              <p>Skenario tanpa konflik · satu file tracked yang berubah</p>
            </div>
            <span class="interactive-badge">INTERAKTIF</span>
          </div>
          <div class="sim-tabs" role="tablist" aria-label="Keadaan stash">
            ${['Kerjaan awal', 'Simpan dulu', 'Lanjutkan lagi']
              .map(
                (label, index) =>
                  /* HTML */ `<button
                    class="sim-tab ${miniStep === index ? 'active' : ''}"
                    data-sim-step="${index}"
                    role="tab"
                    aria-selected="${miniStep === index}"
                    aria-controls="stash-scene"
                    id="stash-tab-${index}"
                  >
                    <span>0${index + 1}</span>${label}
                  </button>`,
              )
              .join('')}
          </div>
          <div
            class="sim-scene"
            id="stash-scene"
            role="tabpanel"
            aria-labelledby="stash-tab-${miniStep}"
          >
            <div class="sim-columns">
              <div class="sim-zone">
                <div class="zone-heading"><span>Meja kerjamu</span><span>WORKING TREE</span></div>
                ${dirty
                  ? fileChip('diskon.js', 'Diskon 0 → 10 persen', 'M')
                  : '<div class="empty-zone"><div class="empty-icon">✓</div>Tidak ada perubahan tracked.<br/>Sesuai snapshot HEAD.</div>'}
              </div>
              <div class="sim-arrow ${miniStep === 1 ? 'active' : ''}" aria-hidden="true">
                ${miniStep === 2 ? '←' : '→'}
              </div>
              <div class="sim-zone">
                <div class="zone-heading"><span>Laci sementara</span><span>STASH</span></div>
                ${state.stashes.length
                  ? fileChip('WIP diskon', 'stash@{0} · fitur-diskon', '', true)
                  : '<div class="empty-zone"><div class="empty-icon">⊟</div>Belum ada simpanan.<br/>Lacinya masih kosong.</div>'}
              </div>
            </div>
            <div class="sim-bottom-info">
              <span class="branch-pill">⑂ fitur-diskon</span
              ><span>Commit HEAD tetap · ${state.stashes.length} entri stash</span>
            </div>
          </div>
          <div class="sim-terminal">
            <div class="terminal-command">
              <span class="prompt">$</span><code>${esc(commands[miniStep])}</code>
            </div>
            <button class="copy-button" data-copy="${esc(commands[miniStep])}">Salin ⧉</button>
          </div>
          <div class="sim-caption" aria-live="polite">
            <span class="caption-number">${miniStep + 1}</span><span>${captions[miniStep]}</span>
          </div>
        </div>
        <div class="sim-controls">
          <button class="text-button" data-sim-reset>↻ Ulangi dari awal</button>${miniStep === 2
            ? /* HTML */ `<button class="button secondary small" data-sim-mode>
                Coba ${miniMode === 'pop' ? 'apply' : 'pop'} sebagai pembanding ↔
              </button>`
            : /* HTML */ `<button class="button small" data-sim-next>
                ${miniStep === 0 ? 'Simpan pekerjaan' : 'Kembalikan pekerjaan'} <span>→</span>
              </button>`}
        </div>`;
    } else if (kind === 'staging') {
      const commands = ['git status', 'git add menu.json', 'git commit -m "Perbaiki harga menu"'];
      const notes = [
        'Dua file berubah di working tree. Index dan HEAD belum berubah.',
        'Hanya menu.json disalin ke index. Perubahan diskon.js masih unstaged.',
        'Snapshot baru memuat harga menu. Pekerjaan diskon.js belum ikut di-commit.',
      ];
      host.innerHTML = /* HTML */ `<div class="visual-card">
          <div class="visual-header">
            <div>
              <h3>Commit berisi apa yang kamu pilih.</h3>
              <p>Klik tahap untuk melihat isi tiga area.</p>
            </div>
            <span class="interactive-badge">INTERAKTIF</span>
          </div>
          <div class="sim-tabs" role="group" aria-label="Tahap staging">
            ${['Edit file', 'Pilih menu', 'Rekam commit']
              .map(
                (label, index) =>
                  /* HTML */ `<button
                    class="sim-tab ${miniStep === index ? 'active' : ''}"
                    data-sim-step="${index}"
                    aria-pressed="${miniStep === index}"
                  >
                    <span>0${index + 1}</span>${label}
                  </button>`,
              )
              .join('')}
          </div>
          <div class="snapshot-visual" style="margin:0 16px 20px">
            <div class="snapshot-box">
              <strong>Working tree</strong>
              <p>menu: 20.000<br />diskon: 10%</p>
              <div class="snapshot-label">FILE YANG DIEDIT</div>
            </div>
            <div class="snapshot-arrow">→</div>
            <div class="snapshot-box">
              <strong>Index</strong>
              <p>menu: ${miniStep >= 1 ? '20.000' : '18.000'}<br />diskon: 0%</p>
              <div class="snapshot-label">CALON SNAPSHOT</div>
            </div>
            <div class="snapshot-arrow">→</div>
            <div class="snapshot-box">
              <strong>HEAD</strong>
              <p>menu: ${miniStep === 2 ? '20.000' : '18.000'}<br />diskon: 0%</p>
              <div class="snapshot-label">SUDAH DIREKAM</div>
            </div>
          </div>
          <div class="sim-terminal">
            <div class="terminal-command">
              <span class="prompt">$</span><code>${esc(commands[miniStep])}</code>
            </div>
            <button class="copy-button" data-copy="${esc(commands[miniStep])}">Salin ⧉</button>
          </div>
          <div class="sim-caption" aria-live="polite">
            <span class="caption-number">${miniStep + 1}</span><span>${notes[miniStep]}</span>
          </div>
        </div>
        <div class="sim-controls">
          <button class="text-button" data-sim-reset>↻ Ulangi dari awal</button
          ><button class="button small" data-sim-next ${miniStep === 2 ? 'disabled' : ''}>
            ${miniStep === 0
              ? 'Pilih perubahan'
              : miniStep === 1
                ? 'Buat commit'
                : 'Snapshot sudah dibuat'}
            →
          </button>
        </div>`;
    } else if (kind === 'conflict') {
      host.innerHTML = /* HTML */ `<div class="visual-card">
        <div class="visual-header">
          <div>
            <h3>Dua usulan. Satu keputusan akhir.</h3>
            <p>Contoh konflik isi; pilihan benar bergantung kesepakatan tim.</p>
          </div>
          <span class="interactive-badge">COBA SENDIRI</span>
        </div>
        <div style="padding:0 22px 20px">
          <div class="output-block" id="conflict-preview">
            <code
              >&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD<br />const harga = 20000;<br />=======<br />const
              harga = 22000;<br />&gt;&gt;&gt;&gt;&gt;&gt;&gt; fitur-menu</code
            >
          </div>
          <div class="sim-controls">
            <button class="button secondary small" data-conflict-choice="20000">
              Pilih Rp20.000</button
            ><button class="button secondary small" data-conflict-choice="22000">
              Pilih Rp22.000
            </button>
          </div>
          <p id="conflict-note" class="quiz-feedback" aria-live="polite">
            Baca maksud perubahan sebelum memilih hasil.
          </p>
        </div>
      </div>`;
    } else if (kind === 'remote') {
      host.innerHTML = /* HTML */ `<div class="visual-card">
        <div class="visual-header">
          <div>
            <h3>Ambil, pahami, lalu integrasikan.</h3>
            <p>Contoh main lokal tertinggal satu commit dari server.</p>
          </div>
        </div>
        <div class="snapshot-visual" style="margin:0 16px 20px">
          <div class="snapshot-box">
            <strong>Server</strong>
            <p>main → B</p>
            <div class="snapshot-label">REPO REMOTE</div>
          </div>
          <div class="snapshot-arrow">→</div>
          <div class="snapshot-box">
            <strong>Catatan lokal</strong>
            <p>origin/main → B</p>
            <div class="snapshot-label">SETELAH FETCH</div>
          </div>
          <div class="snapshot-arrow">→</div>
          <div class="snapshot-box">
            <strong>Branch lokal</strong>
            <p>main: A → B</p>
            <div class="snapshot-label">SETELAH INTEGRASI FF</div>
          </div>
        </div>
        <div class="sim-caption">
          Fetch memperbarui catatan remote. Integrasi memperbarui jalur kerja lokal. Push mengirim
          perubahan menuju remote.
        </div>
      </div>`;
    } else if (kind === 'graph') {
      host.innerHTML = /* HTML */ `<div class="visual-card">
        <div class="visual-header">
          <div>
            <h3>Commit menyambung lewat parent.</h3>
            <p>Contoh percabangan dan merge; garis dibaca dari riwayat lama ke baru.</p>
          </div>
        </div>
        <div class="repo-graph" style="border:0;background:transparent;margin:0">${graphSVG()}</div>
        <div class="sim-caption">
          Label branch menunjuk commit. Commit baru pada branch aktif menggeser labelnya; riwayat
          sebelumnya tetap terhubung.
        </div>
      </div>`;
    } else if (kind === 'objects') {
      host.innerHTML = /* HTML */ `<div class="snapshot-visual">
        <div class="snapshot-box">
          <strong>Branch / HEAD</strong>
          <p>Referensi bernama<br />menunjuk commit</p>
        </div>
        <div class="snapshot-arrow">→</div>
        <div class="snapshot-box">
          <strong>Commit</strong>
          <p>Tree + parent<br />+ metadata</p>
        </div>
        <div class="snapshot-arrow">→</div>
        <div class="snapshot-box">
          <strong>Tree → blob</strong>
          <p>Susunan path<br />dan isi file</p>
        </div>
      </div>`;
    } else {
      host.innerHTML = /* HTML */ `<div class="snapshot-visual">
        <div class="snapshot-box">
          <strong>Working tree</strong>
          <p>File yang sedang<br />kamu edit</p>
          <div class="snapshot-label">KERJAKAN</div>
        </div>
        <div class="snapshot-arrow">→</div>
        <div class="snapshot-box">
          <strong>Index</strong>
          <p>Susunan snapshot<br />commit berikutnya</p>
          <div class="snapshot-label">SIAPKAN</div>
        </div>
        <div class="snapshot-arrow">→</div>
        <div class="snapshot-box">
          <strong>Commit / HEAD</strong>
          <p>Snapshot yang<br />sudah direkam</p>
          <div class="snapshot-label">REKAM</div>
        </div>
      </div>`;
    }
  }

  function graphSVG() {
    return /* HTML */ `<svg
      viewBox="0 0 590 140"
      role="img"
      aria-label="A menuju B, bercabang ke C dan D, lalu digabung pada E; main dan HEAD menunjuk E"
    >
      <path d="M45 90H535" stroke="var(--graph-main)" stroke-width="2" fill="none" />
      <path
        d="M155 90C200 90 188 38 240 38H350C407 38 409 90 455 90"
        stroke="var(--graph-feature)"
        stroke-width="2"
        fill="none"
      />
      <g fill="var(--surface)" stroke="var(--graph-main)" stroke-width="2">
        <circle cx="45" cy="90" r="7" />
        <circle cx="155" cy="90" r="7" />
        <circle cx="340" cy="90" r="7" />
        <circle cx="455" cy="90" r="7" />
      </g>
      <g fill="var(--surface)" stroke="var(--graph-feature)" stroke-width="2">
        <circle cx="245" cy="38" r="7" />
        <circle cx="350" cy="38" r="7" />
      </g>
      <g fill="var(--muted)" font-size="13" font-family="monospace" text-anchor="middle">
        <text x="45" y="116">A</text>
        <text x="155" y="116">B</text>
        <text x="245" y="20">C</text>
        <text x="340" y="116">D</text>
        <text x="455" y="116">E</text>
        <text x="350" y="20">fitur</text>
        <text x="500" y="70">main / HEAD</text>
      </g>
    </svg>`;
  }

  function chapterCard(chapter) {
    const items = lessons.filter((lesson) => lesson.chapter === chapter.id);
    return /* HTML */ `<article class="chapter-card">
      <div class="chapter-card-number">
        <span>BAB ${String(chapter.id).padStart(2, '0')}</span><span>${items.length} MATERI</span>
      </div>
      <h2>${esc(chapter.title)}</h2>
      <p>${esc(chapter.description)}</p>
      <ul>
        ${items
          .map(
            (lesson) =>
              /* HTML */ `<li>
                <a href="${href(lesson.id)}"
                  ><span>${esc(lesson.title)}</span
                  ><span class="lesson-check">${completed.has(lesson.id) ? '✓' : '↗'}</span></a
                >
              </li>`,
          )
          .join('')}
      </ul>
    </article>`;
  }

  function renderRoadmap(id) {
    const chosen = id ? chapters.filter((chapter) => chapter.id === Number(id)) : chapters;
    if (!chosen.length) {
      renderNotFound();
      return;
    }
    $('#main').innerHTML = /* HTML */ `<div class="page-container scroll-reveal">
      ${crumbs([['Peta perjalanan']])}
      <div class="eyebrow">SATU LANGKAH PADA SATU WAKTU</div>
      <h1 class="page-title">${id ? esc(chosen[0].title) : 'Dari penasaran, jadi paham.'}</h1>
      <p class="page-intro">
        ${id
          ? esc(chosen[0].description)
          : `${chapters.length} bab, ${lessons.length} materi. Mulai dari fondasi, berlatih lewat kasus, lalu menyelam lebih dalam. Pilih titik awal yang sesuai denganmu.`}
      </p>
      <div class="roadmap-grid">${chosen.map(chapterCard).join('')}</div>
      ${bookmarks.size
        ? /* HTML */ `<div class="section-heading"><h2>Yang kamu simpan.</h2></div>
            <div class="reference-grid">
              ${lessons
                .filter((lesson) => bookmarks.has(lesson.id))
                .map(
                  (lesson) =>
                    /* HTML */ `<a class="reference-card" href="${href(lesson.id)}"
                      ><code>${esc(lesson.commands[0])}</code>
                      <p>${esc(lesson.title)}</p>
                      <span class="text-button">Buka materi →</span></a
                    >`,
                )
                .join('')}
            </div>`
        : ''}
    </div>`;
  }

  function renderReference() {
    $('#main').innerHTML = /* HTML */ `<div class="page-container scroll-reveal">
      ${crumbs([['Referensi command']])}
      <div class="eyebrow">NGGAK HARUS DIHAFAL</div>
      <h1 class="page-title">Ingat tujuannya.<br />Cari command-nya.</h1>
      <p class="page-intro">
        Temukan command berdasarkan nama atau situasi. Setiap referensi terhubung ke penjelasan,
        kasus, dan latihan.
      </p>
      <label class="sr-only" for="reference-filter">Cari referensi command</label
      ><input
        class="filter-input"
        id="reference-filter"
        placeholder="Cari stash, commit, riwayat…"
        type="search"
      /><a class="text-button" href="#/glosarium">Buka glosarium istilah ↗</a>
      <div class="reference-grid" id="reference-results"></div>
      <p class="page-intro" style="font-size:14.5px;margin-top:25px">
        Butuh opsi yang lebih khusus?
        <a
          href="https://git-scm.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          style="color:var(--accent)"
          >Buka indeks seluruh command resmi Git ↗</a
        >
      </p>
    </div>`;

    function filter() {
      const term = $('#reference-filter').value.toLowerCase();
      const results = lessons.filter((lesson) =>
        [lesson.title, lesson.summary, lesson.scenario, ...lesson.commands]
          .join(' ')
          .toLowerCase()
          .includes(term),
      );
      $('#reference-results').innerHTML = results.length
        ? results
            .map(
              (lesson) =>
                /* HTML */ `<article class="reference-card">
                  <code>${esc(lesson.commands[0])}</code>
                  <p>${esc(lesson.summary)}</p>
                  <a href="${href(lesson.id)}">Baca kasus & penjelasan →</a>
                </article>`,
            )
            .join('')
        : '<div class="results-empty">Belum ada hasil. Coba nama command atau kata yang lebih pendek.</div>';
    }

    $('#reference-filter').addEventListener('input', filter);
    filter();
  }

  function renderProblems() {
    $('#main').innerHTML = /* HTML */ `<div class="page-container scroll-reveal">
      ${crumbs([['Cari jalan keluar']])}
      <div class="eyebrow">MULAI DARI SITUASIMU</div>
      <h1 class="page-title">Lagi ketemu masalah apa?</h1>
      <p class="page-intro">
        Mulai dari keadaan yang kamu hadapi. Baca kondisi awal dan dampak command sebelum
        menerapkannya di repository sendiri.
      </p>
      <div class="reference-grid">
        ${problems
          .map(([problem, id]) => {
            const lesson = lessons.find((lesson) => lesson.id === id);
            return /* HTML */ `<a class="reference-card" href="${href(id)}"
              ><h3 style="font-size:17px;line-height:1.7">${esc(problem)}</h3>
              <p>${esc(lesson.summary)}</p>
              <span class="text-button">Cari jalan keluarnya →</span></a
            >`;
          })
          .join('')}
      </div>
    </div>`;
  }

  function renderGlossary() {
    $('#main').innerHTML = /* HTML */ `<div class="page-container scroll-reveal">
      ${crumbs([['Referensi', '#/referensi'], ['Glosarium']])}
      <div class="eyebrow">ISTILAHNYA BOLEH ASING. IDENYA JANGAN.</div>
      <h1 class="page-title">Biar kita ngomong<br />hal yang sama.</h1>
      <p class="page-intro">
        Penjelasan singkat untuk istilah yang sering kamu temui. Buka bab terkait untuk konteks dan
        latihan.
      </p>
      <label class="sr-only" for="glossary-filter">Cari istilah</label
      ><input
        id="glossary-filter"
        class="filter-input"
        type="search"
        placeholder="Cari HEAD, upstream, index…"
      />
      <dl class="glossary-list" id="glossary-results"></dl>
    </div>`;

    function filter() {
      const term = $('#glossary-filter').value.toLowerCase();
      const results = glossary.filter((item) => item.join(' ').toLowerCase().includes(term));
      $('#glossary-results').innerHTML = results.length
        ? results
            .map(
              ([term, definition]) =>
                /* HTML */ `<div class="glossary-item">
                  <dt>${esc(term)}</dt>
                  <dd>${esc(definition)}</dd>
                </div>`,
            )
            .join('')
        : '<div class="results-empty">Istilah belum ditemukan.</div>';
    }

    $('#glossary-filter').addEventListener('input', filter);
    filter();
  }

  const scenarioInfo = {
    stash: {
      title: 'Simpan pekerjaan diskon, termasuk file baru.',
      description:
        'diskon.js berubah dan catatan.txt masih untracked. Simpan keduanya, pastikan pekerjaan bersih, lalu pulihkan. Petunjuk: perhatikan opsi -u.',
      suggestions: [
        'git status',
        'git diff',
        'git stash push -u -m "WIP diskon"',
        'git stash list',
        'git stash pop',
      ],
      isComplete: (state) =>
        state.stashes.length === 0 &&
        state.working['diskon.js'] === 'const diskon = 10;' &&
        state.working['catatan.txt'] === 'Ide: diskon akhir pekan',
    },
    staging: {
      title: 'Commit koreksi menu, sisakan pekerjaan diskon.',
      description:
        'menu.json dan diskon.js sama-sama berubah. Buat commit untuk menu saja. Perubahan diskon harus tetap belum di-commit.',
      suggestions: [
        'git status',
        'git add menu.json',
        'git diff --staged',
        'git commit -m "Perbaiki harga menu"',
        'git log --oneline',
      ],
      isComplete: (state) =>
        Sim.head(state).files['menu.json'] === '{"kopiSusu": 20000}' &&
        Sim.head(state).files['diskon.js'] === 'const diskon = 0;' &&
        state.working['diskon.js'] === 'const diskon = 10;',
    },
    conflict: {
      title: 'Pulihkan stash yang bentrok tanpa membuang simpanannya.',
      description:
        'Repo sudah memiliki diskon 15%, sedangkan stash menyimpan 10%. Coba pop, selesaikan file menjadi 10%, lalu add dan commit. Periksa bahwa stash tetap ada setelah konflik.',
      suggestions: [
        'git stash list',
        'git stash pop',
        'git status',
        'git add diskon.js',
        'git commit -m "Selesaikan diskon"',
      ],
      isComplete: (state) =>
        !state.conflicts.length &&
        Sim.head(state).files['diskon.js'] === 'const diskon = 10;' &&
        state.stashes.length === 1,
    },
  };

  function renderPlayground(scenario) {
    sandboxScenario = Object.hasOwn(scenarioInfo, scenario) ? scenario : 'stash';
    sandbox = Sim.createState(sandboxScenario);
    history = [];
    const info = scenarioInfo[sandboxScenario];
    $('#main').innerHTML = /* HTML */ `<div class="page-container scroll-reveal">
      ${crumbs([['Playground']])}
      <div class="eyebrow">TEMPAT AMAN UNTUK PENASARAN</div>
      <h1 class="page-title">Coba dulu.<br />Lihat apa yang berubah.</h1>
      <p class="page-intro">
        Terminal latihan dengan repository tiruan di browser. Tidak mengakses file atau Git di
        komputermu.
      </p>
      <label for="scenario-select" style="font-size:13px;color:var(--muted)">PILIH SKENARIO</label
      ><select id="scenario-select" class="practice-select">
        <option value="stash" ${sandboxScenario === 'stash' ? 'selected' : ''}>
          01 · Simpan kerjaan dengan stash
        </option>
        <option value="staging" ${sandboxScenario === 'staging' ? 'selected' : ''}>
          02 · Pilih perubahan untuk commit
        </option>
        <option value="conflict" ${sandboxScenario === 'conflict' ? 'selected' : ''}>
          03 · Konflik saat memulihkan stash
        </option>
      </select>
      <div class="practice-instructions">
        <h2>${esc(info.title)}</h2>
        <p>${esc(info.description)}</p>
        <div id="practice-result" class="quiz-feedback" role="status"></div>
        <button class="button secondary small" id="check-practice">Periksa hasil latihan ✓</button>
      </div>
      <div class="playground-grid">
        <div>
          <div class="playground-terminal">
            <div class="terminal-titlebar">
              <span class="terminal-light"></span><span class="terminal-light"></span
              ><span class="terminal-light"></span><span>kopi-kita · simulator</span>
            </div>
            <div
              class="terminal-history"
              id="terminal-history"
              role="log"
              aria-label="Riwayat terminal"
            ></div>
            <form class="terminal-form" id="terminal-form">
              <label for="terminal-input">$</label
              ><input
                id="terminal-input"
                autocomplete="off"
                spellcheck="false"
                placeholder="Ketik git status…"
                aria-label="Command Git"
              /><button type="submit">Jalankan ↵</button>
            </form>
          </div>
          <div class="command-suggestions">
            ${info.suggestions
              .map(
                (command) =>
                  /* HTML */ `<button class="suggestion" data-suggest="${esc(command)}">
                    ${esc(command)}
                  </button>`,
              )
              .join('')}
          </div>
          <button class="text-button" id="reset-playground">↻ Ulangi skenario</button>
        </div>
        <aside class="playground-side">
          <div class="sandbox-state" id="sandbox-files"></div>
          <div class="sandbox-state" id="sandbox-stashes"></div>
        </aside>
      </div>
      <details class="supported-commands">
        <summary>Command yang didukung & batas simulasi</summary>
        <ul>
          <li>
            status; diff dan diff --staged/--cached; add FILE atau .; commit -m "pesan"; log
            --oneline; switch BRANCH dan switch -c BRANCH.
          </li>
          <li>
            stash push [-u] [-m "pesan"], list, show [-p] REF, apply/pop [--index] REF, dan drop
            REF. Referensi dapat berupa "stash@{0}" atau angka.
          </li>
          <li>
            Simulator memakai file teks satu baris untuk latihan ini. Merge tiga arah yang kompleks,
            filesystem, remote, rebase, ignored files, shell commands, serta sebagian opsi Git belum
            dimodelkan.
          </li>
          <li>
            Apply/pop dimulai dari index dan working tree tracked yang bersih. Input yang belum
            didukung dijelaskan, bukan diteruskan ke shell. Identitas commit dan output adalah
            ilustrasi.
          </li>
          <li>
            Latihan terminal Git sungguhan tersedia pada setiap materi. Ketik help untuk ringkasan
            dukungan.
          </li>
        </ul>
      </details>
    </div>`;
    appendHistory('Selamat datang di Kopi Kita. Ketik git status atau klik command di bawah.');
    refreshSandbox();
    $('#terminal-form').addEventListener('submit', (event) => {
      event.preventDefault();
      runSandbox($('#terminal-input').value);
      $('#terminal-input').value = '';
    });
    $('#scenario-select').addEventListener('change', (event) => {
      location.hash = `#/playground?scenario=${event.target.value}`;
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
    $('#main').innerHTML = /* HTML */ `<div class="page-container">
      ${crumbs([['Halaman tidak ditemukan']])}
      <div class="eyebrow">JALURNYA BELUM KETEMU</div>
      <h1 class="page-title">Kembali ke peta dulu?</h1>
      <p class="page-intro">
        Materi pada alamat ini tidak ditemukan. Pilih pelajaran dari peta atau cari berdasarkan
        masalahmu.
      </p>
      <a class="button" href="#/roadmap">Buka peta belajar →</a>
    </div>`;
  }

  function route() {
    const fragment = location.hash.slice(1) || '/';
    const [pathname, query = ''] = fragment.split('?');
    const parts = pathname.split('/').filter(Boolean);
    currentLesson = null;
    $$('.topnav a').forEach((link) =>
      link.classList.toggle(
        'active',
        link.dataset.nav ===
          (parts[0] === 'playground'
            ? 'playground'
            : parts[0] === 'latihan'
              ? 'latihan'
              : ['referensi', 'glosarium', 'masalah'].includes(parts[0])
                ? 'referensi'
                : 'belajar'),
      ),
    );
    if (!parts.length) renderHome();
    else if (parts[0] === 'belajar') {
      const lesson = lessons.find((lesson) => lesson.id === parts[1]);
      if (lesson) renderLesson(lesson);
      else renderNotFound();
    } else if (parts[0] === 'latihan') {
      if (!window.GitGuidesLearning.renderLabs(parts[1])) renderNotFound();
    } else if (parts[0] === 'roadmap') renderRoadmap();
    else if (parts[0] === 'bab') renderRoadmap(parts[1]);
    else if (parts[0] === 'referensi') renderReference();
    else if (parts[0] === 'masalah') renderProblems();
    else if (parts[0] === 'glosarium') renderGlossary();
    else if (parts[0] === 'playground')
      renderPlayground(new URLSearchParams(query).get('scenario') || 'stash');
    else renderNotFound();
    renderSidebar();
    closeMenu();
    document.title = currentLesson
      ? `${currentLesson.title} — Git Guides`
      : 'Git Guides — Pahami alurnya. Kuasai Git-nya.';
    window.scrollTo({ top: 0, behavior: 'instant' });
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
  window.addEventListener('hashchange', route);
  route();
})();
