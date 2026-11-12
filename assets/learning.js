(function (root) {
  'use strict';
  const data = root.GitGuidesContent;
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  const href = (id) => `#/belajar/${id}`;
  const download = /* HTML */ `<a
    class="button"
    href="./assets/downloads/kopi-kita-labs.zip"
    download
    >Unduh paket latihan <span aria-hidden="true">↓</span></a
  >`;
  let currentFlow = null,
    flowStep = 0;

  function commandBlock(command) {
    return /* HTML */ `<div class="command-block">
      <pre><code>${esc(command)}</code></pre>
      <button class="copy-button" data-copy="${esc(command)}" aria-label="Salin command">
        Salin ⧉
      </button>
    </div>`;
  }

  function enhanceLesson(lesson) {
    const before = document.createElement('section');
    before.id = 'persiapan';
    before.className = 'lesson-section preparation-panel';
    before.innerHTML = /* HTML */ `<div class="section-kicker">SEBELUM MULAI</div>
      <h2>Pastikan titik awalnya jelas.</h2>
      <p>${esc(lesson.initialState)}</p>
      <details class="lesson-objectives">
        <summary>Yang akan kamu pahami</summary>
        <ul>
          ${lesson.objectives.map((goal) => /* HTML */ `<li>${esc(goal)}</li>`).join('')}
        </ul>
      </details>
      ${lesson.prerequisites.length
        ? /* HTML */ `<div class="prerequisites">
            <span>Bekal sebelumnya:</span>${lesson.prerequisites
              .map((id) => {
                const item = data.lessons.find((item) => item.id === id);
                return /* HTML */ `<a href="${href(id)}">${esc(item.title)} ↗</a>`;
              })
              .join('')}
          </div>`
        : ''}`;
    document.querySelector('#visualisasi').before(before);
    const verification = document.createElement('div');
    verification.className = 'verification-panel';
    verification.innerHTML = /* HTML */ `<h3>Periksa hasilnya, jangan cuma pesan suksesnya.</h3>
      ${commandBlock(lesson.verification.command)}
      <p>${esc(lesson.verification.explanation)}</p>`;
    document.querySelector('#langkah').append(verification);
    const practice = document.querySelector('#latihan'),
      lab = data.labs[lesson.lab];
    const panel = document.createElement('div');
    panel.className = 'terminal-lab-panel';
    panel.dataset.lab = lesson.lab;
    panel.innerHTML = /* HTML */ `<div class="quiz-eyebrow">
        LATIHAN PENDAMPING DI TERMINAL ASLI
      </div>
      <h3>${esc(lab.title)}</h3>
      <p>${esc(lab.goal)}</p>
      <p class="lab-context">
        Latihan ini punya kondisi awal sendiri. Mulai folder baru lewat generator; jangan
        menganggapnya lanjutan otomatis dari seluruh contoh pada halaman.
      </p>
      ${commandBlock(`node git-lab.cjs start ${lesson.lab}`)}<a
        class="text-button"
        href="#/latihan/${lesson.lab}"
        >Persiapan, unduhan, dan cara memeriksa →</a
      >
      <details class="exercise-hints">
        <summary>Butuh petunjuk?</summary>
        <ol>
          ${lab.hints.map((hint) => /* HTML */ `<li>${esc(hint)}</li>`).join('')}
        </ol>
      </details>
      <details class="exercise-solution">
        <summary>Lihat pembahasan latihan pendamping</summary>
        ${commandBlock(lab.solution)}
        <p>${esc(lab.explanation)}</p>
      </details>`;
    practice.querySelector('.quiz-card').before(panel);
    // Do not send every advanced subject to the unrelated staging simulator.
    const browserLink = practice.querySelector('a[href^="#/playground"]');
    if (
      browserLink &&
      ![
        'stash',
        'stash-untracked',
        'apply-pop',
        'stash-konflik',
        'staging',
        'status-singkat',
        'partial-staging',
        'commit-atomik',
      ].includes(lesson.id)
    )
      browserLink.remove();
    const sources = document.querySelector('.lesson-sources');
    sources.innerHTML =
      lesson.sources
        .map(
          (source) =>
            /* HTML */ `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"
              >${esc(source.title)} ↗</a
            >`,
        )
        .join('') +
      /* HTML */ `<a href="https://git-scm.com/book/en/v2" target="_blank" rel="noopener noreferrer"
          >Pro Git ↗</a
        ><a href="#/glosarium">Glosarium ↗</a>`;
    const toc = document.querySelector('.toc nav');
    if (toc) {
      const link = document.createElement('a');
      link.href = href(lesson.id);
      link.dataset.scroll = 'persiapan';
      link.textContent = 'Sebelum mulai';
      toc.children[0].after(link);
    }
    const flow = root.GitGuidesVisuals.forLesson(lesson);
    currentFlow = flow;
    flowStep = 0;
    if (flow) renderFlow();
    if (lesson.visual === 'conflict') renderConflict(lesson);
  }

  function renderConflict(lesson) {
    const stash = lesson.id === 'stash-konflik',
      values = stash ? [0, 15, 10] : [18000, 20000, 22000];
    const line = (value) => (stash ? `const diskon = ${value};` : `{"kopiSusu":${value}}`);
    document.querySelector('#lesson-visual').innerHTML = /* HTML */ `<div class="visual-card">
      <div class="visual-header">
        <div>
          <h3>Tiga versi membantu menjelaskan benturan.</h3>
          <p>Base adalah titik sebelum kedua perubahan. Hasil akhir tetap keputusanmu.</p>
        </div>
        <span class="interactive-badge">INTERAKTIF</span>
      </div>
      <div class="conflict-versions">
        ${['Dasar bersama', 'HEAD saat ini', stash ? 'Simpanan stash' : 'Usulan fitur']
          .map(
            (label, index) =>
              /* HTML */ `<section>
                <strong>${label}</strong><code>${esc(line(values[index]))}</code>
              </section>`,
          )
          .join('')}
      </div>
      <div class="conflict-editor">
        <pre id="conflict-preview">
${esc(
            `<<<<<<< ${stash ? 'Updated upstream' : 'HEAD'}\n${line(values[1])}\n=======\n${line(values[2])}\n>>>>>>> ${stash ? 'Stashed changes' : 'fitur-menu'}`,
          )}</pre
        >
        <div class="sim-controls">
          ${values
            .slice(1)
            .map(
              (value) =>
                /* HTML */ `<button
                  class="button secondary small"
                  data-resolve-value="${esc(line(value))}"
                >
                  Pilih ${value}
                </button>`,
            )
            .join('')}
        </div>
        <p id="conflict-note" class="quiz-feedback" aria-live="polite">
          Memilih nilai hanya mengedit ilustrasi ini. Di repo nyata, periksa logika, hapus marker,
          lalu add file yang sudah selesai.
        </p>
      </div>
    </div>`;
  }

  function graphHTML(graph) {
    const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
    const edges = graph.nodes
      .flatMap((node) =>
        node.parents.map((parent) => {
          const previous = nodes.get(parent);
          return /* HTML */ `<path
            d="M${previous.x} ${previous.y} C${(previous.x + node.x) /
            2} ${previous.y},${(previous.x + node.x) / 2} ${node.y},${node.x} ${node.y}"
            fill="none"
            stroke="${node.retired ? 'var(--line)' : 'var(--graph-main)'}"
            stroke-width="2"
            ${node.retired ? 'stroke-dasharray="5 4"' : ''}
          />`;
        }),
      )
      .join('');
    return /* HTML */ `<div class="flow-graph">
        <svg
          viewBox="0 0 680 245"
          role="img"
          aria-label="${esc(
            graph.refs.map((ref) => ref.name + ' menunjuk ' + ref.node).join('; '),
          )}"
        >
          ${edges}${graph.nodes
            .map(
              (node) =>
                /* HTML */ `<g ${node.retired ? 'opacity=".45"' : ''}
                  ><circle
                    cx="${node.x}"
                    cy="${node.y}"
                    r="12"
                    fill="var(--surface)"
                    stroke="${node.retired ? 'var(--muted)' : 'var(--accent)'}"
                    stroke-width="2"
                    ${node.retired ? 'stroke-dasharray="3 2"' : ''}
                  /><text
                    x="${node.x}"
                    y="${node.y - 24}"
                    text-anchor="middle"
                    fill="var(--ink)"
                    font-size="17"
                    font-family="monospace"
                    >${esc(node.id)}</text
                  ></g
                >`,
            )
            .join('')}
        </svg>
      </div>
      <div class="flow-refs">
        ${graph.refs
          .map(
            (ref) =>
              /* HTML */ `<span class="branch-pill">${esc(ref.name)} → ${esc(ref.node)}</span>`,
          )
          .join('')}
      </div>`;
  }

  function renderFlow() {
    const scenario = root.GitGuidesVisuals.scenarios[currentFlow],
      frame = scenario.frames[flowStep],
      host = document.querySelector('#lesson-visual');
    host.innerHTML = /* HTML */ `<div class="visual-card flow-card" data-flow="${currentFlow}">
        <div class="visual-header">
          <div>
            <h3>${esc(scenario.title)}</h3>
            <p>${esc(scenario.description)}</p>
          </div>
          <span class="interactive-badge">INTERAKTIF</span>
        </div>
        <div class="flow-tabs" role="group" aria-label="Tahap ilustrasi">
          ${scenario.frames
            .map(
              (frame, index) =>
                /* HTML */ `<button
                  class="sim-tab ${index === flowStep ? 'active' : ''}"
                  data-flow-step="${index}"
                  aria-pressed="${index === flowStep}"
                >
                  <span>${String(index + 1).padStart(2, '0')}</span>${esc(frame.title)}
                </button>`,
            )
            .join('')}
        </div>
        <div class="flow-stage">
          ${frame.graph
            ? graphHTML(frame.graph)
            : frame.repos
              ? /* HTML */ `<div class="flow-repositories">
                  ${frame.repos
                    .map(
                      (repo) =>
                        /* HTML */ `<section>
                          <h4>${esc(repo.title)}</h4>
                          ${graphHTML(repo)}
                        </section>`,
                    )
                    .join('')}
                </div>`
              : /* HTML */ `<div class="flow-areas">
                  ${frame.areas
                    .map(
                      ([title, value]) =>
                        /* HTML */ `<div class="snapshot-box">
                          <strong>${esc(title)}</strong>
                          <p>${esc(value)}</p>
                        </div>`,
                    )
                    .join('')}
                </div>`}
        </div>
        <div class="sim-terminal">
          <div class="terminal-command">
            <span class="prompt">$</span><code>${esc(frame.command).replace(/\n/g, '<br/>')}</code>
          </div>
          <button class="copy-button" data-copy="${esc(frame.command)}">Salin ⧉</button>
        </div>
        <div class="sim-caption" aria-live="polite">
          <span class="caption-number">${flowStep + 1}</span><span>${esc(frame.explanation)}</span>
        </div>
      </div>
      <div class="sim-controls">
        <button class="text-button" data-flow-step="0">↻ Ke keadaan awal</button
        ><button
          class="button small"
          data-flow-step="${flowStep + 1}"
          ${flowStep === scenario.frames.length - 1 ? 'disabled' : ''}
        >
          ${flowStep === scenario.frames.length - 1 ? 'Akhir ilustrasi' : 'Langkah berikutnya'} →
        </button>
      </div>
      <p class="flow-note">
        Huruf adalah identitas commit ilustrasi. Garis menghubungkan commit dengan parent; posisi
        kiri ke kanan menunjukkan urutan. Gunakan latihan terminal untuk melihat object ID yang
        sebenarnya.
      </p>`;
  }

  function labCard(id, lab) {
    return /* HTML */ `<article class="reference-card">
      <div class="quiz-eyebrow">TERMINAL ASLI · ${esc(id)}</div>
      <h3>${esc(lab.title)}</h3>
      <p>${esc(lab.goal)}</p>
      <a href="#/latihan/${id}">Buka latihan →</a>
    </article>`;
  }

  function renderLabs(id) {
    const lab = id ? data.labs[id] : null;
    if (id && !lab) return false;
    document.querySelector('#main').innerHTML = /* HTML */ `<div
      class="page-container scroll-reveal"
    >
      <div class="breadcrumbs">
        <a href="#/">Beranda</a><span>›</span><a href="#/latihan">Latihan terminal</a>${lab
          ? /* HTML */ `<span>›</span><strong>${esc(lab.title)}</strong>`
          : ''}
      </div>
      <div class="eyebrow">DARI ILUSTRASI KE REPOSITORY SUNGGUHAN</div>
      <h1 class="page-title">${lab ? esc(lab.title) : 'Buka terminal. Bangun pemahaman.'}</h1>
      <p class="page-intro">
        ${lab
          ? esc(lab.goal)
          : `${Object.keys(data.labs).length} skenario Kopi Kita. Setiap latihan membuat folder baru, dengan keadaan awal yang dapat diulang dan checker untuk memeriksa hasil.`}
      </p>
      <div class="lab-download">
        ${download}<span>ZIP · Git 2.34+ · Node.js 22+ · tanpa npm install</span>
      </div>
      <section class="lesson-section lab-setup">
        <h2>Mulai dari folder latihan yang baru.</h2>
        <ol>
          <li>Ekstrak paket dan buka terminal pada folder hasil ekstraksi.</li>
          <li>Periksa Git dan Node tersedia.${commandBlock('git --version\nnode --version')}</li>
          <li>
            Mulai skenario. Generator mencetak path repo dan command
            pemeriksaan.${commandBlock(`node git-lab.cjs start ${id || 'staging'}`)}
          </li>
          <li>
            Jalankan <code>cd</code> sesuai path yang dicetak. Edit file memakai editor, lalu
            praktikkan command Git.
          </li>
          <li>
            Sesudah latihan, jalankan command <code>check</code> yang dicetak. Checker memeriksa isi
            file, index, branch, commit, atau stash sesuai tujuan.
          </li>
        </ol>
        <div class="notice">
          <span>↳</span>
          <p>
            Remote latihan adalah server bare di folder lokal. Tidak ada akun, token, atau push
            internet yang diperlukan. Setiap start membuat folder unik; latihan sebelumnya tidak
            dihapus. Sebelum reset/clean/restore, periksa bahwa terminal sedang di repo latihan yang
            benar.
          </p>
        </div>
      </section>
      ${lab
        ? /* HTML */ `<section class="lesson-section terminal-lab-panel">
            <h2>Tantanganmu</h2>
            <p>${esc(lab.goal)}</p>
            <details>
              <summary>Petunjuk bertahap</summary>
              <ol>
                ${lab.hints.map((hint) => /* HTML */ `<li>${esc(hint)}</li>`).join('')}
              </ol>
            </details>
            <details class="exercise-solution">
              <summary>Lihat pembahasan</summary>
              ${commandBlock(lab.solution)}
              <p>${esc(lab.explanation)}</p>
            </details>
            <p class="lab-context">
              Checker menilai keadaan akhir, bukan merekam semua command. Beberapa latihan observasi
              atau pembatalan dapat berakhir sama seperti awal. Tetap lakukan pengamatan di tengah
              proses.
            </p>
            <a class="text-button" href="${href(lab.lesson)}">Baca konsep dan kasus terkait →</a>
          </section>`
        : /* HTML */ `<div class="section-heading">
              <div>
                <h2>Pilih situasi yang ingin kamu coba.</h2>
                <p>Buat folder baru setiap kali ingin mengulang kondisi awal.</p>
              </div>
            </div>
            <div class="reference-grid">
              ${Object.entries(data.labs)
                .map(([id, lab]) => labCard(id, lab))
                .join('')}
            </div>`}
    </div>`;
    return true;
  }

  document.addEventListener('click', (event) => {
    const resolution = event.target.closest('[data-resolve-value]');
    if (resolution) {
      document.querySelector('#conflict-preview').textContent = resolution.dataset.resolveValue;
      document.querySelector('#conflict-note').textContent =
        'Hasil pilihan sudah mengganti marker pada ilustrasi. Di Git sungguhan, uji hasil, jalankan add pada file yang selesai, lalu lanjutkan proses yang sesuai. Konflik stash tidak memiliki stash --continue.';
      return;
    }
    const target = event.target.closest('[data-flow-step]');
    if (!target || !currentFlow) return;
    const step = Number(target.dataset.flowStep);
    if (step < 0 || step >= root.GitGuidesVisuals.scenarios[currentFlow].frames.length) return;
    flowStep = step;
    renderFlow();
  });
  root.GitGuidesLearning = { enhanceLesson, renderLabs };
})(window);
