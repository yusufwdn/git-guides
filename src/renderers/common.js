export default (context) => {
  const { data, chapters, lessons, esc, href, flow } = context;
  function crumbs(parts) {
    return /* HTML */ `<div class="breadcrumbs">
      <a href="/">Beranda</a>${parts
        .map(
          ([label, url]) =>
            /* HTML */ `<span class="crumb-divider" aria-hidden="true">›</span>${
                url
                  ? /* HTML */ `<a href="${url}">${esc(label)}</a>`
                  : /* HTML */ `<strong>${esc(label)}</strong>`
              }`,
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
    const main = renderQuiz(lesson.quiz, 'quiz-form', 'CEK PEMAHAMANMU');
    return (
      main +
      (lesson.checkpoint
        ? renderQuiz(lesson.checkpoint, 'checkpoint-form', 'TANTANGAN PENUTUP BAB')
        : '')
    );
  }

  function renderQuiz(quiz, formId, label) {
    return /* HTML */ `<div class="quiz-card">
      <div class="quiz-eyebrow">${label}</div>
      <h3 id="${formId}-question">${esc(quiz.question)}</h3>
      <form id="${formId}" aria-labelledby="${formId}-question">
        <div class="quiz-options">
          ${quiz.options
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
        <div
          class="quiz-feedback"
          id="${formId === 'quiz-form' ? 'quiz-feedback' : 'checkpoint-feedback'}"
          role="status"
        ></div>
      </form>
      <noscript>
        <details class="exercise-solution">
          <summary>Baca pembahasan kuis</summary>
          <p>${esc(quiz.explanation)}</p>
        </details>
      </noscript>
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

  function fileChip(path, description, status = 'M', stash = false) {
    return /* HTML */ `<div class="file-chip ${stash ? 'stash-chip' : ''}">
      <span class="file-icon" aria-hidden="true"></span
      ><span>${esc(path)}${description ? /* HTML */ `<small>${esc(description)}</small>` : ''}</span
      >${status ? /* HTML */ `<span class="file-status">${esc(status)}</span>` : ''}
    </div>`;
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

  function chapterCard(chapter, completed = new Set()) {
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

  function graphHTML(graph) {
    const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
    const edges = graph.nodes
      .flatMap((node) =>
        node.parents.map((parent) => {
          const previous = nodes.get(parent);
          return /* HTML */ `<path
            d="M${previous.x} ${previous.y} C${
              (previous.x + node.x) / 2
            } ${previous.y},${(previous.x + node.x) / 2} ${node.y},${node.x} ${node.y}"
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

  function labCard(id, lab) {
    return /* HTML */ `<article class="reference-card">
      <div class="quiz-eyebrow">TERMINAL ASLI · ${esc(id)}</div>
      <h3>${esc(lab.title)}</h3>
      <p>${esc(lab.goal)}</p>
      <a href="/latihan/${id}">Buka latihan →</a>
    </article>`;
  }

  function preparation(lesson) {
    return (
      '<section id="persiapan" class="lesson-section preparation-panel">' +
      `<div class="section-kicker">SEBELUM MULAI</div>
      <h2>Pastikan titik awalnya jelas.</h2>
      <p>${esc(lesson.initialState)}</p>
      ${lesson.preparationURL ? `<a class="text-button" href="${esc(lesson.preparationURL)}">Belum pasang Git? Ikuti halaman persiapan →</a>` : ''}
      <details class="lesson-objectives">
        <summary>Yang akan kamu pahami</summary>
        <ul>
          ${lesson.objectives.map((goal) => /* HTML */ `<li>${esc(goal)}</li>`).join('')}
        </ul>
      </details>
      ${
        lesson.prerequisites.length
          ? /* HTML */ `<div class="prerequisites">
              <span>Bekal sebelumnya:</span>${lesson.prerequisites
                .map((id) => {
                  const item = data.lessons.find((item) => item.id === id);
                  return /* HTML */ `<a href="${href(id)}">${esc(item.title)} ↗</a>`;
                })
                .join('')}
            </div>`
          : ''
      }` +
      '</section>'
    );
  }

  function verification(lesson) {
    return (
      '<div class="verification-panel">' +
      `<h3>Periksa hasilnya, jangan cuma pesan suksesnya.</h3>
      ${commandBlock(lesson.verification.command)}
      <p>${esc(lesson.verification.explanation)}</p>` +
      '</div>'
    );
  }

  // Panel latihan pendamping dari paket ZIP. Dipanggil dari lessonPage().
  // Langkah setiap materi dijalankan di repo kopi-kita milik pembaca. Paket latihan cuma
  // dipasang di materi yang isinya cocok, jadi field lab boleh kosong dan panelnya tidak dirender.
  function terminalLab(lesson) {
    if (!lesson.lab) return '';
    const lab = data.labs[lesson.lab];
    return (
      '<div class="terminal-lab-panel" data-lab="' +
      esc(lesson.lab) +
      '">' +
      `<div class="quiz-eyebrow">
        LATIHAN PENDAMPING DI TERMINAL ASLI
      </div>
      <h3>${esc(lab.title)}</h3>
      <p>${esc(lab.goal)}</p>
      <p class="lab-context">
        Latihan ini terpisah dari repo kopi-kita milikmu dan punya kondisi awalnya sendiri. Buat
        folder latihannya dengan command di bawah, lalu kerjakan di sana.
      </p>
      ${commandBlock(`node git-lab.cjs start ${lesson.lab}`)}<a
        class="text-button"
        href="/latihan/${lesson.lab}"
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
      </details>` +
      '</div>'
    );
  }

  function sources(lesson) {
    return (
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
        ><a href="/glosarium">Glosarium ↗</a>`
    );
  }

  function sidebar(currentLesson, completed = new Set()) {
    let lastGroup = '';
    return chapters
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
            ><span>${esc(chapter.title)}</span>${
              active
                ? '<span class="active-dot" aria-hidden="true"></span>'
                : done
                  ? '<span class="done-marker" aria-label="Bab selesai">✓</span>'
                  : ''
            }</a
          >`;
      })
      .join('');
  }

  return {
    crumbs,
    commandBlock,
    quizHTML,
    homeGraph,
    fileChip,
    graphSVG,
    chapterCard,
    graphHTML,
    labCard,
    preparation,
    verification,
    terminalLab,
    sources,
    sidebar,
  };
};
