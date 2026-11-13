export default (context) => {
  const {
    data,
    chapters,
    lessons,
    glossary,
    problems,
    esc,
    href,
    download,
    scenarioInfo,
    crumbs,
    commandBlock,
    homeGraph,
    chapterCard,
    labCard,
    visual,
    conflict,
  } = context;
  function home(options = {}) {
    const completed = options.completed || new Set();
    const last = options.lastLesson || 'kenalan-git';
    const resume = lessons.find((lesson) => lesson.id === last) || lessons[0];
    return /* HTML */ `<div class="page-container scroll-reveal">
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
      <div class="notice">
        <span>↳</span>
        <p>
          Belum memasang Git?
          <a href="/persiapan/">Pasang Git dan kenali terminal</a> sebelum mengikuti contoh command.
        </p>
      </div>
      <div class="section-heading">
        <div>
          <h2>Mulai dari tempatmu sekarang.</h2>
          <p>Belum pernah commit atau sudah sering nge-push? Ada jalan buatmu.</p>
        </div>
        <a href="/roadmap">Lihat 16 bab <span>↗</span></a>
      </div>
      <div class="learning-paths">
        <a class="path-card" href="${href('kenalan-git')}"
          ><div class="path-icon" aria-hidden="true">⌁</div>
          <h3>Aku baru mulai</h3>
          <p>
            Dari “Git itu apa?” sampai commit pertamamu. Pelan-pelan, dengan fondasi yang jelas.
          </p>
          <small>BAB 01–04 · FONDASI</small><span class="path-arrow">↗</span></a
        ><a class="path-card" href="/masalah"
          ><div class="path-icon" aria-hidden="true">⌘</div>
          <h3>Aku lagi ada masalah</h3>
          <p>
            Salah commit, push ditolak, atau perlu jeda kerja? Cari jalan keluar sesuai keadaanmu.
          </p>
          <small>BELAJAR DARI KASUS</small><span class="path-arrow">↗</span></a
        ><a class="path-card" href="/playground"
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
          <p id="learning-summary">
            ${completed.size} dari ${lessons.length} materi sudah kamu tandai selesai. Progres
            tersimpan di perangkat ini.
          </p>
        </div>
        <a id="resume-learning" href="${href(resume.id)}"
          >${completed.size ? 'Lanjutkan belajar' : 'Coba bab pilihan'} →</a
        >
      </div>
    </div>`;
  }

  function roadmap(id, options = {}) {
    const bookmarks = options.bookmarks || new Set(),
      completed = options.completed || new Set();
    const chosen = id ? chapters.filter((chapter) => chapter.id === Number(id)) : chapters;
    return /* HTML */ `<div class="page-container scroll-reveal">
      ${crumbs([['Peta perjalanan']])}
      <div class="eyebrow">SATU LANGKAH PADA SATU WAKTU</div>
      <h1 class="page-title">${id ? esc(chosen[0].title) : 'Dari penasaran, jadi paham.'}</h1>
      <p class="page-intro">
        ${
          id
            ? esc(chosen[0].description)
            : `${chapters.length} bab, ${lessons.length} materi. Mulai dari fondasi, berlatih lewat kasus, lalu menyelam lebih dalam. Pilih titik awal yang sesuai denganmu.`
        }
      </p>
      <section class="progress-tools" aria-labelledby="progress-tools-title">
        <h2 id="progress-tools-title">Progres dan materi simpanan.</h2>
        <p id="learning-summary">
          Progres disimpan di browser ini. Ekspor berkas untuk mencadangkan atau memindahkannya ke
          perangkat lain.
        </p>
        <button class="button secondary small" id="export-progress">Ekspor progres</button>
        <label class="import-progress-label"
          >Impor progres <input id="import-progress" type="file" accept="application/json,.json"
        /></label>
        <p>
          Impor mengganti progres lokal dengan isi berkas. Ekspor dahulu jika ingin menyimpan
          keadaan saat ini.
        </p>
        <div id="saved-lessons" class="saved-lessons"></div>
      </section>
      <div class="roadmap-grid">
        ${chosen.map((chapter) => chapterCard(chapter, completed)).join('')}
      </div>
      ${
        bookmarks.size
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
          : ''
      }
    </div>`;
  }

  function reference() {
    return /* HTML */ `<div class="page-container scroll-reveal">
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
      /><a class="text-button" href="/glosarium">Buka glosarium istilah ↗</a>
      <div class="reference-grid" id="reference-results">${referenceCards()}</div>
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
  }

  function referenceCards(term = '') {
    const results = lessons.filter((lesson) =>
      [lesson.title, lesson.summary, lesson.scenario, ...lesson.commands]
        .join(' ')
        .toLowerCase()
        .includes(term.toLowerCase()),
    );
    return results.length
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

  function problemsPage() {
    return /* HTML */ `<div class="page-container scroll-reveal">
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

  function glossaryPage() {
    return /* HTML */ `<div class="page-container scroll-reveal">
      ${crumbs([['Referensi', '/referensi'], ['Glosarium']])}
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
      <dl class="glossary-list" id="glossary-results">${glossaryEntries()}</dl>
    </div>`;
  }

  function glossaryEntries(term = '') {
    const results = glossary.filter((item) =>
      item.join(' ').toLowerCase().includes(term.toLowerCase()),
    );
    return results.length
      ? results
          .map(
            ([term, definition]) =>
              /* HTML */ `<div
                class="glossary-item"
                id="${esc(term.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}"
              >
                <dt>${esc(term)}</dt>
                <dd>${esc(definition)}</dd>
              </div>`,
          )
          .join('')
      : '<div class="results-empty">Istilah belum ditemukan.</div>';
  }

  function playgroundPage(scenario) {
    const sandboxScenario = Object.hasOwn(scenarioInfo, scenario) ? scenario : 'stash';
    const info = scenarioInfo[sandboxScenario];
    return /* HTML */ `<div class="page-container scroll-reveal">
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
        <option value="branch" ${sandboxScenario === 'branch' ? 'selected' : ''}>
          04 · Commit pada branch baru
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
  }

  function notFound() {
    return /* HTML */ `<div class="page-container">
      ${crumbs([['Halaman tidak ditemukan']])}
      <div class="eyebrow">JALURNYA BELUM KETEMU</div>
      <h1 class="page-title">Kembali ke peta dulu?</h1>
      <p class="page-intro">
        Materi pada alamat ini tidak ditemukan. Pilih pelajaran dari peta atau cari berdasarkan
        masalahmu.
      </p>
      <a class="button" href="/roadmap">Buka peta belajar →</a>
    </div>`;
  }

  function labsPage(id) {
    const lab = id ? data.labs[id] : null;
    return /* HTML */ `<div class="page-container scroll-reveal">
      <div class="breadcrumbs">
        <a href="/">Beranda</a><span>›</span><a href="/latihan">Latihan terminal</a>${
          lab ? /* HTML */ `<span>›</span><strong>${esc(lab.title)}</strong>` : ''
        }
      </div>
      <div class="eyebrow">DARI ILUSTRASI KE REPOSITORY SUNGGUHAN</div>
      <h1 class="page-title">${lab ? esc(lab.title) : 'Buka terminal. Bangun pemahaman.'}</h1>
      <p class="page-intro">
        ${
          lab
            ? esc(lab.goal)
            : `${Object.keys(data.labs).length} skenario Kopi Kita. Setiap latihan membuat folder baru, dengan keadaan awal yang dapat diulang dan checker untuk memeriksa hasil.`
        }
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
      ${
        lab
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
                Checker menilai keadaan akhir, bukan merekam semua command. Beberapa latihan
                observasi atau pembatalan dapat berakhir sama seperti awal. Tetap lakukan pengamatan
                di tengah proses.
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
              </div>`
      }
    </div>`;
  }

  return {
    home,
    roadmap,
    reference,
    referenceCards,
    problemsPage,
    glossaryPage,
    glossaryEntries,
    playgroundPage,
    notFound,
    labsPage,
  };
};
