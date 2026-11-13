export default (context) => {
  const {
    data,
    chapters,
    lessons,
    esc,
    inline,
    href,
    cup,
    bookmarkIcon,
    crumbs,
    commandBlock,
    quizHTML,
    preparation,
    verification,
    terminalLab,
    sources,
    visual,
    conflict,
  } = context;
  function browserPractice(lesson) {
    if (
      ![
        'stash',
        'stash-untracked',
        'apply-pop',
        'stash-konflik',
        'staging',
        'status-singkat',
        'partial-staging',
        'commit-atomik',
        'branch',
        'kelola-branch',
      ].includes(lesson.id)
    )
      return '';
    return `<a class="text-button" href="/playground/?scenario=${['branch', 'kelola-branch'].includes(lesson.id) ? 'branch' : lesson.visual === 'stash' ? 'stash' : lesson.visual === 'conflict' ? 'conflict' : 'staging'}">Buka latihan fondasi di browser →</a>`;
  }

  // Membuat isi H1 halaman materi dari lesson.title. Dipanggil dari lessonPage().
  // Materi stash adalah halaman contoh utama, jadi bagian judul setelah ": " diberi
  // aksen warna di baris kedua. Teksnya tetap diambil dari JSON supaya judul di H1,
  // tab browser, dan metadata selalu sama. Output berupa HTML yang sudah di-escape.
  function lessonHeading(lesson) {
    const separator = lesson.title.indexOf(': ');
    if (lesson.id !== 'stash' || separator === -1) return esc(lesson.title);
    const lead = lesson.title.slice(0, separator + 1);
    const accent = lesson.title.slice(separator + 2);
    return `${esc(lead)}<br/><span class="title-accent">${esc(accent)}</span>`;
  }

  // Membuat bagian "Lihat dulu alurnya" berisi diagram materi. Dipanggil dari lessonPage()
  // hanya untuk materi yang visual-nya bukan "none". Judul dan pengantar khusus disediakan
  // untuk diagram interaktif stash dan staging; diagram lain memakai teks umum.
  function visualSection(lesson) {
    const heading =
      lesson.visual === 'stash'
        ? 'Pekerjaanmu pindah ke mana?'
        : lesson.visual === 'staging'
          ? 'Dari file kerja ke snapshot.'
          : 'Gambaran besarnya.';
    const intro =
      lesson.visual === 'stash'
        ? 'Klik setiap langkah. Perhatikan file di meja kerja dan simpanan di laci stash.'
        : lesson.visual === 'staging'
          ? 'Perhatikan perbedaan file kerja, isi index, dan snapshot yang sudah direkam.'
          : 'Gunakan gambaran ini sambil membaca konsep dan contoh di bawah.';
    return /* HTML */ `<section id="visualisasi" class="lesson-section">
      <div class="section-kicker">01 / LIHAT DULU ALURNYA</div>
      <h2>${heading}</h2>
      <p>${intro}</p>
      <div id="lesson-visual">${visual(lesson)}</div>
    </section>`;
  }

  function lessonPage(lesson, options = {}) {
    const completed = options.completed || new Set(),
      bookmarks = options.bookmarks || new Set();
    const chapter = chapters.find((chapter) => chapter.id === lesson.chapter),
      index = lessons.indexOf(lesson),
      previous = lessons[index - 1],
      next = lessons[index + 1];
    const title = lessonHeading(lesson);
    // Materi dengan visual "none" tidak punya bagian diagram. Nomor kicker tiap bagian
    // ikut bergeser supaya urutannya tetap 01, 02, 03 tanpa loncatan.
    const hasVisual = lesson.visual !== 'none';
    const kicker = (number, label) =>
      `${String(hasVisual ? number : number - 1).padStart(2, '0')} / ${label}`;
    const toc = [
      ['situasi', 'Situasinya begini'],
      ...(hasVisual ? [['visualisasi', 'Lihat alurnya']] : []),
      ['konsep', 'Pahami konsepnya'],
      ['langkah', 'Coba langkahnya'],
      ['perhatian', 'Yang perlu diingat'],
      ['latihan', 'Giliranmu mencoba'],
      ['sumber', 'Baca lebih lanjut'],
    ];
    toc.splice(1, 0, ['persiapan', 'Sebelum mulai']);
    if (lesson.id === 'kenalan-git')
      toc.unshift(['proyek-latihan', 'Kenalan dengan proyek contoh']);
    return /* HTML */ `<div class="lesson-layout scroll-reveal">
      <article class="lesson">
        ${crumbs([
          ['Jalur belajar', '/roadmap'],
          [`Bab ${String(lesson.chapter).padStart(2, '0')}`, `/bab/${lesson.chapter}`],
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
        ${
          lesson.id === 'kenalan-git'
            ? /* HTML */ `<section id="proyek-latihan" class="lesson-section">
                <h2>Kenalan dulu dengan Kopi Kita.</h2>
                <p>
                  Sepanjang panduan ini, kita memakai proyek contoh bernama
                  <strong>Kopi Kita</strong>: website sederhana untuk kedai kopi fiktif. Bayangkan
                  kamu ikut mengurus menu, mengubah harga, dan menambahkan fitur diskon pada website
                  itu.
                </p>
                <p>Contoh file yang akan kita pakai:</p>
                <ul>
                  <li><code>menu.json</code> menyimpan harga minuman.</li>
                  <li><code>diskon.js</code> menyimpan nilai diskon.</li>
                </ul>
                <p>
                  Untuk sekarang, cukup ikuti ceritanya. Di bab 1 kamu menyiapkan Git dan folder
                  <code>kopi-kita</code>, lalu di bab 2 kamu membuat kedua file itu dari awal dan
                  menyimpannya sebagai commit pertama. Perubahan pada file-file inilah yang akan
                  kita catat dan telusuri dengan Git.
                </p>
              </section>`
            : ''
        }
        <section id="situasi" class="scenario">
          <div class="scenario-icon">${cup}</div>
          <div>
            <div class="scenario-label">BAYANGKAN SITUASI INI</div>
            <h2>
              ${
                lesson.id === 'stash'
                  ? 'Lagi asyik bikin fitur. Tiba-tiba, ada bug.'
                  : lesson.id === 'kenalan-git'
                    ? 'Menu berubah. Salinannya makin banyak.'
                    : 'Satu masalah dari proyek latihan Kopi Kita.'
              }
            </h2>
            <p>${inline(lesson.scenario)}</p>
          </div>
        </section>
        ${preparation(lesson)} ${hasVisual ? visualSection(lesson) : ''}
        <section id="konsep" class="lesson-section">
          <div class="section-kicker">${kicker(2, 'PAHAMI IDE DI BALIKNYA')}</div>
          <h2>
            ${
              lesson.id === 'stash'
                ? 'Anggap saja laci di meja kerjamu.'
                : 'Kenali konsepnya, bukan cuma sintaksnya.'
            }
          </h2>
          <p>${inline(lesson.concept)}</p>
          <div class="analogy">
            <div class="analogy-label">KALAU DI KEHIDUPAN SEHARI-HARI…</div>
            <p>${esc(lesson.analogy)}</p>
          </div>
        </section>
        <section id="langkah" class="lesson-section">
          <div class="section-kicker">${kicker(3, 'SEKARANG, COBA SENDIRI')}</div>
          <h2>Satu langkah pada satu waktu.</h2>
          <p>
            ${
              lesson.lab
                ? 'Gunakan repository latihan. Nama file dan branch mengikuti skenario; sesuaikan dengan keadaan awalmu. Baris output dan hash di komputermu dapat berbeda.'
                : 'Jalankan langkah berikut di terminalmu sendiri, berurutan dari atas. Baris output dan hash di komputermu dapat berbeda dari contoh.'
            }
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
        ${
          lesson.visual === 'stash'
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
            : ''
        }
        ${verification(lesson)}
        <section id="perhatian" class="lesson-section">
          <div class="section-kicker">${kicker(4, 'SEBELUM TERBURU-BURU')}</div>
          <h2>Yang sering bikin tersandung.</h2>
          <div class="notice">
            <span aria-hidden="true">↳</span>
            <p>${inline(lesson.pitfall)}</p>
          </div>
        </section>
        <section id="latihan" class="lesson-section">
          <div class="section-kicker">${kicker(5, 'SEKARANG GILIRANMU')}</div>
          <h2>Dari “oh, paham” ke “bisa pakai”.</h2>
          <p>${inline(lesson.practice)}</p>
          ${terminalLab(lesson)}${quizHTML(lesson)}${browserPractice(lesson)}
        </section>
        <section id="sumber" class="lesson-section">
          <h3>Masih penasaran?</h3>
          <div class="lesson-sources">${sources(lesson)}</div>
        </section>
        <div class="lesson-complete">
          <button class="button" id="complete-lesson" aria-pressed="${completed.has(lesson.id)}">
            ${completed.has(lesson.id) ? '✓ Sudah dipahami' : 'Tandai sudah dipahami'}
            <span>✓</span></button
          ><span class="completion-hint">Bisa kamu ubah kapan saja.</span>
        </div>
        <nav class="lesson-pagination" aria-label="Materi lain">
          ${
            previous
              ? /* HTML */ `<a class="pagination-link" href="${href(previous.id)}"
                  ><small>← SEBELUMNYA</small><span>${esc(previous.title)}</span></a
                >`
              : '<div></div>'
          }${
            next
              ? /* HTML */ `<a class="pagination-link next" href="${href(next.id)}"
                  ><small>SELANJUTNYA →</small><span>${esc(next.title)}</span></a
                >`
              : /* HTML */ `<a class="pagination-link next" href="/roadmap"
                  ><small>PERJALANAN BERIKUTNYA →</small><span>Lihat peta belajarmu</span></a
                >`
          }
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
                  href="${href(lesson.id)}#${id}"
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
  }

  return { browserPractice, lessonPage };
};
